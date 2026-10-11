import { IL_INDEX, rankPositions, type SoftmaxShare, type Vector } from "@/lib/attention";
import {
    arcBetween,
    arcFeet,
    dotDiameter,
    narrowArcBetween,
    narrowRowY,
    round2,
    slotCenters,
    weightStroke,
} from "@/lib/figures";

export type Ch06Tone = "strong" | "medium" | "faint";

export interface Ch06Arc {
    path: string;
    width: number;
    tone: Ch06Tone;
}

export interface Ch06Word {
    at: number;
    radius: number;
    self: boolean;
    strong: boolean;
}

export interface Ch06Label {
    x: number;
    y: number;
}

export interface Ch06Graph {
    arcs: Ch06Arc[];
    words: Ch06Word[];
    labels: Ch06Label[];
    query: number;
}

/**
 * Text classes of a word of the graph: bold for "il" and the two heaviest words, in the signal ink
 * for "il" and the foreground colour for the others.
 *
 * @param word - Word of the graph
 * @returns Weight and fill classes, to be merged with the size classes of the figure
 */
export function wordClass(word: Ch06Word) {
    return `${word.self || word.strong ? "font-bold" : "font-medium"} ${word.self ? "fill-signal-ink" : "fill-foreground"}`;
}

/**
 * Fill class of the dot under a word: the query colour for "il", the signal colour for the two
 * heaviest words and the foreground colour for the rest.
 *
 * @param word - Word of the graph
 * @returns The Tailwind fill class
 */
export function dotClass(word: Ch06Word) {
    if (word.self) return "fill-query";

    return word.strong ? "fill-signal" : "fill-foreground";
}

/**
 * Picks the colour tone of an arc from the weight it carries and the place of its word.
 *
 * @param weight - Attention weight between 0 and 1
 * @param place - Place of the word in the ranking, 0 for the heaviest
 * @returns "strong" for the two heaviest words, "medium" from a weight of 1.2 percent, else "faint"
 */
function toneOf(weight: number, place: number): Ch06Tone {
    if (place < 2) return "strong";

    return weight >= 0.012 ? "medium" : "faint";
}

/**
 * Builds the words and the dots of a figure, whichever its orientation.
 *
 * @param weights - The 13 weights of "il", one per word
 * @param places - Place of each word in the ranking
 * @param at - Position of each word along the sentence
 * @param dotMax - Radius of a dot for a weight of 1
 * @returns One entry per word
 */
function wordsOf(
    weights: Vector,
    places: readonly number[],
    at: readonly number[],
    dotMax: number,
): Ch06Word[] {
    return weights.map((weight, index) => {
        const self = index === IL_INDEX;

        return {
            at: round2(at[index]),
            radius: self ? 6 : round2(dotDiameter(weight, dotMax, 2)),
            self,
            strong: !self && places[index] < 2,
        };
    });
}

/**
 * Lays out the wide attention graph: arcs rising above the word row from "il" to every other
 * word, thickness following the weight, with a label above each of the two heaviest.
 *
 * The abscissas of the words and of "il" are slot centres of the wide figure. Arcs are ordered
 * from the lightest to the heaviest so the heavy ones are drawn on top. A word carries the
 * radius of its halftone dot, whose area follows the weight, and flags for "il" and for the two
 * heaviest words. A label sits at the middle of its arc, just above the top of the arc.
 *
 * @param weights - The 13 weights of "il", one per word
 * @param share - Ranking of the words by weight, "il" left out
 * @returns The arcs with their path, stroke width carrying the weight and tone, the 13 words in sentence order, the labels of the two heaviest arcs heaviest first, and the abscissa of "il"
 */
export function wideGraph(weights: Vector, share: SoftmaxShare): Ch06Graph {
    const centers = slotCenters();
    const places = rankPositions(share.order, weights.length);
    const query = centers[IL_INDEX];
    const arcs: Ch06Arc[] = [];
    const geometry: Record<number, ReturnType<typeof arcBetween>> = {};
    const widths = weights.map((weight) => weightStroke(weight, 0.8, 14));
    const feet = arcFeet(widths, IL_INDEX, 2);

    for (const index of [...share.order].reverse()) {
        const arc = arcBetween(query, centers[index], undefined, feet[index]);

        geometry[index] = arc;
        arcs.push({
            path: arc.path,
            width: widths[index],
            tone: toneOf(weights[index], places[index]),
        });
    }

    return {
        arcs,
        words: wordsOf(weights, places, centers, 24),
        labels: [share.first, share.second].map((index) => {
            const arc = geometry[index];

            return { x: round2(arc.mid), y: round2(arc.top) };
        }),
        query,
    };
}

/**
 * Lays out the phone attention graph: the sentence runs down the left edge and the arcs bulge to
 * the right of it, with a label leader at the apex of each of the two heaviest.
 *
 * The positions of the words and of "il" are the ordinates of their rows, and a label sits at the
 * apex of its arc. Arcs are ordered from the lightest to the heaviest so the heavy ones are drawn
 * on top.
 *
 * @param weights - The 13 weights of "il", one per word
 * @param share - Ranking of the words by weight, "il" left out
 * @returns The arcs with their path, stroke width carrying the weight and tone, the 13 words in sentence order, the labels of the two heaviest arcs heaviest first, and the ordinate of "il"
 */
export function narrowGraph(weights: Vector, share: SoftmaxShare): Ch06Graph {
    const rows = weights.map((_, index) => narrowRowY(index));
    const places = rankPositions(share.order, weights.length);
    const query = rows[IL_INDEX];
    const arcs: Ch06Arc[] = [];
    const geometry: Record<number, ReturnType<typeof narrowArcBetween>> = {};

    for (const index of [...share.order].reverse()) {
        const arc = narrowArcBetween(query, rows[index]);

        geometry[index] = arc;
        arcs.push({
            path: arc.path,
            width: weightStroke(weights[index], 0.8, 14),
            tone: toneOf(weights[index], places[index]),
        });
    }

    return {
        arcs,
        words: wordsOf(weights, places, rows, 18),
        labels: [share.first, share.second].map((index) => {
            const arc = geometry[index];

            return { x: round2(arc.apexX), y: round2(arc.apexY) };
        }),
        query,
    };
}
