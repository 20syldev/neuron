// Geometry of the wide figures of chapters 6 and 10 (viewBox 1184 wide).
export const WIDE_FIGURE = {
    arcBaseY: 382,
    diamondY: 74,
    mixX: 592,
    mixY: 316,
    mixHalf: 120,
    latticeRadius: 7,
    latticeStep: 15,
    slotChar: 13,
    slotPad: 32,
} as const;

// Geometry of the same figures on a phone (viewBox 480 x 530).
export const NARROW_FIGURE = {
    row0: 36,
    pitch: 38,
    wordX: 108,
    dotX: 134,
    arcX: 158,
    mixX: 346,
    mixY: 268,
    mixHalf: 112,
    latticeStep: 14,
} as const;

// Character length of each of the 13 words, from which the token slots are sized.
export const SLOT_LENGTHS = [2, 6, 3, 3, 8, 2, 9, 5, 3, 2, 5, 4, 7];

export type ShapeKind = "circle" | "square" | "diamond";

export interface ShapeSize {
    size: number;
    hollow: boolean;
    rotated: boolean;
}

export interface Arc {
    path: string;
    mid: number;
    top: number;
}

export interface NarrowArc {
    path: string;
    apexX: number;
    apexY: number;
}

/**
 * Rounds a coordinate to two decimals, which keeps path data short and stable across renders.
 *
 * @param n - Any finite number
 * @returns The number rounded to the hundredth
 */
export function round2(n: number) {
    return Math.round(n * 100) / 100;
}

/**
 * Size of a halftone dot whose area carries a value: the diameter grows with the square root of
 * the value so that the area is proportional to it.
 *
 * @param value - Non-negative value, as a share of the scale (0 draws nothing but the floor)
 * @param max - Size reached when the value is 1, in the unit the caller draws in
 * @param floor - Smallest size returned, so near-zero values stay visible
 * @returns The diameter (or radius, when max is a radius) of the dot
 */
export function dotDiameter(value: number, max: number, floor = 0) {
    return Math.max(floor, max * Math.sqrt(Math.max(0, value)));
}

/**
 * Path data of one circle as a closed subpath, so a whole halftone field can be a single path.
 *
 * @param cx - Centre abscissa
 * @param cy - Centre ordinate
 * @param r - Radius, rounded to the hundredth
 * @returns SVG subpath starting at the left edge of the circle
 */
export function circlePath(cx: number, cy: number, r: number) {
    const rr = round2(r);

    return `M${round2(cx - rr)} ${round2(cy)}a${rr} ${rr} 0 1 0 ${round2(2 * rr)} 0a${rr} ${rr} 0 1 0 ${round2(-2 * rr)} 0Z`;
}

/**
 * Size of a query (circle), key (square) or value (diamond) mark inside a fluid grid cell. The
 * area follows the magnitude, a negative value gives a hollow outline, and the size never drops
 * under 8 percent so tiny values stay visible.
 *
 * @param kind - Shape of the mark: circle for a query, square for a key, diamond for a value
 * @param value - Signed component, negative values are hollow
 * @param maxAbs - Magnitude that fills 92 percent of the cell, strictly positive
 * @returns The side of the CSS box in percent of its cell (already shrunk by the square root of 2 for a diamond, whose box is rotated by 45 degrees), whether the mark is drawn hollow (negative value) and whether the box must be rotated (diamond)
 */
export function shapeSize(kind: ShapeKind, value: number, maxAbs: number): ShapeSize {
    const percent = Math.max(8, 92 * Math.sqrt(Math.abs(value) / maxAbs));
    const rotated = kind === "diamond";

    return {
        size: round2(rotated ? percent / Math.SQRT2 : percent),
        hollow: value < 0,
        rotated,
    };
}

/**
 * Half diagonal of a value diamond whose area carries a weight.
 *
 * @param weight - Attention weight between 0 and 1
 * @param max - Diagonal reached for a weight of 1, in SVG units
 * @param min - Smallest diagonal, so thin weights stay visible
 * @returns Half of the diagonal, ready for diamondPoints
 */
export function diamondHalfDiagonal(weight: number, max: number, min: number) {
    return Math.max(min, max * Math.sqrt(weight)) / Math.SQRT2;
}

/**
 * Points attribute of a diamond (a square standing on its tip).
 *
 * @param x - Centre abscissa
 * @param y - Centre ordinate
 * @param h - Half diagonal
 * @returns Four "x,y" pairs separated by spaces, starting at the top
 */
export function diamondPoints(x: number, y: number, h: number) {
    return `${round2(x)},${round2(y - h)} ${round2(x + h)},${round2(y)} ${round2(x)},${round2(y + h)} ${round2(x - h)},${round2(y)}`;
}

