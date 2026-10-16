import { type RefObject, useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

const START_MS = 250;

const NEXT_MS = 3000;

/**
 * Decides when an untouched Part I draws samples by itself. As soon as the section appears on
 * screen a sample is drawn, then three seconds after each one is complete the next digit replaces
 * it, for as long as the section is on screen and the reader does nothing. When the section is
 * entirely above the viewport, because the reader jumped past it, a finished sample is put at
 * once, since the figures read the drawing and would otherwise stay empty. Under reduced motion a
 * single finished sample is put and never changed.
 *
 * @param armed - True while the reader has not touched the pad, the watch being off otherwise
 * @param play - Starts a sample, drawn when its argument is false and finished at once when true,
 *   and resolves to true when the sample is complete or to false when it was cut short
 * @returns The ref to attach to the element that holds the whole section
 */
export function useSampleTrigger<T extends Element>(
    armed: boolean,
    play: (instant: boolean) => Promise<boolean>,
): RefObject<T | null> {
    const ref = useRef<T>(null);
    const reduced = useReducedMotion();

    useEffect(() => {
        const element = ref.current;

        if (!armed || !element || typeof IntersectionObserver === "undefined") {
            return;
        }

        let timer = 0;
        let active = false;

        const next = () => {
            void play(reduced).then((finished) => {
                if (finished && active && !reduced) {
                    timer = window.setTimeout(next, NEXT_MS);
                }
            });
        };

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[entries.length - 1];

            if (entry.isIntersecting) {
                if (!active) {
                    active = true;
                    timer = window.setTimeout(next, START_MS);
                }

                return;
            }

            window.clearTimeout(timer);
            active = false;

            if (entry.boundingClientRect.bottom < 0) {
                void play(true);
            }
        });

        observer.observe(element);

        return () => {
            window.clearTimeout(timer);
            observer.disconnect();
        };
    }, [armed, play, reduced]);

    return ref;
}
