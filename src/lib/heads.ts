import { FULL, IL_INDEX, type Matrix, TOKEN_COUNT, topTwo, type Vector } from "@/lib/attention";

/**
 * Stable name key of a head, the key under which the messages describe it.
 */
type HeadName = "previous" | "reference" | "neighbours" | "overview";

/**
 * One toy attention head over the sentence of the app.
 */
export interface Head {
    id: string;
    name: HeadName;
    matrix: Matrix;
}

/**
 * Score of the word just before in the previous head.
 */
const PREVIOUS_SCORE = 3;

/**
 * Score a word gives to itself in the previous head.
 */
const PREVIOUS_SELF_SCORE = 0.5;

/**
 * Score of each of the two neighbours in the neighbours head.
 */
const NEIGHBOUR_SCORE = 2.5;

/**
 * Score a word gives to itself in the neighbours head.
 */
const NEIGHBOUR_SELF_SCORE = 0.3;

/**
 * Score of the first word in the overview head, every other column scoring 0.
 */
const OVERVIEW_FIRST_SCORE = 1.2;

/**
 * Turns scores into weights with a stable softmax: the largest score is subtracted first so the
 * exponentials never overflow.
 *
 * @param scores - One score per word looked at
 * @returns The weights in the same order, each between 0 and 1 and summing to 1
 */
export const softmax = (scores: Vector) => {
    const top = Math.max(...scores);
    const exps = scores.map((score) => Math.exp(score - top));
    const total = exps.reduce((sum, value) => sum + value, 0);

    return exps.map((value) => value / total);
};

/**
 * Builds a head from a scoring rule applied to every pair of words.
 *
 * @param score - Rule giving the score of a word looking at another, from their two indices
 * @returns The grid whose rows are the softmax of the scores of one word looking at the sentence
 */
const fromRule = (score: (from: number, to: number) => number): Matrix =>
    Array.from({ length: TOKEN_COUNT }, (_, from) =>
        softmax(Array.from({ length: TOKEN_COUNT }, (_, to) => score(from, to))),
    );

/**
 * Scores of the previous head: the word just before gets 3, the word itself 0.5, and the first word
 * which has no word before it looks at itself with the full 3.
 *
 * @param from - Index of the word that looks
 * @param to - Index of the word looked at
 * @returns The score of the pair
 */
const previousScore = (from: number, to: number) => {
    if (from === 0) return to === 0 ? PREVIOUS_SCORE : 0;
    if (to === from - 1) return PREVIOUS_SCORE;

    return to === from ? PREVIOUS_SELF_SCORE : 0;
};

/**
 * Scores of the neighbours head: each of the two neighbours gets 2.5, the word itself 0.3.
 *
 * @param from - Index of the word that looks
 * @param to - Index of the word looked at
 * @returns The score of the pair
 */
const neighboursScore = (from: number, to: number) => {
    if (Math.abs(to - from) === 1) return NEIGHBOUR_SCORE;

    return to === from ? NEIGHBOUR_SELF_SCORE : 0;
};

/**
 * Scores of the overview head: a pull of 1.2 toward the first word, 0 everywhere else.
 *
 * @param _from - Index of the word that looks, which does not change the score
 * @param to - Index of the word looked at
 * @returns The score of the pair
 */
const overviewScore = (_from: number, to: number) => (to === 0 ? OVERVIEW_FIRST_SCORE : 0);

/**
 * The four toy heads in the order of the figure. The reference head is the grid of chapters 6, 9
 * and 11, the three others come from the scoring rules above. Ids run from "h1" to "h4", the name
 * is the key under which the messages describe the head, and each matrix is row-stochastic with one
 * row per word that looks and one column per word looked at.
 */
export const HEADS: readonly Head[] = [
    { id: "h1", name: "previous", matrix: fromRule(previousScore) },
    { id: "h2", name: "reference", matrix: FULL },
    { id: "h3", name: "neighbours", matrix: fromRule(neighboursScore) },
    { id: "h4", name: "overview", matrix: fromRule(overviewScore) },
];

/**
 * Reads the row of "il" of a head, the weights it gives to every word of the sentence.
 *
 * @param head - Head to read
 * @returns The 13 weights of the row of "il" in sentence order
 */
export const ilRow = (head: Head): Vector => head.matrix[IL_INDEX];

/**
 * Ranks the two words a head makes "il" look at most.
 *
 * @param head - Head to read
 * @returns The indices of the heaviest and the second heaviest word, "il" itself left out and ties keeping sentence order
 */
export const ilTopTwo = (head: Head) => topTwo(ilRow(head), IL_INDEX);

/**
 * Finds the largest weight of the row of "il" of a head.
 *
 * @param head - Head to read
 * @returns The largest weight, between 0 and 1
 */
export const ilPeak = (head: Head) => Math.max(...ilRow(head));
