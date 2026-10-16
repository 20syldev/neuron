import { useCallback, useEffect, useMemo, useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { type Stroke } from "@/lib/digit";
import { composeSample, pickSample, revealSample } from "@/lib/sample";

export interface SamplePlayer {
    play: (instant: boolean) => void;
    stop: () => void;
}

/**
 * Replays a recorded hand-drawn digit on the pad, stroke by stroke at the pace of the recording,
 * so the figures of Part I have something to show when the reader does not draw. The recordings
 * are loaded on first use, in a separate chunk, so readers who draw never download them.
 *
 * @param size - Side of the square pad, in the units of the strokes handed to apply
 * @param apply - Receives the strokes visible at each frame, then the whole drawing at the end;
 *   it must keep the same identity between renders
 * @returns The player: play(instant) starts a replay, or puts the finished drawing at once when
 *   instant is true or the reader prefers reduced motion; stop() cancels a replay and any load
 *   in flight, leaving the strokes where they are. Both keep the same identity between renders
 */
export function useSample(size: number, apply: (strokes: Stroke[]) => void): SamplePlayer {
    const reduced = useReducedMotion();
    const frameRef = useRef(0);
    const tokenRef = useRef(0);
    const lastRef = useRef<number | null>(null);

    const stop = useCallback(() => {
        tokenRef.current += 1;
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
    }, []);

    const play = useCallback(
        (instant: boolean) => {
            stop();

            const token = tokenRef.current;

            void import("@/lib/sampleData").then(({ SAMPLES }) => {
                if (token !== tokenRef.current) {
                    return;
                }

                const picked = pickSample(SAMPLES, Math.random, lastRef.current);
                const plan = composeSample(picked.drawing, picked.digit, size, Math.random);

                lastRef.current = picked.digit;

                if (instant || reduced) {
                    apply(revealSample(plan, plan.duration));
                    return;
                }

                const start = performance.now();

                const tick = (now: number) => {
                    if (token !== tokenRef.current) {
                        return;
                    }

                    const elapsed = now - start;

                    apply(revealSample(plan, elapsed));
                    frameRef.current = elapsed < plan.duration ? requestAnimationFrame(tick) : 0;
                };

                frameRef.current = requestAnimationFrame(tick);
            });
        },
        [apply, reduced, size, stop],
    );

    useEffect(() => stop, [stop]);

    return useMemo(() => ({ play, stop }), [play, stop]);
}
