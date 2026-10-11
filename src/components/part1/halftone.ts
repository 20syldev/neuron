export interface DotScale {
    pitch: number;
    maxD: number;
    minD: number;
    floorD: number;
}

export interface InkPaths {
    ink: string;
    faint: string;
}

export interface FieldPaths {
    fill: string;
    ring: string;
    faint: string;
}

// Dot scales of the figures: cell pitch and the diameters of a full dot, a small dot and a zero.
export const SCALES = {
    poster: { pitch: 10, maxD: 9.6, minD: 2, floorD: 1.2 },
    grid: { pitch: 11, maxD: 10.4, minD: 2, floorD: 1.5 },
    mini: { pitch: 6, maxD: 6.4, minD: 1.6, floorD: 1.5 },
    layer: { pitch: 11, maxD: 11.6, minD: 2.2, floorD: 1.5 },
    weights: { pitch: 10, maxD: 10.4, minD: 4, floorD: 1.5 },
} satisfies Record<string, DotScale>;

const FLOOR = 0.02;

const FIELD_FLOOR = 0.08;

export const RING_WIDTH = 1.1;

/**
 * Rounds to two decimals, the precision kept in path data.
 *
 * @param value - Length in viewBox units
 * @returns The value rounded to 0.01
 */
function hundredth(value: number): number {
    return Math.round(value * 100) / 100;
}

/**
 * Builds one closed circle as a path subpath.
 *
 * @param cx - Centre abscissa
 * @param cy - Centre ordinate
 * @param r - Radius
 * @returns Path data of the circle, made of two arcs
 */
export function circle(cx: number, cy: number, r: number): string {
    const radius = hundredth(r);

    return `M${hundredth(cx - radius)} ${hundredth(cy)}a${radius} ${radius} 0 1 0 ${hundredth(2 * radius)} 0a${radius} ${radius} 0 1 0 ${hundredth(-2 * radius)} 0Z`;
}

/**
 * Centre of a cell of a square grid.
 *
 * @param index - Row-major index of the cell
 * @param side - Number of cells on a side
 * @param pitch - Side of one cell
 * @returns The centre of the cell, in the units of the pitch
 */
function centre(index: number, side: number, pitch: number): [number, number] {
    return [((index % side) + 0.5) * pitch, (Math.floor(index / side) + 0.5) * pitch];
}

const grids = new Map<string, string>();

/**
 * Builds the faint dot of every cell of a square grid. The path only depends on the grid, so it
 * is built once per size and scale and shared by every figure that uses it.
 *
 * @param side - Number of cells on a side
 * @param scale - Cell pitch and dot diameters
 * @returns Path data of one faint dot per cell
 */
function faintGrid(side: number, scale: DotScale): string {
    const key = `${side}|${scale.pitch}|${scale.floorD}`;
    let grid = grids.get(key);

    if (grid === undefined) {
        grid = "";

        for (let i = 0; i < side * side; i++) {
            const [cx, cy] = centre(i, side, scale.pitch);

            grid += circle(cx, cy, scale.floorD / 2);
        }

        grids.set(key, grid);
    }

    return grid;
}

/**
 * Turns 0 to 1 values into halftone dots whose area is the value: diameter proportional to the
 * square root, with a floor so a small value stays visible. The faint dots of the zeros are the
 * cached grid of the whole field, which the larger dots of the values cover.
 *
 * @param values - One value in 0..1 per cell, row-major
 * @param side - Number of cells on a side
 * @param scale - Cell pitch and dot diameters
 * @param skip - Index of a cell to leave out, drawn separately; -1 to keep all
 * @returns Two single paths: ink, with every dot that carries a value, and faint, with the faint dots of the zeros
 */
export function inkPaths(
    values: ArrayLike<number>,
    side: number,
    scale: DotScale,
    skip = -1,
): InkPaths {
    let ink = "";

    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        if (i === skip || value < FLOOR) {
            continue;
        }

        const [cx, cy] = centre(i, side, scale.pitch);

        ink += circle(cx, cy, Math.max(scale.minD, scale.maxD * Math.sqrt(value)) / 2);
    }

    return { ink, faint: faintGrid(side, scale) };
}

/**
 * Turns signed values in -1..1 into halftone dots: a filled dot for a positive value, a ring for
 * a negative one, area proportional to the magnitude, a faint dot below a small threshold.
 *
 * @param values - One value in -1..1 per cell, row-major
 * @param side - Number of cells on a side
 * @param scale - Cell pitch and dot diameters
 * @returns Three single paths: fill, the filled dots of the positive values; ring, the circles of the negative values, to stroke with RING_WIDTH; and faint, the faint dots of the near zeros
 */
export function fieldPaths(values: ArrayLike<number>, side: number, scale: DotScale): FieldPaths {
    let fill = "";
    let ring = "";
    let faint = "";

    for (let i = 0; i < values.length; i++) {
        const [cx, cy] = centre(i, side, scale.pitch);
        const value = values[i];
        const magnitude = Math.abs(value);

        if (magnitude < FIELD_FLOOR) {
            faint += circle(cx, cy, scale.floorD / 2);
            continue;
        }

        const diameter = Math.max(scale.minD, scale.maxD * Math.sqrt(magnitude));

        if (value > 0) {
            fill += circle(cx, cy, diameter / 2);
        } else {
            ring += circle(cx, cy, (diameter - RING_WIDTH) / 2);
        }
    }

    return { fill, ring, faint };
}

/**
 * Scales activations so the largest one is 1, the way the figures draw them.
 *
 * @param values - Non-negative activations of one layer
 * @returns Values in 0..1, all zeros when the layer is silent
 */
export function normalize(values: ArrayLike<number>): Float32Array {
    let peak = 0;

    for (let i = 0; i < values.length; i++) {
        peak = Math.max(peak, values[i]);
    }

    const scaled = new Float32Array(values.length);

    if (peak > 0) {
        for (let i = 0; i < values.length; i++) {
            scaled[i] = values[i] / peak;
        }
    }

    return scaled;
}

/**
 * Counts the neurons that light up.
 *
 * @param values - Activations after ReLU
 * @returns How many are strictly positive
 */
export function activeCount(values: ArrayLike<number>): number {
    let count = 0;

    for (let i = 0; i < values.length; i++) {
        if (values[i] > 0) {
            count++;
        }
    }

    return count;
}
