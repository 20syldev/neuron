export type VariantId = "tired" | "wide";

export type Vector = readonly number[];

export type Matrix = readonly Vector[];

export type LatticePoint = readonly [column: number, row: number];

export interface AttentionRow {
    token: string;
    score: number;
    weight: number;
}

export interface Variant {
    id: VariantId;
    query: Vector;
    dotAnimal: number;
    dotBoulevard: number;
    rows: readonly AttentionRow[];
}

export interface SoftmaxShare {
    order: number[];
    first: number;
    second: number;
    third: number;
    firstWeight: number;
    secondWeight: number;
    thirdWeight: number;
    restPercent: number;
}

export interface ShareCounts {
    first: number;
    second: number;
    rest: number;
}

export interface Thinnest {
    weight: number;
    count: number;
}

export interface Cost {
    words: number;
    doubledWords: number;
    comparisons: number;
    doubledComparisons: number;
    layers: number;
    headsPerLayer: number;
    totalHeads: number;
}

// Fixed keys of "animal" and "boulevard", 8 components each.
export const KEY_ANIMAL: Vector = [1.6, 0.3, 1.3, -0.6, -0.9, 1.5, 0.2, 0.4];
export const KEY_BOULEVARD: Vector = [-0.7, 1.4, -0.2, 1.1, 0.8, -0.3, 1.2, 0.5];

// Per variant: the query of "il", its dot products with both keys and the 13 rows of the sentence.
export const VARIANTS: Record<VariantId, Variant> = {
    tired: {
        id: "tired",
        query: [0.87, 1.09, 0.93, 0.18, -0.24, 1.03, 0.89, 0.62],
        dotAnimal: 5.01,
        dotBoulevard: 1.81,
        rows: [
            { token: "L'", score: 0, weight: 0.005 },
            { token: "animal", score: 5.01, weight: 0.724 },
            { token: "n'a", score: 0.7, weight: 0.01 },
            { token: "pas", score: 0, weight: 0.005 },
            { token: "traversé", score: 1.1, weight: 0.015 },
            { token: "le", score: 0, weight: 0.005 },
            { token: "boulevard", score: 1.81, weight: 0.03 },
            { token: "parce", score: 0, weight: 0.005 },
            { token: "qu'", score: 0, weight: 0.005 },
            { token: "il", score: 0.7, weight: 0.01 },
            { token: "était", score: 0, weight: 0.005 },
            { token: "trop", score: 0.3, weight: 0.007 },
            { token: "fatigué", score: 3.6, weight: 0.177 },
        ],
    },
    wide: {
        id: "wide",
        query: [0.22, 1.64, 0.57, 0.79, 0.3, 0.58, 1.38, 0.76],
        dotAnimal: 2.29,
        dotBoulevard: 5,
        rows: [
            { token: "L'", score: 0, weight: 0.005 },
            { token: "animal", score: 2.29, weight: 0.047 },
            { token: "n'a", score: 0, weight: 0.005 },
            { token: "pas", score: 0, weight: 0.005 },
            { token: "traversé", score: 1.4, weight: 0.019 },
            { token: "le", score: 0.7, weight: 0.01 },
            { token: "boulevard", score: 5, weight: 0.703 },
            { token: "parce", score: 0, weight: 0.005 },
            { token: "qu'", score: 0, weight: 0.005 },
            { token: "il", score: 0.7, weight: 0.01 },
            { token: "était", score: 0, weight: 0.005 },
            { token: "trop", score: 0.7, weight: 0.01 },
            { token: "large", score: 3.6, weight: 0.173 },
        ],
    },
};

// Variant ids in the order of the switch, the two sentences differing only by their last word
export const VARIANT_IDS: readonly VariantId[] = ["tired", "wide"];

// grid.json: the 13 words of the sentence in the tired variant
export const TOKENS: readonly string[] = [
    "L'",
    "animal",
    "n'a",
    "pas",
    "traversé",
    "le",
    "boulevard",
    "parce",
    "qu'",
    "il",
    "était",
    "trop",
    "fatigué",
];

// Number of words in the sentence
export const TOKEN_COUNT = 13;

// Index of "animal", the first candidate of "il"
export const ANIMAL_INDEX = 1;

// Index of "boulevard", the second candidate of "il"
export const BOULEVARD_INDEX = 6;

// Index of "il", the word whose query the figures follow
export const IL_INDEX = 9;