/**
 * Faint dot grid drawn as rows of zero-length dashes with round caps: stroke it with a
 * "0 pitch" dash array and each row prints one dot every pitch. Each row runs half a unit past
 * its last dot, because a dash that starts exactly at the end of a path is not painted and the last
 * column would go missing.
 *
 * @param origin - Offset of the first dot on both axes
 * @param pitch - Distance between two dots
 * @param rowFrom - First row index, inclusive
 * @param rowTo - Last row index, inclusive
 * @param colFrom - First column index, inclusive
 * @param colTo - Last column index, inclusive
 * @returns SVG path data with one horizontal segment per row
 */
export function dotRowsPath(
    origin: number,
    pitch: number,
    rowFrom: number,
    rowTo: number,
    colFrom: number,
    colTo: number,
) {
    let path = "";

    for (let row = rowFrom; row <= rowTo; row++) {
        path += `M${round2(origin + colFrom * pitch)} ${round2(origin + row * pitch)}H${round2(origin + colTo * pitch + 0.5)}`;
    }

    return path;
}

/**
 * Width of a dot inside a cell of the attention matrix, the area carrying the weight.
 *
 * @param value - Attention weight between 0 and 1
 * @param fraction - Share of the cell filled by a weight of 1, 0.9 in the validated matrices
 * @returns Width in percent of the cell, to be floored by the caller (a 2 px minimum)
 */
export function matrixDotPercent(value: number, fraction: number) {
    return round2(fraction * Math.sqrt(value) * 100);
}

/**
 * Horizontal centre of each word slot of the wide figures, slots being as wide as their word.
 *
 * @param lengths - Character length of each word, SLOT_LENGTHS by default
 * @returns One abscissa per slot, in SVG units
 */
export function slotCenters(lengths: readonly number[] = SLOT_LENGTHS) {
    const centers: number[] = [];
    let cursor = 0.5;

    for (const length of lengths) {
        const width = length * WIDE_FIGURE.slotChar + WIDE_FIGURE.slotPad;
        centers.push(cursor + width / 2);
        cursor += width;
    }

    return centers;
}

/**
 * Arc of the wide attention graph, rising above the word row from the query to another word.
 * The arc starts beside the query, on the side of the word it looks at, so the ends of the arcs
 * land next to each other instead of piling up on one point.
 *
 * @param queryX - Abscissa of the query word ("il")
 * @param wordX - Abscissa of the word it looks at
 * @param baseY - Ordinate of the feet of the arcs
 * @param foot - Distance of the arc start from the query abscissa, in figure units
 * @returns SVG path data of the half ellipse, plus the horizontal middle of the arc and the vertical position of its top, where a label can sit
 */
export function arcBetween(
    queryX: number,
    wordX: number,
    baseY: number = WIDE_FIGURE.arcBaseY,
    foot: number = 3,
): Arc {
    const from = queryX + (wordX < queryX ? -foot : foot);
    const left = Math.min(from, wordX);
    const right = Math.max(from, wordX);
    const dist = right - left;
    const ry = 16 + dist * 0.4;

    return {
        path: `M${round2(left)} ${baseY} A${round2(dist / 2)} ${round2(ry)} 0 0 1 ${round2(right)} ${baseY}`,
        mid: (left + right) / 2,
        top: baseY - ry,
    };
}

/**
 * Distances from the query at which the arcs of the wide graph start. On each side the nearest
 * word lands closest to the query and every farther word lands just beyond the arcs inside it, so
 * the arcs are nested without crossing and their round ends never overlap.
 *
 * @param widths - Stroke width of the arc of each word, one per word, the query included
 * @param queryIndex - Index of the query word in the sentence
 * @param gap - Free space left between the feet of two neighbouring arcs
 * @returns One distance per word, the one of the query itself being 0
 */
export function arcFeet(widths: readonly number[], queryIndex: number, gap: number): number[] {
    const feet = widths.map(() => 0);
    let left = 3;
    let right = 3;

    for (let index = queryIndex - 1; index >= 0; index--) {
        feet[index] = round2(left + widths[index] / 2);
        left += widths[index] + gap;
    }

    for (let index = queryIndex + 1; index < widths.length; index++) {
        feet[index] = round2(right + widths[index] / 2);
        right += widths[index] + gap;
    }

    return feet;
}

/**
 * Stroke width of an arc or of a flow: the thickness carries the attention weight.
 *
 * @param weight - Attention weight between 0 and 1
 * @param base - Width of a zero weight
 * @param gain - Extra width of a weight of 1
 * @returns Stroke width in SVG units
 */
