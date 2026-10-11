import { type Point, type Stroke } from "@/lib/digit";

export const PAD_SIZE = 336;

export const BRUSH = 24;

export const CELL = PAD_SIZE / 28;

export const PAD_GRID_PATH = Array.from(
    { length: 28 },
    (_, row) => `M6 ${6 + row * CELL}H${PAD_SIZE - 6}`,
).join("");

/**
 * Rounds a pad coordinate to a tenth, enough for a smooth path and short strings.
 *
 * @param value - Coordinate in pad units
 * @returns The coordinate rounded to one decimal
 */
function tenth(value: number): number {
    return Math.round(value * 10) / 10;
}

/**
 * Builds the SVG path of a stroke, smoothed with quadratic curves that pass through the midpoints
 * of consecutive points. A single point becomes a dot, drawn by the round cap of a tiny segment.
 *
 * @param points - Points of one stroke, in pad coordinates
 * @returns Path data to draw with a round line cap and join, empty for an empty stroke
 */
export function strokePath(points: Stroke): string {
    if (points.length === 0) {
        return "";
    }

    const first = points[0];

    if (points.length === 1) {
        return `M${tenth(first.x)} ${tenth(first.y)}h0.01`;
    }

    let path = `M${tenth(first.x)} ${tenth(first.y)}`;

    for (let i = 1; i < points.length - 1; i++) {
        const control = points[i];
        const next = points[i + 1];

        path += `Q${tenth(control.x)} ${tenth(control.y)} ${tenth((control.x + next.x) / 2)} ${tenth((control.y + next.y) / 2)}`;
    }

    const last = points[points.length - 1];

    return `${path}L${tenth(last.x)} ${tenth(last.y)}`;
}

export interface PadBox {
    left: number;
    top: number;
    width: number;
}

/**
 * Measures the pad on screen. Reading the box forces a layout when the page changed since the
 * last frame, so callers measure once per stroke and reuse the result.
 *
 * @param element - The pad svg element, measured in its current on-screen state
 * @returns The left and top edges of the pad and its width, which is also its height, all in
 *   viewport pixels
 */
export function padBox(element: Element): PadBox {
    const { left, top, width } = element.getBoundingClientRect();

    return { left, top, width };
}

/**
 * Converts a pointer position to pad coordinates.
 *
 * @param box - Measured box of the pad, whose width gives the scale between screen pixels and pad
 *   units
 * @param clientX - Pointer abscissa in viewport pixels
 * @param clientY - Pointer ordinate in viewport pixels
 * @returns The point in the 336 unit pad space, clamped to the pad
 */
export function padPoint(box: PadBox, clientX: number, clientY: number): Point {
    const scale = PAD_SIZE / Math.max(1, box.width);

    return {
        x: Math.min(PAD_SIZE, Math.max(0, (clientX - box.left) * scale)),
        y: Math.min(PAD_SIZE, Math.max(0, (clientY - box.top) * scale)),
    };
}
