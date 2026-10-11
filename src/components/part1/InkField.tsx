import { useMemo } from "react";

import { useNearViewport } from "@/hooks/useNearViewport";
import { cn } from "@/lib/utils";

import { circle, type DotScale, inkPaths } from "./halftone";
import { useHeld } from "./held";

export interface InkFieldProps {
    values: ArrayLike<number>;
    side: number;
    scale: DotScale;
    highlight?: number;
    label?: string;
    className?: string;
}

const RING_GAP = 3;

/**
 * Halftone field of a square grid in one svg of at most three paths, so a 784 cell image or a
 * 256 neuron layer repaints cheaply while the reader draws. The optional highlighted cell is the
 * neuron under inspection. A field far from the viewport stops following new values and catches up
 * when it comes close again.
 *
 * @param values - One value in 0..1 per cell, row-major; the area of a dot carries the value
 * @param side - Number of cells on a side
 * @param scale - Cell pitch and dot diameters, in the units of the viewBox
 * @param highlight - Index of a cell drawn in the signal colour with a ring around it, -1 for none
 * @param label - Accessible description of the figure; without it the field is hidden from assistive technology
 * @param className - Extra classes merged over the base style, which sizes the square to its container
 */
export function InkField({
    values: live,
    side,
    scale,
    highlight = -1,
    label,
    className,
}: InkFieldProps) {
    const { ref, near } = useNearViewport<SVGSVGElement>();
    const values = useHeld(live, near);
    const extent = side * scale.pitch;
    const paths = useMemo(
        () => inkPaths(values, side, scale, highlight),
        [values, side, scale, highlight],
    );
    const mark = useMemo(() => {
        if (highlight < 0) {
            return null;
        }

        const cx = ((highlight % side) + 0.5) * scale.pitch;
        const cy = (Math.floor(highlight / side) + 0.5) * scale.pitch;
        const diameter = Math.max(scale.minD, scale.maxD * Math.sqrt(values[highlight] ?? 0));

        return { dot: circle(cx, cy, diameter / 2), ring: circle(cx, cy, diameter / 2 + RING_GAP) };
    }, [highlight, side, scale, values]);

    return (
        <svg
            ref={ref}
            viewBox={`0 0 ${extent} ${extent}`}
            role={label ? "img" : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            className={cn("block aspect-square w-full", className)}
        >
            <path d={paths.faint} className="fill-grid" />
            <path d={paths.ink} className="fill-foreground" />
            {mark ? (
                <>
                    <path d={mark.dot} className="fill-signal" />
                    <path d={mark.ring} fill="none" strokeWidth={1} className="stroke-signal" />
                </>
            ) : null}
        </svg>
    );
}
