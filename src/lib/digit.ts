export interface Point {
    x: number;
    y: number;
}

export type Stroke = Point[];

export const DIGIT_SIZE = 28;

const BOX = 20;
const CENTER = 14;
const THRESHOLD = 0.05;
const WORK_SIZE = 112;

/**
 * Converts RGBA pixels to ink intensities.
 *
 * Ink is the opacity times the darkness of the colour, so dark strokes on a transparent or white
 * background read as 1 and the background as 0, with antialiased edges kept as fractions.
 *
 * @param data - RGBA bytes, 4 per pixel
 * @param count - Number of pixels to read
 * @returns One ink value in 0..1 per pixel
 */
function inkOf(data: Uint8ClampedArray, count: number): Float32Array {
    const ink = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const offset = i * 4;
        const darkness = 1 - (data[offset] + data[offset + 1] + data[offset + 2]) / 765;

        ink[i] = (data[offset + 3] / 255) * darkness;
    }

    return ink;
}

/**
 * Mean of a rectangular region of a square image, weighting the border pixels by the fraction
 * of them the region covers, so any resize ratio is handled without aliasing.
 *
 * @param ink - Square image, row-major
 * @param size - Side of the image in pixels
 * @param left - Left edge of the region, in pixels, fractional allowed
 * @param top - Top edge of the region, in pixels, fractional allowed
 * @param width - Width of the region in pixels
 * @param height - Height of the region in pixels
 * @returns The area weighted average of the region
 */
function boxAverage(
    ink: Float32Array,
    size: number,
    left: number,
    top: number,
    width: number,
    height: number,
): number {
    const right = left + width;
    const bottom = top + height;
    let sum = 0;

    for (let y = Math.floor(top); y < Math.min(size, Math.ceil(bottom)); y++) {
        const rowOverlap = Math.min(y + 1, bottom) - Math.max(y, top);

        for (let x = Math.floor(left); x < Math.min(size, Math.ceil(right)); x++) {
            const overlap = Math.min(x + 1, right) - Math.max(x, left);

            sum += ink[y * size + x] * overlap * rowOverlap;
        }
    }

    return sum / (width * height);
}

/**
 * Turns an ink image into a network input, MNIST style.
 *
 * The ink is stretched to a peak of 1, cropped to the bounding box of the pixels above a small
 * threshold, resized to fit a 20 x 20 box without changing the aspect ratio (area averaging, peak
 * restored to 1), then pasted into a 28 x 28 image so the centre of mass lands on pixel (14, 14),
 * the paste position being clamped to keep the whole digit inside. An empty image gives zeros.
 *
 * @param ink - Square image of ink in 0..1, row-major, 1 being ink
 * @param size - Side of the image in pixels
 * @returns 784 values in 0..1, row-major
 */
export function preprocessInk(ink: Float32Array, size: number): Float32Array {
    const result = new Float32Array(DIGIT_SIZE * DIGIT_SIZE);
    const peak = ink.reduce((max, value) => Math.max(max, value), 0);

    if (peak <= 0) {
        return result;
    }

    let minX = size;
    let minY = size;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (ink[y * size + x] / peak > THRESHOLD) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
    }

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const ratio = BOX / Math.max(width, height);
    const outWidth = Math.max(1, Math.round(width * ratio));
    const outHeight = Math.max(1, Math.round(height * ratio));
    const stepX = width / outWidth;
    const stepY = height / outHeight;
    const small = new Float32Array(outWidth * outHeight);
    let smallPeak = 0;

    for (let y = 0; y < outHeight; y++) {
        for (let x = 0; x < outWidth; x++) {
            const value = boxAverage(ink, size, minX + x * stepX, minY + y * stepY, stepX, stepY);

            small[y * outWidth + x] = value;
            smallPeak = Math.max(smallPeak, value);
        }
    }

    let mass = 0;
    let massX = 0;
    let massY = 0;

    for (let y = 0; y < outHeight; y++) {
        for (let x = 0; x < outWidth; x++) {
            const value = small[y * outWidth + x];

            mass += value;
            massX += value * x;
            massY += value * y;
        }
    }

    const offsetX = clamp(Math.round(CENTER - massX / mass), 0, DIGIT_SIZE - outWidth);
    const offsetY = clamp(Math.round(CENTER - massY / mass), 0, DIGIT_SIZE - outHeight);

    for (let y = 0; y < outHeight; y++) {
        for (let x = 0; x < outWidth; x++) {
            const value = small[y * outWidth + x] / smallPeak;

            result[(y + offsetY) * DIGIT_SIZE + x + offsetX] = clamp(value, 0, 1);
        }
    }

    return result;
}

