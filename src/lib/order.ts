import type { Matrix, Vector } from "@/lib/attention";

/**
 * A word of the toy vocabulary of chapter 12, written as in the French sentences.
 */
export type Word = "le" | "chien" | "mord" | "l'" | "homme";

/**
 * Identifier of a sentence, named after the word that does the biting.
 */
type SentenceId = "dog" | "man";

/**
 * One of the two sentences of chapter 12: the same five words in a different order.
 */
export interface Sentence {
    id: SentenceId;
    tokens: readonly Word[];
    text: string;
    subject: Word;
}

/**
 * A word with the softmax weight a row gives to it.
 */
interface RankedWord {
    word: Word;
    index: number;
    weight: number;
}

/**
 * The five words shared by both sentences, in the fixed order used to break ties between equal
 * weights so that a tie reads the same in both sentences.
 */
const WORDS: readonly Word[] = ["le", "chien", "mord", "l'", "homme"];

/**
 * The two sentences: "le chien mord l'homme" and "l'homme mord le chien". Each id names the word
 * that bites ("dog" when the dog bites the man), the five tokens appear exactly once in reading
 * order, the text is written with its apostrophe and without final punctuation, and the subject is
 * the word that bites, the subject of the verb "mord".
 */
export const SENTENCES: Readonly<Record<SentenceId, Sentence>> = {
    dog: {
        id: "dog",
        tokens: ["le", "chien", "mord", "l'", "homme"],
        text: "le chien mord l'homme",
        subject: "chien",
    },
    man: {
        id: "man",
        tokens: ["l'", "homme", "mord", "le", "chien"],
        text: "l'homme mord le chien",
        subject: "homme",
    },
};

/**
 * Sentence ids in reading order of the chapter.
 */
export const SENTENCE_IDS: readonly SentenceId[] = ["dog", "man"];

/**
 * Content-only affinity: AFFINITY[query][key] is the raw score the word `query` gives to the word
 * `key`. It depends on the two words alone and never on where they stand, which is exactly why a
 * model with no position marker cannot tell the two sentences apart. The values are set by hand
 * for this toy, a real model learns them. The verb looks equally at both nouns (2.0), a little at
 * itself and barely at the articles, a noun looks at the verb and at its own article, and the two
 * articles look at the nouns more than at each other.
 */
const AFFINITY: Readonly<Record<Word, Readonly<Record<Word, number>>>> = {
    le: { le: 0.3, chien: 1.2, mord: 0.4, "l'": 0.2, homme: 0.6 },
    chien: { le: 1.2, chien: 0.4, mord: 1.8, "l'": 0.2, homme: 0.8 },
    mord: { le: 0.3, chien: 2, mord: 0.5, "l'": 0.3, homme: 2 },
    "l'": { le: 0.2, chien: 0.6, mord: 0.4, "l'": 0.3, homme: 1.2 },
    homme: { le: 0.2, chien: 0.8, mord: 1.8, "l'": 1.2, homme: 0.4 },
};

/**
 * The word whose row the figure of chapter 12 follows, the verb that both sentences share at the
 * same place.
 */
export const QUERY_WORD: Word = "mord";

/**
 * Distance, in words, from the word that looks to the key that earns the bonus: -1 is the word
 * written immediately before it.
 */
export const POSITION_OFFSET = -1;

/**
 * Value added to the raw score of the key that sits at POSITION_OFFSET from the query, when the
 * position marker is on. It is the only thing the position marker does in this toy.
 */
export const POSITION_BONUS = 1;

/**
 * Computes the stable softmax of a row of raw scores: the largest score is subtracted before
 * exponentiating so that nothing overflows.
 *
 * @param scores - Raw scores of one row
 * @returns The weights in the same order, each between 0 and 1, summing to 1 up to float rounding
 */
export function softmax(scores: Vector) {
    const top = Math.max(...scores);
    const exps = scores.map((score) => Math.exp(score - top));
    const total = exps.reduce((sum, value) => sum + value, 0);

    return exps.map((value) => value / total);
}

/**
 * Computes the raw scores of a sentence before the softmax.
 *
 * @param sentence - Sentence whose words look at each other
 * @param withPosition - True to add POSITION_BONUS to the key sitting at POSITION_OFFSET from each query
 * @returns A 5 x 5 grid, rows are the word that looks and columns the word looked at, in reading order
 */
export function scoresOf(sentence: Sentence, withPosition: boolean): Matrix {
    return sentence.tokens.map((query, i) =>
        sentence.tokens.map(
            (key, j) =>
                AFFINITY[query][key] +
                (withPosition && j - i === POSITION_OFFSET ? POSITION_BONUS : 0),
        ),
    );
}

/**
 * Computes the attention weights of a sentence.
 *
 * @param sentence - Sentence whose words look at each other
 * @param withPosition - True when the position marker is on, false when only the content counts
 * @returns A 5 x 5 grid of softmax weights, rows are the word that looks and columns the word looked at, in reading order, every row summing to 1
 */
function attentionOf(sentence: Sentence, withPosition: boolean): Matrix {
    return scoresOf(sentence, withPosition).map((row) => softmax(row));
}

/**
 * Returns the row of weights of one word.
 *
 * @param sentence - Sentence the word belongs to
 * @param withPosition - True when the position marker is on
 * @param word - Word that looks at the others
 * @returns Its 5 weights in the reading order of the sentence, summing to 1
 */
export function rowOf(sentence: Sentence, withPosition: boolean, word: Word) {
    return attentionOf(sentence, withPosition)[sentence.tokens.indexOf(word)];
}

/**
 * Ranks the words a word looks at, itself set aside.
 *
 * @param sentence - Sentence the word belongs to
 * @param withPosition - True when the position marker is on
 * @param word - Word that looks at the others
 * @returns The four other words from the heaviest weight to the lightest, equal weights keeping the order of WORDS so the ranking reads the same in both sentences
 */
function rankedWords(sentence: Sentence, withPosition: boolean, word: Word) {
    const row = rowOf(sentence, withPosition, word);
    const self = sentence.tokens.indexOf(word);
    const ranked: RankedWord[] = [];

    sentence.tokens.forEach((token, index) => {
        if (index !== self) ranked.push({ word: token, index, weight: row[index] });
    });

    return ranked.sort(
        (a, b) => b.weight - a.weight || WORDS.indexOf(a.word) - WORDS.indexOf(b.word),
    );
}

/**
 * Finds the two words a word looks at most.
 *
 * @param sentence - Sentence the word belongs to
 * @param withPosition - True when the position marker is on
 * @param word - Word that looks at the others
 * @returns The heaviest and the second heaviest word, each with its index in the sentence and its softmax weight in the row, between 0 and 1
 */
export function topTwoWords(
    sentence: Sentence,
    withPosition: boolean,
    word: Word,
): [RankedWord, RankedWord] {
    const [first, second] = rankedWords(sentence, withPosition, word);

    return [first, second];
}

/**
 * Tells whether two words get the same weight from a row, within float rounding.
 *
 * @param first - Weight of the first word
 * @param second - Weight of the second word
 * @returns True when the two weights differ by less than a billionth
 */
export function isTied(first: number, second: number) {
    return Math.abs(first - second) < 1e-9;
}
