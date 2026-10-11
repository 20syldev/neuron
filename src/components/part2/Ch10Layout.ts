import {
    IL_INDEX,
    LATTICE_POINTS,
    latticeCounts,
    rankPositions,
    type SoftmaxShare,
    TOKEN_COUNT,
    type Vector,
} from "@/lib/attention";
import {
    diamondHalfDiagonal,
    diamondPoints,
    funnelPath,
    NARROW_FIGURE,
    narrowFunnelPath,
    narrowRowY,
    round2,
    slotCenters,
    weightStroke,
    WIDE_FIGURE,
} from "@/lib/figures";

export interface Ch10Word {
    at: number;
    self: boolean;
    strong: boolean;
}

export interface Ch10Flow {
    path: string;
    width: number;
    strong: boolean;
}

export interface Ch10Diamond {
    points: string;
    strong: boolean;
}

export interface Ch10Point {
    x: number;
    y: number;
}

export interface Ch10Geometry {
    words: Ch10Word[];
    flows: Ch10Flow[];
    diamonds: Ch10Diamond[];
    outline: string;
    lattice: [string, string, string];
    mixMark: Ch10Point;
    topMark: Ch10Point;
}

/**
 * Splits the 113 lattice cells of the merged diamond into three path strings, each cell being a
 * zero-length segment stroked with round caps. The first cells in fill order go to the heaviest
 * word, the next ones to the second heaviest and the remainder to the other words.
 *
 * @param share - Ranking of the words by weight, whose two heaviest weights set the group sizes
 * @param centerX - Abscissa of the centre of the merged diamond
 * @param centerY - Ordinate of the centre of the merged diamond
 * @param step - Distance between two lattice cells
 * @returns The path data of the three groups
 */
function latticeGroups(
    share: SoftmaxShare,
    centerX: number,
    centerY: number,
    step: number,
): [string, string, string] {
    const counts = latticeCounts(share.firstWeight, share.secondWeight);
    const groups: [string, string, string] = ["", "", ""];

    LATTICE_POINTS.forEach(([column, row], index) => {
        const group = index < counts.first ? 0 : index < counts.first + counts.second ? 1 : 2;

        groups[group] += `M${centerX + column * step} ${centerY + row * step}h0.01`;
    });

    return groups;
}

/**
 * Tells which words are the two heaviest ones, "il" never being among them.
 *
 * @param share - Ranking of the words by weight
 * @returns One flag per word of the sentence
 */
function strongFlags(share: SoftmaxShare) {
    const places = rankPositions(share.order, TOKEN_COUNT);

    return places.map((place) => place < 2);
}

/**
 * Builds the geometry of the wide figure of chapter 10 (viewBox 1184 x 444): the 13 value
 * diamonds along the top, their flows funnelling into the merged diamond and its lattice dots.
 * Word positions are abscissas. The two heaviest words get the signal colour for their diamond and
 * flow and a bold name, and "il" is flagged to be printed in the signal ink. Flow stroke widths
 * carry the weight. The first callout sits beside the merged diamond and the second beside the
 * diamond of the heaviest word.
 *
 * @param weights - Softmax weights of the 13 words, between 0 and 1
 * @param share - Ranking of the words by weight
 * @returns One entry per word for the words, the flows (cubic path from the value diamond to the merged one, stroke width, strong flag) and the diamonds (points attribute, strong flag), the points attribute of the outline of the merged diamond, the path data of the three lattice groups (heaviest word, second heaviest, the others), and the SVG positions of the two callouts
 */
export function wideGeometry(weights: Vector, share: SoftmaxShare): Ch10Geometry {
    const { diamondY, mixX, mixY, mixHalf, latticeStep } = WIDE_FIGURE;
    const centers = slotCenters();
    const strong = strongFlags(share);
    const half = weights.map((weight) => diamondHalfDiagonal(weight, 44, 4));

    return {
        words: centers.map((at, index) => ({
            at: round2(at),
            self: index === IL_INDEX,
            strong: strong[index],
        })),
        flows: weights.map((weight, index) => ({
            path: funnelPath(centers[index], diamondY + half[index] + 5),
            width: weightStroke(weight, 0.6, 6),
            strong: strong[index],
        })),
        diamonds: weights.map((_, index) => ({
            points: diamondPoints(centers[index], diamondY, half[index]),
            strong: strong[index],
        })),
        outline: diamondPoints(mixX, mixY, mixHalf),
        lattice: latticeGroups(share, mixX, mixY, latticeStep),
        mixMark: { x: mixX + mixHalf + 26, y: mixY },
        topMark: {
            x: round2(centers[share.first] + half[share.first] + 14 + 8),
            y: diamondY,
        },
    };
}

/**
 * Builds the geometry of the phone figure of chapter 10 (viewBox 480 x 530): the sentence runs
 * down the left edge with a value diamond per word, and the flows run right into the merged
 * diamond. Colours, flags and callouts follow the same rules as the wide figure, but the first
 * callout sits under the merged diamond and the second beside the diamond of the heaviest word.
 *
 * @param weights - Softmax weights of the 13 words, between 0 and 1
 * @param share - Ranking of the words by weight
 * @returns The same structure as the wide geometry, with word ordinates in place of abscissas
 */
export function narrowGeometry(weights: Vector, share: SoftmaxShare): Ch10Geometry {
    const { dotX, mixX, mixY, mixHalf, latticeStep } = NARROW_FIGURE;
    const strong = strongFlags(share);
    const half = weights.map((weight) => diamondHalfDiagonal(weight, 34, 3.5));
    const topY = narrowRowY(share.first);

    return {
        words: weights.map((_, index) => ({
            at: narrowRowY(index) + 6,
            self: index === IL_INDEX,
            strong: strong[index],
        })),
        flows: weights.map((weight, index) => ({
            path: narrowFunnelPath(dotX + half[index] + 5, narrowRowY(index)),
            width: weightStroke(weight, 0.6, 6),
            strong: strong[index],
        })),
        diamonds: weights.map((_, index) => ({
            points: diamondPoints(dotX, narrowRowY(index), half[index]),
            strong: strong[index],
        })),
        outline: diamondPoints(mixX, mixY, mixHalf),
        lattice: latticeGroups(share, mixX, mixY, latticeStep),
        mixMark: { x: mixX - 118, y: mixY + mixHalf + 30 },
        topMark: { x: round2(dotX + half[share.first] + 16), y: round2(topY - 20) },
    };
}