/**
 * Limits a number to a range.
 *
 * @param value - Number to limit
 * @param min - Lower bound
 * @param max - Upper bound, expected to be at least min
 * @returns The value, or the nearest bound
 */
function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

/**
 * Prepares a canvas bitmap for the network, MNIST style.
 *
 * The legacy page averaged the 280 px canvas down to 28 x 28 and shifted it by the floor of the
 * unweighted mean of the inked pixels. This version follows the MNIST recipe instead: crop to the
 * drawing, fit 20 x 20 keeping the aspect ratio, then centre by the weighted centre of mass in
 * 28 x 28. Digits drawn small or off centre are therefore normalised the way the training data
 * was. Dark strokes on a transparent or light background are expected.
 *
 * @param pixels - Square RGBA bitmap, ImageData or the raw bytes of one
 * @param size - Side of the bitmap in pixels
 * @returns 784 grayscale values in 0..1, row-major, 1 being ink
 * @throws When the bitmap does not hold size * size pixels
 */
export function preprocess(pixels: ImageData | Uint8ClampedArray, size: number): Float32Array {
    const data = pixels instanceof Uint8ClampedArray ? pixels : pixels.data;

    if (data.length !== size * size * 4) {
        throw new Error(
            `Expected ${size * size * 4} bytes for ${size} x ${size}, got ${data.length}`,
        );
    }

    return preprocessInk(inkOf(data, size * size), size);
}

/**
 * Distance from a point to a segment, which is a plain point distance when the segment is
 * degenerate.
 *
 * @param px - Point abscissa
 * @param py - Point ordinate
 * @param ax - Segment start abscissa
 * @param ay - Segment start ordinate
 * @param bx - Segment end abscissa
 * @param by - Segment end ordinate
 * @returns The shortest distance, in the unit of the coordinates
 */
function distanceToSegment(
    px: number,
    py: number,
    ax: number,
    ay: number,
    bx: number,
    by: number,
): number {
    const dx = bx - ax;
    const dy = by - ay;
    const length = dx * dx + dy * dy;
    const t = length === 0 ? 0 : clamp(((px - ax) * dx + (py - ay) * dy) / length, 0, 1);

    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/**
 * Draws one segment with round caps into an ink image, keeping the strongest value per pixel.
 *
 * @param ink - Square image to draw into, row-major
 * @param size - Side of the image in pixels
 * @param a - Segment start, in image pixels
 * @param b - Segment end, in image pixels
 * @param radius - Half the line width, in image pixels
 */
function stampSegment(ink: Float32Array, size: number, a: Point, b: Point, radius: number): void {
    const x0 = Math.max(0, Math.floor(Math.min(a.x, b.x) - radius - 1));
    const x1 = Math.min(size - 1, Math.ceil(Math.max(a.x, b.x) + radius + 1));
    const y0 = Math.max(0, Math.floor(Math.min(a.y, b.y) - radius - 1));
    const y1 = Math.min(size - 1, Math.ceil(Math.max(a.y, b.y) + radius + 1));

    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            const distance = distanceToSegment(x + 0.5, y + 0.5, a.x, a.y, b.x, b.y);
            const coverage = clamp(radius - distance + 0.5, 0, 1);
            const index = y * size + x;

            if (coverage > ink[index]) {
                ink[index] = coverage;
            }
        }
    }
}

/**
 * Incremental raster of one stroke, kept between frames so a stroke that grows by a few points is
 * not redrawn from its first point.
 */
interface StrokeInk {
    signature: string;
    count: number;
    tail: Point | null;
    ink: Float32Array;
}

// Ink cache per stroke, keyed by its first point; a changed signature invalidates it.
const strokeInks = new WeakMap<Point, StrokeInk>();