// Index of the last word, the one that switches between the tired and the wide variant
export const LAST_INDEX = 12;

// Token slot widths in characters, shared by figures 6 and 10.
export const SLOT_LENGTHS: readonly number[] = [2, 6, 3, 3, 8, 2, 9, 5, 3, 2, 5, 4, 7];

// grid.json: rows are the word that looks, columns the word looked at, tired sentence
export const FULL: Matrix = [
    [0.177, 0.238, 0.053, 0.053, 0.053, 0.053, 0.053, 0.053, 0.053, 0.053, 0.053, 0.053, 0.053],
    [0.46, 0.125, 0.038, 0.038, 0.038, 0.038, 0.038, 0.038, 0.038, 0.038, 0.038, 0.038, 0.038],
    [0.028, 0.556, 0.092, 0.075, 0.028, 0.028, 0.028, 0.028, 0.028, 0.028, 0.028, 0.028, 0.028],
    [0.049, 0.049, 0.297, 0.163, 0.049, 0.049, 0.049, 0.049, 0.049, 0.049, 0.049, 0.049, 0.049],
    [0.037, 0.182, 0.082, 0.1, 0.122, 0.037, 0.222, 0.037, 0.037, 0.037, 0.037, 0.037, 0.037],
    [0.043, 0.043, 0.043, 0.043, 0.116, 0.142, 0.315, 0.043, 0.043, 0.043, 0.043, 0.043, 0.043],
    [0.045, 0.045, 0.045, 0.045, 0.182, 0.222, 0.149, 0.045, 0.045, 0.045, 0.045, 0.045, 0.045],
    [0.045, 0.045, 0.045, 0.045, 0.045, 0.045, 0.123, 0.15, 0.274, 0.045, 0.045, 0.045, 0.045],
    [0.045, 0.045, 0.045, 0.045, 0.045, 0.045, 0.045, 0.274, 0.15, 0.123, 0.045, 0.045, 0.045],
    [0.005, 0.724, 0.01, 0.005, 0.015, 0.005, 0.03, 0.005, 0.005, 0.01, 0.005, 0.007, 0.177],
    [0.029, 0.029, 0.029, 0.029, 0.029, 0.029, 0.029, 0.029, 0.029, 0.584, 0.096, 0.029, 0.029],
    [0.049, 0.049, 0.049, 0.049, 0.049, 0.049, 0.049, 0.049, 0.049, 0.049, 0.132, 0.162, 0.218],
    [0.029, 0.029, 0.029, 0.029, 0.029, 0.029, 0.029, 0.029, 0.029, 0.479, 0.065, 0.097, 0.097],
];

// grid.json: same grid with the future words masked, tired sentence
export const CAUSAL: Matrix = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0.786, 0.214, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0.041, 0.823, 0.136, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0.088, 0.088, 0.532, 0.292, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0.07, 0.348, 0.157, 0.191, 0.234, 0, 0, 0, 0, 0, 0, 0, 0],
    [0.1, 0.1, 0.1, 0.1, 0.271, 0.331, 0, 0, 0, 0, 0, 0, 0],
    [0.061, 0.061, 0.061, 0.061, 0.248, 0.303, 0.203, 0, 0, 0, 0, 0, 0],
    [0.083, 0.083, 0.083, 0.083, 0.083, 0.083, 0.226, 0.276, 0, 0, 0, 0, 0],
    [0.061, 0.061, 0.061, 0.061, 0.061, 0.061, 0.061, 0.37, 0.203, 0, 0, 0, 0],
    [0.022, 0.441, 0.022, 0.022, 0.022, 0.022, 0.295, 0.022, 0.06, 0.073, 0, 0, 0],
    [0.031, 0.031, 0.031, 0.031, 0.031, 0.031, 0.031, 0.031, 0.031, 0.62, 0.102, 0, 0],
    [0.062, 0.062, 0.062, 0.062, 0.062, 0.062, 0.062, 0.062, 0.062, 0.062, 0.169, 0.207, 0],
    [0.023, 0.249, 0.023, 0.023, 0.023, 0.023, 0.023, 0.023, 0.023, 0.371, 0.05, 0.075, 0.075],
];

// Unit dots of the recipe of chapter 9
export const WAFFLE_DOTS = 100;

// Radius of the merged value diamond in lattice steps, 113 unit dots inside it
export const LATTICE_RADIUS = 7;

