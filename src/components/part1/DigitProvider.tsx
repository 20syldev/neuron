"use client";

import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useModel } from "@/hooks/useModel";
import { useSample } from "@/hooks/useSample";
import { type Point, type Stroke, strokesToInput } from "@/lib/digit";
import { forward, type Inference, type Model, mostActive, predicted } from "@/lib/mlp";

import { BRUSH, PAD_SIZE } from "./pad";

export interface DigitContextValue {
    strokes: Stroke[];
    input: Float32Array;
    empty: boolean;
    model: Model | null;
    status: "loading" | "ready" | "error";
    inference: Inference | null;
    digit: number | null;
    confidence: number;
    begin: (point: Point) => void;
    extend: (point: Point) => void;
    end: () => void;
    undo: () => void;
    clear: () => void;
    sample: boolean;
    armed: boolean;
    playSample: (instant: boolean) => void;
}

export interface NeuronContextValue {
    neuron: number;
    best: number;
    model: Model | null;
    status: "loading" | "ready" | "error";
    selectNeuron: (neuron: number | null) => void;
}

export interface DigitProviderProps {
    children: ReactNode;
}

interface Snapshot {
    strokes: Stroke[];
    input: Float32Array;
    inference: Inference | null;
    best: number;
}

const NEURONS = 256;

const DEFAULT_NEURON = 52;

const MIN_STEP = 1.2;

const DigitContext = createContext<DigitContextValue | null>(null);

const NeuronContext = createContext<NeuronContextValue | null>(null);

/**
 * Computes everything the Part I figures derive from the strokes.
 *
 * @param strokes - Polylines in pad coordinates
 * @param model - Network weights, or null before they are downloaded
 * @param previousBest - Most active neuron kept when the new drawing gives no inference
 * @returns The strokes with their network input, their inference when there is ink and a model,
 * and the most active neuron
 */
function compute(strokes: Stroke[], model: Model | null, previousBest: number): Snapshot {
    const input = strokesToInput(strokes, PAD_SIZE, BRUSH);
    const inked = input.some((value) => value > 0);
    const inference = model && inked ? forward(model, input) : null;

    return { strokes, input, inference, best: inference ? mostActive(inference) : previousBest };
}

/**
 * Holds the live state of Part I: the strokes of the pad, the 28 x 28 input they produce, the
 * network inference and the neuron under inspection. Pointer handlers only update a ref and ask
 * for a frame; the input and the inference are computed once per animation frame, so drawing
 * stays smooth however fast the pointer moves. The pad starts empty and nothing is predicted until
 * the reader draws, or until the pad draws a recorded sample by itself when left untouched; the
 * first stroke, undo or clear of the reader replaces the sample for good.
 *
 * @param children - Part I content that reads the drawing and its inference
 */