/**
 * Draws a stroke, point by point, into an ink image with round caps and round joins.
 *
 * @param ink - Square image to draw into, row-major
 * @param size - Side of the image in pixels
 * @param stroke - Polyline in pad coordinates
 * @param from - Index of the first point not drawn yet; segments before it are left alone
 * @param scale - Factor from pad coordinates to image pixels
 * @param radius - Half the line width, in image pixels
 */
function stampStroke(
    ink: Float32Array,
    size: number,
    stroke: Stroke,
    from: number,
    scale: number,
    radius: number,
): void {
    if (from === 0 && stroke.length === 1) {
        const dot = { x: stroke[0].x * scale, y: stroke[0].y * scale };

        stampSegment(ink, size, dot, dot, radius);
    }

    for (let i = Math.max(1, from); i < stroke.length; i++) {
        const a = { x: stroke[i - 1].x * scale, y: stroke[i - 1].y * scale };
        const b = { x: stroke[i].x * scale, y: stroke[i].y * scale };

        stampSegment(ink, size, a, b, radius);
    }
}

/**
 * Ink image of one stroke, completed from the previous call when the stroke only gained points.
 *
 * The image is cached on the identity of the first point, which the pad keeps while the stroke
 * grows, and checked against the last point drawn, so any other stroke starts again from scratch.
 *
 * @param stroke - Non-empty polyline in pad coordinates
 * @param padSize - Side of the square pad in the coordinates of the points
 * @param brush - Line width, in pad coordinates
 * @param size - Side of the output image in pixels
 * @returns The cached ink image of the stroke, to be read and never modified
 */
function strokeInk(stroke: Stroke, padSize: number, brush: number, size: number): Float32Array {
    const signature = `${padSize}:${brush}:${size}`;
    let entry = strokeInks.get(stroke[0]);

    if (
        !entry ||
        entry.signature !== signature ||
        entry.count > stroke.length ||
        (entry.count > 0 && stroke[entry.count - 1] !== entry.tail)
    ) {
        entry = { signature, count: 0, tail: null, ink: new Float32Array(size * size) };
        strokeInks.set(stroke[0], entry);
    }

    const scale = size / padSize;

    stampStroke(entry.ink, size, stroke, entry.count, scale, (brush * scale) / 2);
    entry.count = stroke.length;
    entry.tail = stroke[stroke.length - 1];

    return entry.ink;
}

/**
 * Rasterises polylines onto a square ink image with round caps and round joins.
 *
 * Coverage is the analytic overlap of a one pixel footprint with the stroke, so edges are
 * antialiased. A stroke made of a single point is drawn as a dot. Each stroke is drawn once and
 * then only extended, so redrawing a growing drawing costs the new points, not the whole drawing.
 *
 * @param strokes - Polylines in pad coordinates (pixels, 0 at the top left edge), one per pen-down to pen-up
 * @param padSize - Side of the square pad in the coordinates of the points
 * @param brush - Line width, in pad coordinates
 * @param size - Side of the output image in pixels
 * @returns Ink in 0..1, size * size values, row-major
 */
export function rasterizeStrokes(
    strokes: Stroke[],
    padSize: number,
    brush: number,
    size: number = DIGIT_SIZE,
): Float32Array {
    const ink = new Float32Array(size * size);

    for (const stroke of strokes) {
        if (stroke.length === 0) {
            continue;
        }

        const strokeImage = strokeInk(stroke, padSize, brush, size);

        for (let i = 0; i < ink.length; i++) {
            if (strokeImage[i] > ink[i]) {
                ink[i] = strokeImage[i];
            }
        }
    }

    return ink;
}

/**
 * Network input for the strokes drawn on the Part I pad.
 *
 * The strokes are rasterised at 112 x 112, enough to keep the thin edges smooth, then go through
 * the same MNIST style preparation as a canvas bitmap.
 *
 * @param strokes - Polylines in pad coordinates
 * @param padSize - Side of the square pad in the coordinates of the points
 * @param brush - Line width, in pad coordinates
 * @returns 784 grayscale values in 0..1, row-major, 1 being ink, zeros when nothing is drawn
 */
export function strokesToInput(strokes: Stroke[], padSize: number, brush: number): Float32Array {
    return preprocessInk(rasterizeStrokes(strokes, padSize, brush, WORK_SIZE), WORK_SIZE);
}
