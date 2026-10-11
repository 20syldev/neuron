import { type RefObject, useEffect } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

const MASTHEAD_ID = "masthead";

/**
 * Height of the masthead, which is the scroll distance after which the compact bar sticks. It is
 * measured on the rendered element, so a tagline that wraps on three lines on a narrow phone is
 * counted; the id is the one of the Masthead wrapper.
 *
 * @returns Masthead height in px, 0 when it is not mounted
 */
function mastheadHeight() {
    return document.getElementById(MASTHEAD_ID)?.offsetHeight ?? 0;
}

/**
 * Reveals the pill as the masthead scrolls away: over 80 px starting 48 px before the masthead
 * ends it goes from hidden to opaque and rises by 14 px. The element receives the custom
 * properties --reveal (0 to 1) and --lift (px) and a data-shown flag that is "false" while fully
 * hidden, written straight to the DOM from an animation frame. Under reduced motion it only fades.
 *
 * @param ref - Ref of the element that carries the properties and the flag
 */
export function usePillReveal(ref: RefObject<HTMLElement | null>) {
    const reduced = useReducedMotion();

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        let frame = 0;

        const update = () => {
            frame = 0;

            const from = mastheadHeight() - 48;
            const reveal = Math.min(1, Math.max(0, (window.scrollY - from) / 80));

            element.style.setProperty("--reveal", reveal.toFixed(3));
            element.style.setProperty(
                "--lift",
                `${reduced ? 0 : ((1 - reveal) * 14).toFixed(2)}px`,
            );
            element.dataset.shown = reveal > 0 ? "true" : "false";
        };

        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        update();

        return () => {
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [ref, reduced]);
}
