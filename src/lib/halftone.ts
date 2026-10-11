import { MOTION } from "@/lib/motion";

export type DotKind = "ink" | "halo" | "grid" | "sig";

export type GlyphKey = "n" | "nMark" | "e" | "u" | "r" | "o" | "four";

export interface HalftoneDot {
    x: number;
    y: number;
    diag: number;
    phase: number;
    kind: DotKind;
    r: number;
}

export interface DotDelays {
    idle: number;
    arrive: number;
}

export interface Cell {
    x: number;
    y: number;
}

export const PITCH = 10;

// Radii as a share of the pitch; sigSmall is the optical boost of the orange dot on the small mark
export const WM = { ink: 0.42, halo: 0.48, grid: 0.07, sig: 0.38, sigSmall: 1.35 } as const;

// Dot bitmaps, every letter sits on the x-height and is 7 rows high
const GLYPHS: Record<GlyphKey, readonly string[]> = {
    n: ["XXXX.", "X...X", "X...X", "X...X", "X...X", "X...X", "X...X"],
    nMark: ["XXXX.", "X...X", "X...X", "X...X", "X...X"],
    e: [".XXX.", "X...X", "X...X", "XXXXX", "X....", "X....", ".XXXX"],
    u: ["X...X", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXXX"],
    r: ["X.XX", "XX..", "X...", "X...", "X...", "X...", "X..."],
    o: [".XXX.", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."],
    four: ["...X.", "..XX.", ".X.X.", "X..X.", "XXXXX", "...X.", "...X."],
};

const WORD: readonly GlyphKey[] = ["n", "e", "u", "r", "o", "n"];

const LOST: readonly GlyphKey[] = ["four", "o", "four"];

// Signal cell in the counter of the first "n", of the 5 x 5 mark and of the "0" of 404.
export const WORD_SIG: Cell = { x: 3, y: 4 };
export const MARK_SIG: Cell = { x: 3, y: 3 };
export const LOST_SIG: Cell = { x: 9, y: 4 };

/**
 * Squares a radius or a length, since the lens swells the area of a dot rather than its radius.
 *
 * @param n - Length in viewBox units
 * @returns The area-like quantity n * n, to be rooted back into a radius
 */
function sq(n: number) {
    return n * n;
}

/**
 * Rounds to two decimals, the precision kept for SVG coordinates.
 *
 * @param n - Value in viewBox units or seconds
 * @returns The value rounded to 0.01
 */
export function round2(n: number) {
    return Math.round(n * 100) / 100;
}

/**
 * Builds the dot bitmap of a word with a one-cell margin all round and one blank column between
 * letters.
 *
 * @param keys - Glyph keys in reading order; all glyphs must have the same row count
 * @returns Rows of 0 and 1, 1 where a letter is inked
 */
export function wordBits(keys: readonly GlyphKey[]) {
    const height = GLYPHS[keys[0]].length;
    const rows: number[][] = Array.from({ length: height }, () => [0]);

    keys.forEach((key, index) => {
        const glyph = GLYPHS[key];

        for (let row = 0; row < height; row++) {
            if (index > 0) rows[row].push(0);
            for (const cell of glyph[row]) rows[row].push(cell === "X" ? 1 : 0);
        }
    });

    rows.forEach((row) => row.push(0));

    const blank = rows[0].map(() => 0);

    return [blank, ...rows, blank.slice()];
}

/**
 * Builds the halftone field of a word: one dot per cell, in row-major order. Inked cells are
 * full dots, their neighbours get a smaller halo dot, empty cells keep a faint grid dot and one
 * signal dot sits in the given cell.
 *
 * @param word - Glyph keys of the word
 * @param sig - Cell of the signal dot, in cells from the top left of the bitmap
 * @returns The dots with their position and resting radius in viewBox units, their kind, their rank in the arrival wave (diag, 0 to 1 along the diagonal) and their phase in the idle wave (in wavelengths), in a viewBox of (columns * PITCH) by (rows * PITCH) units
 */
export function halftoneField(word: readonly GlyphKey[], sig: Cell) {
    const bits = wordBits(word);
    const rows = bits.length;
    const cols = bits[0].length;
    const out: HalftoneDot[] = [];

    const at = (y: number, x: number) =>
        y >= 0 && y < rows && x >= 0 && x < cols ? bits[y][x] : 0;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const dot: HalftoneDot = {
                x: (x + 0.5) * PITCH,
                y: (y + 0.5) * PITCH,
                diag: (x + 1.2 * y) / (cols + 1.2 * rows),
                phase: (MOTION.idle.wavelengths * (x + y)) / (cols + rows),
                kind: "grid",
                r: WM.grid * PITCH,
            };
            const orth = at(y - 1, x) + at(y + 1, x) + at(y, x - 1) + at(y, x + 1);
            const diagonal =
                at(y - 1, x - 1) + at(y - 1, x + 1) + at(y + 1, x - 1) + at(y + 1, x + 1);

            if (y === sig.y && x === sig.x) {
                dot.kind = "sig";
                dot.r = WM.sig * PITCH;
            } else if (bits[y][x]) {
                dot.kind = "ink";
                dot.r = WM.ink * PITCH * Math.sqrt(orth >= 2 ? 1 : 0.78);
            } else {
                const value = Math.min(0.3, 0.12 * orth + 0.04 * diagonal);

                if (value >= 0.05) {
                    dot.kind = "halo";
                    dot.r = WM.halo * PITCH * Math.sqrt(value);
                }
            }

            out.push(dot);
        }
    }

    return out;
}