// Cost figures of chapter 15: the sentence and its double, then the layers and heads of GPT-3.
export const COST: Cost = {
    words: TOKEN_COUNT,
    doubledWords: TOKEN_COUNT * 2,
    comparisons: comparisons(TOKEN_COUNT),
    doubledComparisons: comparisons(TOKEN_COUNT * 2),
    layers: 96,
    headsPerLayer: 96,
    totalHeads: 96 * 96,
};

/**
 * Counts the comparisons of a sentence: every word looks at every word, so the work grows with the
 * square of the length.
 *
 * @param words - Number of words in the sentence
 * @returns The number of word pairs, which is the number of attention weights of one head
 */
export function comparisons(words: number) {
    return words * words;
}

/**
 * Rounds to the hundredth with halves going up, immune to float noise so that 1.03 x 1.5 reads 1.55.
 *
 * @param value - Percentage or ratio to round, any finite number, may be negative (halves then move away from zero)
 * @returns The rounded number, not a string: formatting is left to the caller
 */
export function roundHundredth(value: number) {
    return (Math.sign(value) * Math.round(Math.abs(value) * 100 + 1e-7)) / 100;
}

/**
 * Returns the tokens of a variant in sentence order.
 *
 * @param variant - Sentence variant, read through its rows
 * @returns The 13 words, the last one being the word of the variant
 */
export function wordsOf(variant: Variant) {
    return variant.rows.map((row) => row.token);
}

/**
 * Returns the softmax weights that "il" gives to every word of a variant.
 *
 * @param variant - Sentence variant, read through its rows
 * @returns The 13 weights in sentence order, each between 0 and 1
 */
export function weightsOf(variant: Variant) {
    return variant.rows.map((row) => row.weight);
}

/**
 * Finds the two words a row of weights favours most, the word that looks being set aside.
 *
 * @param row - Weights of one row of a grid, one per word
 * @param self - Index of the word that looks, never part of the result
 * @returns The indices of the heaviest and the second heaviest word, ties keeping sentence order
 */
export function topTwo(row: Vector, self: number): [number, number] {
    const order = rank(row, self);

    return [order[0], order[1]];
}

/**
 * Ranks every word except the one that looks by the weight it receives.
 *
 * @param weights - Weights of one row, one per word
 * @param self - Index of the word that looks, left out of the ranking
 * @returns The other indices from the heaviest weight to the lightest, ties keeping sentence order
 */
export function rank(weights: Vector, self: number) {
    const order: number[] = [];

    for (let i = 0; i < weights.length; i++) {
        if (i !== self) order.push(i);
    }

    return order.sort((a, b) => weights[b] - weights[a]);
}

/**
 * Inverts a ranking so a word can ask which place it holds.
 *
 * @param order - Indices from the heaviest to the lightest, as returned by rank
 * @param length - Number of words in the sentence
 * @returns For each word its place in the ranking starting at 0, and the length itself for a word that is not ranked (the one that looks), so a test like place < 2 is false for it
 */
export function rankPositions(order: readonly number[], length: number) {
    const places: number[] = Array.from({ length }, () => length);

    order.forEach((index, place) => {
        places[index] = place;
    });

    return places;
}

/**
 * Summarises a row of softmax weights: the ranking, the three heaviest words and what the two
 * strongest leave to the others.
 *
 * @param weights - Weights of one row, one per word
 * @param self - Index of the word that looks, left out of the ranking, "il" by default
 * @returns The ranking (every word but the one that looks, heaviest first), the three heaviest indices with their weights between 0 and 1, and the rest left to the others in percentage points, computed from the two strongest weights rounded to the hundredth of a point like the mockup does
 */
export function softmaxShare(weights: Vector, self = IL_INDEX): SoftmaxShare {
    const order = rank(weights, self);
    const [first, second, third] = order;
    const firstWeight = weights[first];
    const secondWeight = weights[second];

    return {
        order,
        first,
        second,
        third,
        firstWeight,
        secondWeight,
        thirdWeight: weights[third],
        restPercent:
            100 - roundTwoDecimals(firstWeight * 100) - roundTwoDecimals(secondWeight * 100),
    };
}

/**
 * Finds the lightest weight of a row and how many words carry exactly that weight.
 *
 * @param weights - Weights of one row, one per word
 * @param self - Index of the word that looks, left out, "il" by default
 * @returns The smallest weight (1 when the row has no other word) and the number of words equal to it
 */