export function weightStroke(weight: number, base: number, gain: number) {
    return round2(base + gain * weight);
}

/**
 * Y position of a word row of the phone figures.
 *
 * @param index - Word index, 0 for the first word
 * @returns Ordinate of the row in the 480 x 530 viewBox
 */
export function narrowRowY(index: number) {
    return NARROW_FIGURE.row0 + NARROW_FIGURE.pitch * index;
}

/**
 * Arc of the phone attention graph, bulging to the right of the spine from the query row to
 * another row.
 *
 * @param queryY - Ordinate of the query row
 * @param wordY - Ordinate of the row it looks at
 * @returns SVG path data of the half ellipse, plus the horizontal and vertical position of its apex, where a label leader can start
 */
export function narrowArcBetween(queryY: number, wordY: number): NarrowArc {
    const from = queryY + (wordY < queryY ? -4 : 4);
    const span = Math.abs(wordY - from);
    const rx = 14 + 0.58 * span;
    const x = NARROW_FIGURE.arcX;
    const sweep = wordY > queryY ? 1 : 0;

    return {
        path: `M${x} ${round2(from)} A${round2(rx)} ${round2(span / 2)} 0 0 ${sweep} ${x} ${round2(wordY)}`,
        apexX: x + rx,
        apexY: (from + wordY) / 2,
    };
}

/**
 * Funnel curve of the wide weighted-sum figure: a flow leaves the foot of a value diamond,
 * drops, and enters the top of the merged diamond.
 *
 * @param x - Abscissa of the value diamond
 * @param startY - Ordinate where the flow leaves the diamond
 * @returns Cubic Bezier path data ending just above the merged diamond
 */
export function funnelPath(x: number, startY: number) {
    const { mixX, mixY, mixHalf } = WIDE_FIGURE;

    return `M${round2(x)} ${round2(startY)} C${round2(x)} ${round2(startY + 64)} ${mixX} ${mixY - mixHalf - 64} ${mixX} ${mixY - mixHalf - 4}`;
}

/**
 * Funnel curve of the phone weighted-sum figure: a flow leaves a diamond of the spine and runs
 * right into the left tip of the merged diamond.
 *
 * @param startX - Abscissa where the flow leaves the diamond
 * @param y - Ordinate of the row
 * @returns Cubic Bezier path data ending at the left tip of the merged diamond
 */
export function narrowFunnelPath(startX: number, y: number) {
    const { mixX, mixY, mixHalf } = NARROW_FIGURE;
    const tipX = mixX - mixHalf;
    const run = tipX - startX;

    return `M${round2(startX)} ${y} C${round2(startX + run * 0.5)} ${y} ${round2(tipX - run * 0.3)} ${mixY} ${tipX} ${mixY}`;
}

/**
 * Cells of the diamond-shaped lattice of unit dots, in filling order: bottom rows first, each row
 * filled from its centre outwards.
 *
 * @param radius - Manhattan radius of the lattice, 7 gives 113 cells
 * @returns Cell offsets [column, row] around the centre
 */
export function latticePoints(radius: number = WIDE_FIGURE.latticeRadius) {
    const points: [number, number][] = [];

    for (let row = -radius; row <= radius; row++) {
        for (let col = -radius; col <= radius; col++) {
            if (Math.abs(col) + Math.abs(row) <= radius) points.push([col, row]);
        }
    }

    return points.sort((p, q) => q[1] - p[1] || Math.abs(p[0]) - Math.abs(q[0]) || p[0] - q[0]);
}

/**
 * Splits the lattice into one dot path per share: each share takes the next run of cells and the
 * last path gets the remainder. Each cell is a zero-length segment, stroked with round caps.
 *
 * @param points - Cells from latticePoints, in filling order
 * @param cx - Abscissa of the lattice centre
 * @param cy - Ordinate of the lattice centre
 * @param step - Distance between two cells
 * @param shares - Weights of the leading groups (0 to 1); a path is returned for each, plus the rest
 * @returns Path data strings, one per share followed by the remainder
 */
export function latticePaths(
    points: readonly [number, number][],
    cx: number,
    cy: number,
    step: number,
    shares: readonly number[],
) {
    const counts = shares.map((share) => Math.round(share * points.length));
    const paths = [...counts, 0].map(() => "");

    points.forEach(([col, row], index) => {
        let group = 0;
        let end = counts[0] ?? 0;

        while (group < counts.length && index >= end) {
            group += 1;
            end += counts[group] ?? 0;
        }

        paths[group] += `M${cx + col * step} ${cy + row * step}h0.01`;
    });

    return paths;
}