export function DigitProvider({ children }: DigitProviderProps) {
    const { model, status } = useModel();
    const [snapshot, setSnapshot] = useState<Snapshot>(() => compute([], null, DEFAULT_NEURON));
    const [chosen, setChosen] = useState<number | null>(null);
    const [touched, setTouched] = useState(false);
    const [sample, setSample] = useState(false);

    const strokesRef = useRef<Stroke[]>([]);
    const modelRef = useRef<Model | null>(null);
    const drawingRef = useRef(false);
    const frameRef = useRef(0);
    const bestRef = useRef(DEFAULT_NEURON);
    const sampleRef = useRef(false);

    const flush = useCallback(() => {
        frameRef.current = 0;

        const next = compute(strokesRef.current, modelRef.current, bestRef.current);

        bestRef.current = next.best;
        setSnapshot(next);
    }, []);

    const schedule = useCallback(() => {
        if (!frameRef.current) {
            frameRef.current = requestAnimationFrame(flush);
        }
    }, [flush]);

    const applySample = useCallback(
        (next: Stroke[]) => {
            sampleRef.current = true;
            strokesRef.current = next;
            setSample(true);
            schedule();
        },
        [schedule],
    );

    const player = useSample(PAD_SIZE, applySample);

    const leaveSample = useCallback(() => {
        player.stop();
        setTouched(true);

        const replaced = sampleRef.current;

        sampleRef.current = false;
        setSample(false);

        return replaced;
    }, [player]);

    useEffect(() => {
        modelRef.current = model;
        schedule();
    }, [model, schedule]);

    useEffect(
        () => () => {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = 0;
        },
        [],
    );

    const begin = useCallback(
        (point: Point) => {
            const replaced = leaveSample();

            drawingRef.current = true;
            strokesRef.current = [...(replaced ? [] : strokesRef.current), [point]];
            schedule();
        },
        [leaveSample, schedule],
    );

    const extend = useCallback(
        (point: Point) => {
            if (!drawingRef.current) {
                return;
            }

            const strokes = strokesRef.current;
            const last = strokes[strokes.length - 1];
            const tail = last[last.length - 1];

            if (Math.hypot(point.x - tail.x, point.y - tail.y) < MIN_STEP) {
                return;
            }

            strokesRef.current = [...strokes.slice(0, -1), [...last, point]];
            schedule();
        },
        [schedule],
    );

    const end = useCallback(() => {
        drawingRef.current = false;
        schedule();
    }, [schedule]);

    const undo = useCallback(() => {
        leaveSample();
        drawingRef.current = false;
        strokesRef.current = strokesRef.current.slice(0, -1);
        schedule();
    }, [leaveSample, schedule]);

    const clear = useCallback(() => {
        leaveSample();
        drawingRef.current = false;
        strokesRef.current = [];
        schedule();
    }, [leaveSample, schedule]);

    const selectNeuron = useCallback((neuron: number | null) => {
        setChosen(neuron === null ? null : ((neuron % NEURONS) + NEURONS) % NEURONS);
    }, []);

    const { strokes, input, inference, best } = snapshot;
    const digit = inference ? predicted(inference) : null;
    const confidence = inference && digit !== null ? inference.probs[digit] : 0;
    const neuron = chosen ?? best;

    const value = useMemo<DigitContextValue>(
        () => ({
            strokes,
            input,
            empty: strokes.length === 0,
            model,
            status,
            inference,
            digit,
            confidence,
            begin,
            extend,
            end,
            undo,
            clear,
            sample,
            armed: !touched && strokes.length === 0,
            playSample: player.play,
        }),
        [
            strokes,
            input,
            model,
            status,
            inference,
            digit,
            confidence,
            begin,
            extend,
            end,
            undo,
            clear,
            sample,
            touched,
            player.play,
        ],
    );

    const neurons = useMemo<NeuronContextValue>(
        () => ({ neuron, best, model, status, selectNeuron }),
        [neuron, best, model, status, selectNeuron],
    );

    return (
        <DigitContext.Provider value={value}>
            <NeuronContext.Provider value={neurons}>{children}</NeuronContext.Provider>
        </DigitContext.Provider>
    );
}

/**
 * Reads the live Part I state.
 *
 * @returns The strokes (polylines in pad coordinates), the network input (784 values in 0..1,
 * zeros on an empty pad), the empty flag, the model (null until downloaded) and its download
 * status, the inference (null on an empty pad or before the model is ready), the predicted digit
 * (null without inference) and its probability (0 without inference), the begin (which replaces
 * a sample), extend (ignored when no stroke is active), end, undo (last stroke) and clear (every
 * stroke) actions of the DigitProvider above, whether the strokes are a sample drawn by the pad
 * itself, whether the pad is still untouched and empty so that a sample may be drawn, and the
 * playSample action, which replays a sample or puts it at once when given true
 * @throws When called outside a DigitProvider
 */
export function useDigit(): DigitContextValue {
    const context = useContext(DigitContext);

    if (!context) {
        throw new Error("useDigit must be used inside a DigitProvider");
    }

    return context;
}

/**
 * Reads the neuron selection of Part I. Its value only changes when the neuron under inspection,
 * the most active neuron or the model changes, so readers do not re-render while the reader draws.
 *
 * @returns The selected first layer neuron (shown by the inspector and highlighted in the layers
 * figure), the most active one of the last non-empty drawing, the model and its download status,
 * and the selection action, which wraps around 0 to 255 and goes back to following the most active
 * neuron when given null
 * @throws When called outside a DigitProvider
 */
export function useNeuron(): NeuronContextValue {
    const context = useContext(NeuronContext);

    if (!context) {
        throw new Error("useNeuron must be used inside a DigitProvider");
    }

    return context;
}