export function thinnest(weights: Vector, self = IL_INDEX): Thinnest {
    let weight = 1;
    let count = 0;

    weights.forEach((w, i) => {
        if (i !== self && w < weight) weight = w;
    });
    weights.forEach((w, i) => {
        if (i !== self && w === weight) count += 1;
    });

    return { weight, count };
}

/**
 * Tells which candidate scores higher for "il" in a variant.
 *
 * @param variant - Sentence variant, read through dotAnimal and dotBoulevard
 * @returns "animal" when its dot product is strictly higher, otherwise "boulevard"
 */
export function dotWinner(variant: Variant) {
    return variant.dotAnimal > variant.dotBoulevard ? "animal" : "boulevard";
}

/**
 * Multiplies a query and a key component by component, rounded to the hundredth as the mockup
 * prints them.
 *
 * @param query - Query vector
 * @param key - Key vector, same length as the query
 * @returns One product per component, rounded half up to the hundredth
 */
export function products(query: Vector, key: Vector) {
    return query.map((q, i) => roundHundredth(q * key[i]));
}

/**
 * Multiplies a query and a key component by component without rounding, which is what sizes the
 * halftone shapes.
 *
 * @param query - Query vector
 * @param key - Key vector, same length as the query
 * @returns One exact product per component, negative where the signs differ
 */
export function rawProducts(query: Vector, key: Vector) {
    return query.map((q, i) => q * key[i]);
}

/**
 * Shares a number of unit dots between the two strongest words and the rest, each strong word
 * rounded on its own and the rest taking what is left.
 *
 * @param firstWeight - Weight of the heaviest word, between 0 and 1
 * @param secondWeight - Weight of the second heaviest word, between 0 and 1
 * @param total - Number of unit dots to share, WAFFLE_DOTS or the lattice size
 * @returns The dot count of each group (heaviest word, second heaviest, every other word), summing to total
 */
export function shareCounts(firstWeight: number, secondWeight: number, total: number): ShareCounts {
    const first = Math.round(firstWeight * total);
    const second = Math.round(secondWeight * total);

    return { first, second, rest: total - first - second };
}

/**
 * Lists the cells of the lattice inside a diamond, in the order they are filled: bottom rows first,
 * each row from its centre outwards.
 *
 * @param radius - Half diagonal of the diamond in lattice steps
 * @returns The cells as column and row offsets from the centre, rows growing downwards
 */
export function latticePoints(radius = LATTICE_RADIUS) {
    const points: LatticePoint[] = [];

    for (let row = -radius; row <= radius; row++) {
        for (let column = -radius; column <= radius; column++) {
            if (Math.abs(column) + Math.abs(row) <= radius) points.push([column, row]);
        }
    }

    return points.sort((p, q) => q[1] - p[1] || Math.abs(p[0]) - Math.abs(q[0]) || p[0] - q[0]);
}

// The merged value diamond of chapter 10 in fill order
export const LATTICE_POINTS: readonly LatticePoint[] = latticePoints();

// Unit dots inside the merged value diamond
export const LATTICE_COUNT = LATTICE_POINTS.length;

/**
 * Shares the lattice of the merged value between the two strongest words and the rest.
 *
 * @param firstWeight - Weight of the heaviest word, between 0 and 1
 * @param secondWeight - Weight of the second heaviest word, between 0 and 1
 * @returns The cell count of each group, the first cells in fill order going to the heaviest word
 */
export function latticeCounts(firstWeight: number, secondWeight: number) {
    return shareCounts(firstWeight, secondWeight, LATTICE_COUNT);
}

/**
 * Counts the masked cells of a causal grid, those strictly above the diagonal.
 *
 * @param grid - Square grid, one row per word that looks
 * @returns The number of cells where a word would look at a later word
 */
export function maskedCount(grid: Matrix) {
    let count = 0;

    grid.forEach((row, i) => {
        count += row.length - 1 - i;
    });

    return count;
}

// Masked cells of the causal grid of chapter 14
export const MASKED_COUNT = maskedCount(CAUSAL);

/**
 * Rounds to the hundredth with Math.round, the way the mockup rounds the two strongest percentages
 * before subtracting them from 100.
 *
 * @param value - Percentage or ratio to round, any finite number
 * @returns The number rounded to two decimals
 */
function roundTwoDecimals(value: number) {
    return Math.round(value * 100) / 100;
}
