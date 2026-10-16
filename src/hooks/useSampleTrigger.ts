import { type RefObject, useEffect, useRef } from "react";

const IDLE_MS = 2000;

const SEEN_RATIO = 0.5;

/**
 * Decides when an untouched pad draws a sample by itself. Once the pad has been at least half on
 * screen for two seconds the sample is replayed in front of the reader. When the reader scrolls
 * past the pad without drawing, so that it ends up above the viewport, the finished sample is put
 * at once, since the figures below read the drawing and would otherwise stay empty.
 *
 * @param armed - True while the pad is empty and untouched, the watch being off otherwise
 * @param play - Starts a sample, replayed when its argument is false and finished at once when true
 * @returns The ref to attach to the pad element that is watched
 */
export function useSampleTrigger<T extends Element>(
    armed: boolean,
    play: (instant: boolean) => void,
): RefObject<T | null> {
    const ref = useRef<T>(null);

    useEffect(() => {
        const element = ref.current;

        if (!armed || !element || typeof IntersectionObserver === "undefined") {
            return;
        }

        let timer = 0;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[entries.length - 1];

                window.clearTimeout(timer);

                if (entry.intersectionRatio >= SEEN_RATIO) {
                    timer = window.setTimeout(() => play(false), IDLE_MS);
                } else if (!entry.isIntersecting && entry.boundingClientRect.bottom < 0) {
                    play(true);
                }
            },
            { threshold: [0, SEEN_RATIO] },
        );

        observer.observe(element);

        return () => {
            window.clearTimeout(timer);
            observer.disconnect();
        };
    }, [armed, play]);

    return ref;
}
