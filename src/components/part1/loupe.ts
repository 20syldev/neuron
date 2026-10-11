import { INPUT_SIDE } from "./network";

export interface LoupeWindow {
    row: number;
    col: number;
}

export const WINDOW_SIZE = 6;

const LAST_ORIGIN = INPUT_SIDE - WINDOW_SIZE;

const EDGE_LOW = 0.02;

const EDGE_HIGH = 0.98;

const BLANK_ORIGIN = (INPUT_SIDE - WINDOW_SIZE) / 2;

const FRAME_SIZE = 20;

const FRAME_MARGIN = 4;

/**
 * Keeps a window origin inside the image.
 *
 * @param origin - Requested row and column of the top left pixel of the window, in image cells
 * @returns The same window moved back inside the 28 x 28 image when it sticks out
 */
export function clampWindow(origin: LoupeWindow): LoupeWindow {
    return {
        row: Math.min(LAST_ORIGIN, Math.max(0, origin.row)),
        col: Math.min(LAST_ORIGIN, Math.max(0, origin.col)),
    };
}

/**
 * Places a window around a pixel, the pixel being one of its four middle ones.
 *
 * @param row - Row of the pixel the pointer is over
 * @param col - Column of the pixel the pointer is over
 * @returns The window around that pixel, kept inside the image
 */
export function windowAround(row: number, col: number): LoupeWindow {
    return clampWindow({ row: row - 2, col: col - 2 });
}

/**
 * Finds the window that is most worth enlarging: the one with the most soft edge pixels, the
 * values strictly between ink and background, which are what the enlargement is there to show.
 * Ties go to the window with more ink.
 *
 * @param input - The 784 values of the image, row-major
 * @returns The best window, the middle of the image when it is blank
 */
export function bestWindow(input: ArrayLike<number>): LoupeWindow {
    let best: LoupeWindow = { row: 0, col: 0 };
    let bestEdges = -1;
    let bestInk = -1;

    for (let row = 0; row <= LAST_ORIGIN; row++) {
        for (let col = 0; col <= LAST_ORIGIN; col++) {
            let edges = 0;
            let ink = 0;

            for (let y = row; y < row + WINDOW_SIZE; y++) {
                for (let x = col; x < col + WINDOW_SIZE; x++) {
                    const value = input[y * INPUT_SIDE + x];

                    if (value > EDGE_LOW && value < EDGE_HIGH) {
                        edges++;
                    }

                    ink += value;
                }
            }

            if (edges > bestEdges || (edges === bestEdges && ink > bestInk)) {
                best = { row, col };
                bestEdges = edges;
                bestInk = ink;
            }
        }
    }

    return bestInk > 0 ? best : { row: BLANK_ORIGIN, col: BLANK_ORIGIN };
}

/**
 * Finds where the 20 x 20 frame of the preprocessing sits on the 28 x 28 image: the square is
 * centred on the ink, because the digit is fitted into it and then moved so its centre of mass
 * lands in the middle of the image, which can take it off the central square.
 *
 * @param input - The 784 values of the image, row-major
 * @returns The top left cell of the frame, the central square (4, 4) when the image is blank
 */
export function frameOrigin(input: ArrayLike<number>): LoupeWindow {
    let minX = INPUT_SIDE;
    let minY = INPUT_SIDE;
    let maxX = -1;
    let maxY = -1;

    for (let index = 0; index < INPUT_SIDE * INPUT_SIDE; index++) {
        if (input[index] > EDGE_LOW) {
            const x = index % INPUT_SIDE;
            const y = Math.floor(index / INPUT_SIDE);

            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
    }

    if (maxX < 0) {
        return { row: FRAME_MARGIN, col: FRAME_MARGIN };
    }

    const limit = INPUT_SIDE - FRAME_SIZE;

    return {
        row: Math.min(limit, Math.max(0, Math.round((minY + maxY + 1) / 2 - FRAME_SIZE / 2))),
        col: Math.min(limit, Math.max(0, Math.round((minX + maxX + 1) / 2 - FRAME_SIZE / 2))),
    };
}
