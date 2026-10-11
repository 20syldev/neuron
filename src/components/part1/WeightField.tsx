import { useMemo } from "react";

import { cn } from "@/lib/utils";

import { type DotScale, fieldPaths, RING_WIDTH } from "./halftone";

export interface WeightFieldProps {
    values: ArrayLike<number>;
    side: number;
    scale: DotScale;
    label: string;
    className?: string;
}

/**
 * Diverging halftone field of the weights of a neuron, built as three paths: filled dots, rings
 * and faint dots for the near zeros.
 *
 * @param values - One signed value in -1..1 per cell, row-major: a filled dot for a positive
 *   value, a ring for a negative one, the area carrying the magnitude
 * @param side - Number of cells on a side, so values holds side x side entries
 * @param scale - Cell pitch and dot diameters, in the units of the viewBox
 * @param label - Accessible description of the figure, set as the aria-label of the svg
 * @param className - Extra classes merged over the base style, which sizes the square to its
 *   container
 */
export function WeightField({ values, side, scale, label, className }: WeightFieldProps) {
    const extent = side * scale.pitch;
    const paths = useMemo(() => fieldPaths(values, side, scale), [values, side, scale]);

    return (
        <svg
            viewBox={`0 0 ${extent} ${extent}`}
            role="img"
            aria-label={label}
            className={cn("block aspect-square w-full", className)}
        >
            <path d={paths.faint} className="fill-grid" />
            <path d={paths.fill} className="fill-foreground" />
            <path
                d={paths.ring}
                fill="none"
                strokeWidth={RING_WIDTH}
                className="stroke-foreground"
            />
        </svg>
    );
}
