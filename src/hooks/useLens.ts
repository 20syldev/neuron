import { type RefObject, useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { type HalftoneDot, lensFalloff, lensRadius, round2 } from "@/lib/halftone";

export interface LensOptions {
    field: readonly HalftoneDot[];
    width: number;
    sigmaPx: number;
    sigBoost?: number;
}

/**
 * Pointer lens of a halftone field: the dots around the mouse swell by a gaussian of their
 * distance to it, and relax when it leaves. The host element must contain one svg and one circle
 * marked data-dot per dot of the field, in field order. Radii are written straight to the
 * circles as a CSS property from an animation frame, so a pointer move never triggers a React
 * render; the CSS transition of the circles eases the steps, shorter while the lens is engaged
 * (data-hot on the host). Touch pointers and reduced motion do nothing.
 *
 * @param field - Dots of the field, in the order of the circles marked data-dot inside the host
 * @param width - Width of the field in viewBox units, to convert pointer pixels into field units
 * @param sigmaPx - Standard deviation of the lens in screen px, the spread of the swell
 * @param sigBoost - Factor applied to the radius of the signal dot, for a mark whose orange dot is
 *   boosted, 1 (no boost) by default
 * @returns Ref to attach to the host element that receives the pointer
 */
export function useLens<T extends HTMLElement>({
    field,
    width,
    sigmaPx,
    sigBoost = 1,
}: LensOptions): RefObject<T | null> {
    const ref = useRef<T>(null);
    const reduced = useReducedMotion();

    useEffect(() => {
        const host = ref.current;
        const svg = host?.querySelector("svg");
        if (!host || !svg || reduced) return;

        const circles = Array.from(host.querySelectorAll<SVGCircleElement>("circle[data-dot]"));
        const radii: (number | null)[] = circles.map(() => null);
        let pointer = { x: 0, y: 0 };
        let frame = 0;

        const apply = () => {
            frame = 0;

            const rect = svg.getBoundingClientRect();
            const scale = width / rect.width;
            const ux = (pointer.x - rect.left) * scale;
            const uy = (pointer.y - rect.top) * scale;

            circles.forEach((circle, index) => {
                const dot = field[index];
                const falloff = lensFalloff(dot, ux, uy, sigmaPx * scale);
                const boost = dot.kind === "sig" ? sigBoost : 1;
                const next = falloff < 0.002 ? null : round2(lensRadius(dot, falloff) * boost);

                if (next === radii[index]) return;

                radii[index] = next;
                if (next === null) circle.style.removeProperty("r");
                else circle.style.setProperty("r", `${next}px`);
            });
        };

        const relax = () => {
            if (frame) cancelAnimationFrame(frame);
            frame = 0;
            host.dataset.hot = "false";

            circles.forEach((circle, index) => {
                radii[index] = null;
                circle.style.removeProperty("r");
            });
        };

        const move = (event: PointerEvent) => {
            if (event.pointerType === "touch") return;

            host.dataset.hot = "true";
            pointer = { x: event.clientX, y: event.clientY };
            if (!frame) frame = requestAnimationFrame(apply);
        };

        host.addEventListener("pointermove", move);
        host.addEventListener("pointerleave", relax);

        return () => {
            host.removeEventListener("pointermove", move);
            host.removeEventListener("pointerleave", relax);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [field, width, sigmaPx, sigBoost, reduced]);

    return ref;
}
