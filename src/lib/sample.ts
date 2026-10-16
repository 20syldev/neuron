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
 * Turns a recorded drawing into a playable plan. The points keep the position and the shape they
 * were recorded with; only the clock changes: it is sped up a little and held between 1.3 and 2.5
 * seconds, pauses between strokes included, so every sample takes about the same time to draw.
 *
 * @param drawing - Strokes of flat x, y, ms triples in pad units, the time from the first point
 * @param digit - Digit the drawing stands for, kept on the plan
 * @returns The strokes with their timestamps in milliseconds from the start and the total duration
 */
export function composeSample(drawing: RawDrawing, digit: number): SamplePlan {
    const raw = drawing.map((flat) =>
        Array.from({ length: flat.length / 3 }, (_, i) => ({
            x: flat[i * 3],
            y: flat[i * 3 + 1],
            t: flat[i * 3 + 2],
        })),
    );
    const recorded = Math.max(...raw.flat().map((p) => p.t), 1);
    const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, recorded / SPEED_UP));
    const clock = duration / recorded;

    return {
        digit,
        duration,
        strokes: raw.map((stroke) => stroke.map((p) => ({ x: p.x, y: p.y, t: p.t * clock }))),
    };
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
