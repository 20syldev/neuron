export interface Model {
    w1: Float32Array;
    b1: Float32Array;
    w2: Float32Array;
    b2: Float32Array;
    w3: Float32Array;
    b3: Float32Array;
}

export interface Inference {
    hidden1: Float32Array;
    hidden2: Float32Array;
    probs: Float32Array;
}

export const INPUT_SIZE = 784;
export const HIDDEN_SIZE = 256;
export const OUTPUT_SIZE = 10;

export const MODEL_URL = "/models/digit.bin";
const MODEL_BYTES = 2 * (784 * 256 + 256 + 256 * 256 + 256 + 256 * 10 + 10);
const SCALE = 1e-4;

let cached: Promise<Model> | null = null;

/**
 * Reads count little-endian int16 values and dequantises them.
 *
 * @param view - View over the whole binary file
 * @param offset - Byte offset of the first value
 * @param count - Number of int16 values to read
 * @returns The values multiplied by the quantisation scale
 */
function readTensor(view: DataView, offset: number, count: number): Float32Array {
    const values = new Float32Array(count);

    for (let index = 0; index < count; index++) {
        values[index] = view.getInt16(offset + index * 2, true) * SCALE;
    }

    return values;
}

/**
 * Splits the binary file into the six tensors of the network.
 *
 * @param buffer - Content of digit.bin, int16 little endian at scale 1e-4, order W1, B1, W2, B2,
 *   W3, B3
 * @returns The dequantised model: w1 (784 x 256), w2 (256 x 256) and w3 (256 x 10) row-major, the weight from input i to neuron j sitting at index i * columns + j, with the biases b1 and b2 (256 values each) and b3 (10 values)
 * @throws When the buffer does not have the expected size
 */
export function parseModel(buffer: ArrayBuffer): Model {
    if (buffer.byteLength !== MODEL_BYTES) {
        throw new Error(`Unexpected model size: ${buffer.byteLength} bytes, wanted ${MODEL_BYTES}`);
    }

    const view = new DataView(buffer);
    const sizes = [
        INPUT_SIZE * HIDDEN_SIZE,
        HIDDEN_SIZE,
        HIDDEN_SIZE * HIDDEN_SIZE,
        HIDDEN_SIZE,
        HIDDEN_SIZE * OUTPUT_SIZE,
        OUTPUT_SIZE,
    ];
    let offset = 0;

    const [w1, b1, w2, b2, w3, b3] = sizes.map((size) => {
        const tensor = readTensor(view, offset, size);
        offset += size * 2;

        return tensor;
    });

    return { w1, b1, w2, b2, w3, b3 };
}

/**
 * Downloads and parses the network weights once; later calls share the same promise.
 *
 * A failed download is not cached, so a later call retries.
 *
 * @returns A promise of the model, rejected when the file is missing or malformed
 */
export function loadModel(): Promise<Model> {
    if (!cached) {
        cached = fetch(MODEL_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Model request failed: ${response.status}`);
                }

                return response.arrayBuffer();
            })
            .then(parseModel)
            .catch((error: unknown) => {
                cached = null;
                throw error;
            });
    }

    return cached;
}

/**
 * Dense layer followed by ReLU, written into out.
 *
 * The weight matrix is read input by input so every access is sequential, and inputs equal to
 * zero are skipped, which is most of them for a drawn digit.
 *
 * @param input - Layer input
 * @param weights - Weights, input-major with one row of size values per input
 * @param biases - Biases, one per output
 * @param out - Destination, one value per output
 * @param size - Number of outputs
 */
function denseRelu(
    input: Float32Array,
    weights: Float32Array,
    biases: Float32Array,
    out: Float32Array,
    size: number,
): void {
    const sums = Float64Array.from(biases);

    for (let i = 0; i < input.length; i++) {
        const value = input[i];

        if (value === 0) {
            continue;
        }

        const row = i * size;

        for (let j = 0; j < size; j++) {
            sums[j] += value * weights[row + j];
        }
    }

    for (let j = 0; j < size; j++) {
        out[j] = sums[j] > 0 ? sums[j] : 0;
    }
}

/**
 * Softmax of the output layer logits, shifted by the maximum so exp never overflows.
 *
 * @param input - Hidden layer 2 activations
 * @param model - Network weights, w3 and b3 are read
 * @returns Probabilities of the ten digits
 */
function outputProbs(input: Float32Array, model: Model): Float32Array {
    const logits = Float64Array.from(model.b3);

    for (let i = 0; i < input.length; i++) {
        const value = input[i];

        if (value === 0) {
            continue;
        }

        for (let j = 0; j < OUTPUT_SIZE; j++) {
            logits[j] += value * model.w3[i * OUTPUT_SIZE + j];
        }
    }

    const top = logits.reduce((max, value) => Math.max(max, value), -Infinity);
    const exps = logits.map((value) => Math.exp(value - top));
    const total = exps.reduce((sum, value) => sum + value, 0);

    return Float32Array.from(exps, (value) => value / total);
}

/**
 * Runs the network 784-256-256-10 on one input.
 *
 * @param model - Network weights from loadModel
 * @param input - 784 grayscale values in 0..1, row-major, 1 being ink
 * @returns Both hidden activations after ReLU (256 values each) and the softmax probabilities of the ten digits, summing to 1
 */
export function forward(model: Model, input: Float32Array): Inference {
    const hidden1 = new Float32Array(HIDDEN_SIZE);
    const hidden2 = new Float32Array(HIDDEN_SIZE);

    denseRelu(input, model.w1, model.b1, hidden1, HIDDEN_SIZE);
    denseRelu(hidden1, model.w2, model.b2, hidden2, HIDDEN_SIZE);

    return { hidden1, hidden2, probs: outputProbs(hidden2, model) };
}

/**
 * Index of the largest value of an array, the first one on a tie.
 *
 * @param values - Non-empty list of numbers
 * @returns The index of the maximum
 */
function argmax(values: Float32Array): number {
    let best = 0;

    for (let i = 1; i < values.length; i++) {
        if (values[i] > values[best]) {
            best = i;
        }
    }

    return best;
}

/**
 * Digit the network believes it sees.
 *
 * @param inference - Result of forward
 * @returns The digit 0 to 9 with the highest probability
 */
export function predicted(inference: Inference): number {
    return argmax(inference.probs);
}

/**
 * Receptive field of one first layer neuron: the 784 weights it applies to the pixels.
 *
 * @param model - Network weights from loadModel
 * @param neuron - Index of the neuron in the first hidden layer, 0 to 255
 * @returns The weights scaled by their largest magnitude so they span -1 to 1, all zeros when
 *   the neuron has no weight
 */
export function fieldOf(model: Model, neuron: number): Float32Array {
    const field = new Float32Array(INPUT_SIZE);
    let peak = 0;

    for (let i = 0; i < INPUT_SIZE; i++) {
        field[i] = model.w1[i * HIDDEN_SIZE + neuron];
        peak = Math.max(peak, Math.abs(field[i]));
    }

    if (peak > 0) {
        for (let i = 0; i < INPUT_SIZE; i++) {
            field[i] /= peak;
        }
    }

    return field;
}

/**
 * First layer neuron that responds the most to the current input.
 *
 * @param inference - Result of forward
 * @returns The index 0 to 255 of the largest first layer activation
 */
export function mostActive(inference: Inference): number {
    return argmax(inference.hidden1);
}
