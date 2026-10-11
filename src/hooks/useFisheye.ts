import { type RefObject, useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

// Gaussian spread of the magnification along the row, in px
const SIGMA = 17;

/**
 * Dock magnification of a row of dots, driven by the mouse. Every descendant of the row marked
 * with data-fish and a data-peak ratio (final size over resting size) is scaled by a gaussian of
 * its distance to the pointer. Writes go straight to the elements from an animation frame, so the
 * pointer never triggers a React render; the CSS transition of the dots smooths the steps. The
 * effect does nothing for touch pointers and under prefers-reduced-motion.
 *
 * @returns Ref to attach to the element that contains the dots
 */
export function useFisheye<T extends HTMLElement>(): RefObject<T | null> {
    const ref = useRef<T>(null);
    const reduced = useReducedMotion();

    useEffect(() => {
        const row = ref.current;
        if (!row || reduced) return;

        const dots = Array.from(row.querySelectorAll<HTMLElement>("[data-fish]"));
        let centers: number[] = [];
        let pointer = 0;
        let frame = 0;

        const apply = () => {
            frame = 0;

            dots.forEach((dot, index) => {
                const peak = Number(dot.dataset.peak) || 1;
                const distance = ((centers[index] ?? 0) - pointer) / SIGMA;
                const gain = Math.exp(-distance * distance);
                dot.style.transform = `scale(${(1 + (peak - 1) * gain).toFixed(3)})`;
            });
        };

        const reset = () => {
            if (frame) cancelAnimationFrame(frame);
            frame = 0;
            dots.forEach((dot) => {
                dot.style.transform = "";
            });
        };

        const measure = (event: PointerEvent) => {
            if (event.pointerType === "touch") return;

            centers = dots.map((dot) => {
                const rect = dot.getBoundingClientRect();
                return rect.left + rect.width / 2;
            });
        };

        const move = (event: PointerEvent) => {
            if (event.pointerType === "touch") return;

            pointer = event.clientX;
            if (!frame) frame = requestAnimationFrame(apply);
        };

        row.addEventListener("pointerenter", measure);
        row.addEventListener("pointermove", move);
        row.addEventListener("pointerleave", reset);

        return () => {
            row.removeEventListener("pointerenter", measure);
            row.removeEventListener("pointermove", move);
            row.removeEventListener("pointerleave", reset);
            reset();
        };
    }, [reduced]);

    return ref;
}