export const WORD_FIELD = halftoneField(WORD, WORD_SIG);
export const MARK_FIELD = halftoneField(["nMark"], MARK_SIG);
export const LOST_FIELD = halftoneField(LOST, LOST_SIG);

export const WORD_VIEW = { width: 360, height: 90 } as const;
export const MARK_VIEW = { width: 70, height: 70 } as const;
export const LOST_VIEW = { width: 190, height: 90 } as const;

/**
 * Finds the signal dot of a field.
 *
 * @param field - Dots built by halftoneField
 * @returns The signal dot, which every field has exactly once
 */
export function signalOf(field: readonly HalftoneDot[]) {
    return field.find((dot) => dot.kind === "sig") ?? field[0];
}

/**
 * Computes the animation delays of one dot. The arrival is a one-shot growth from zero in
 * diagonal order; the looping animation is the idle wave, whose negative delay only sets its
 * phase, or for the signal dot the breath, which starts when the arrival ends.
 *
 * @param dot - Dot of a wordmark field
 * @returns The delay of the looping animation (idle wave or breath), negative to set its phase, and the delay of the one-shot arrival growth, both in seconds
 */
export function dotDelays(dot: HalftoneDot): DotDelays {
    const arrive = MOTION.arrive;

    if (dot.kind === "sig") return { idle: arrive.total, arrive: arrive.sig };

    const range = arrive[dot.kind];

    return {
        idle: round2(-(1 - (dot.phase % 1)) * MOTION.idle.period),
        arrive: round2(range[0] + range[1] * dot.diag),
    };
}

/**
 * Computes the radius of a dot under the pointer lens. The area of the dots around the pointer
 * swells by up to the lens gain, capped so neighbours never fuse; grid dots, nearly invisible,
 * rise to a halo-sized dot instead, and halo dots also gain half a halo-to-ink step so the lens
 * reads as a glow of denser dots.
 *
 * @param dot - Dot of a halftone field
 * @param falloff - Strength of the lens on this dot, 0 to 1, from lensFalloff
 * @returns The radius in viewBox units, the resting one when the lens barely reaches the dot
 */
export function lensRadius(dot: HalftoneDot, falloff: number) {
    const lens = MOTION.lens;

    if (falloff < 0.002) return dot.r;

    if (dot.kind === "grid") {
        return Math.sqrt(sq(dot.r) + lens.gain * falloff * sq(lens.gridReach * PITCH));
    }

    const extra = dot.kind === "halo" ? 0.5 * lens.gain * falloff * sq(0.8 * WM.ink * PITCH) : 0;

    return Math.min(Math.sqrt(sq(dot.r) * (1 + lens.gain * falloff) + extra), 0.51 * PITCH);
}

/**
 * Computes the gaussian falloff of the lens with the distance to the pointer.
 *
 * @param dot - Dot of a halftone field
 * @param ux - Pointer x in viewBox units
 * @param uy - Pointer y in viewBox units
 * @param sigma - Standard deviation of the lens in viewBox units
 * @returns 1 under the pointer, tending to 0 away from it
 */
export function lensFalloff(dot: HalftoneDot, ux: number, uy: number, sigma: number) {
    return Math.exp(-sq(Math.hypot(dot.x - ux, dot.y - uy) / sigma));
}
