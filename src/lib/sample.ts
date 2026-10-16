import { type Point, type Stroke } from "@/lib/digit";

export type RawDrawing = readonly (readonly number[])[];

export type RawSamples = Readonly<Record<number, readonly RawDrawing[]>>;

export interface TimedPoint extends Point {
    t: number;
}

export interface SamplePlan {
    digit: number;
    duration: number;
    strokes: TimedPoint[][];
}

export interface PickedSample {
    digit: number;
    drawing: RawDrawing;
}

const MIN_DURATION = 1300;

const MAX_DURATION = 2500;

const SPEED_UP = 1.25;

const MAX_SCALE = 1.7;

const MARGIN = 16;

/**
 * Picks the digit and the recorded drawing a sample will replay: the digit uniformly among the
 * recorded ones, then one of its drawings uniformly.
 *
 * @param samples - Recorded drawings per digit, every digit holding at least one drawing
 * @param random - Source of numbers in [0, 1), injected so a test can drive the choice
 * @param previous - Digit of the last sample, avoided when another digit is recorded, or null
 * @returns The chosen digit and the recorded drawing to replay
 */
export function pickSample(
    samples: RawSamples,
    random: () => number,
    previous: number | null,
): PickedSample {
    const digits = Object.keys(samples)
        .map(Number)
        .filter((digit) => samples[digit].length > 0);
    const others = digits.filter((digit) => digit !== previous);
    const pool = others.length > 0 ? others : digits;
    const digit = pool[Math.floor(random() * pool.length)];
    const drawings = samples[digit];

    return { digit, drawing: drawings[Math.floor(random() * drawings.length)] };
}

/**
 * Turns a recorded drawing into a playable plan: the drawing is centred on the pad, scaled to
 * about two thirds of it, slightly rotated, sheared and shifted so that no two replays look alike,
 * and its timeline is sped up and held between 1.3 and 2.5 seconds, pauses included.
 *
 * @param drawing - Strokes of flat x, y, ms triples in pad units, the time from the first point
 * @param digit - Digit the drawing stands for, kept on the plan
 * @param size - Side of the square pad, in the units of the recorded points
 * @param random - Source of numbers in [0, 1), injected so a test can drive the variation
 * @returns The strokes with their timestamps in milliseconds from the start and the total duration
 */
export function composeSample(
    drawing: RawDrawing,
    digit: number,
    size: number,
    random: () => number,
): SamplePlan {
    const raw = drawing.map((flat) =>
        Array.from({ length: flat.length / 3 }, (_, i) => ({
            x: flat[i * 3],
            y: flat[i * 3 + 1],
            t: flat[i * 3 + 2],
        })),
    );
    const all = raw.flat();
    const minX = Math.min(...all.map((p) => p.x));
    const maxX = Math.max(...all.map((p) => p.x));
    const minY = Math.min(...all.map((p) => p.y));
    const maxY = Math.max(...all.map((p) => p.y));
    const span = Math.max(maxX - minX, maxY - minY, 1);

    const scale = Math.min(MAX_SCALE, (size * (0.6 + random() * 0.1)) / span);
    const angle = ((random() - 0.5) * 8 * Math.PI) / 180;
    const shear = (random() - 0.5) * 0.12;
    const centerX = size / 2 + (random() - 0.5) * 20;
    const centerY = size / 2 + (random() - 0.5) * 16;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const recorded = Math.max(...all.map((p) => p.t), 1);
    const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, recorded / SPEED_UP));
    const clock = duration / recorded;

    const strokes = raw.map((stroke) =>
        stroke.map((p) => {
            const u = (p.x - (minX + maxX) / 2) * scale;
            const v = (p.y - (minY + maxY) / 2) * scale;
            const sheared = u + shear * v;
            const x = centerX + sheared * cos - v * sin;
            const y = centerY + sheared * sin + v * cos;

            return {
                x: Math.min(size - MARGIN, Math.max(MARGIN, x)),
                y: Math.min(size - MARGIN, Math.max(MARGIN, y)),
                t: p.t * clock,
            };
        }),
    );

    return { digit, duration, strokes };
}

/**
 * Gives the strokes of a plan as drawn after some time, as if the pen had been replaying it: the
 * finished strokes whole and the one under the pen cut at the pen position, which is interpolated
 * between the two recorded points around the time so the line moves smoothly.
 *
 * @param plan - Plan from composeSample
 * @param elapsed - Milliseconds since the replay started, the full drawing past the duration
 * @returns The visible strokes, empty before the first point, as fresh arrays that are safe to keep
 */
export function revealSample(plan: SamplePlan, elapsed: number): Stroke[] {
    const shown: Stroke[] = [];

    for (const stroke of plan.strokes) {
        if (stroke[0].t > elapsed) {
            break;
        }

        const last = stroke[stroke.length - 1];

        if (last.t <= elapsed) {
            shown.push(stroke.map(({ x, y }) => ({ x, y })));
            continue;
        }

        const index = stroke.findIndex((point) => point.t > elapsed);
        const before = stroke[index - 1];
        const after = stroke[index];
        const ratio = (elapsed - before.t) / Math.max(1, after.t - before.t);
        const head = {
            x: before.x + (after.x - before.x) * ratio,
            y: before.y + (after.y - before.y) * ratio,
        };

        shown.push([...stroke.slice(0, index).map(({ x, y }) => ({ x, y })), head]);
        break;
    }

    return shown;
}
