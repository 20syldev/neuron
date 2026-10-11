import { type CSSProperties } from "react";

import { shapeSize } from "@/lib/figures";
import { cn } from "@/lib/utils";

import { Ch07Marker } from "./Ch07Marker";
import { Callout } from "./kit";

const MAX_COMPONENT = 1.7;

const SHAPE_CLASS = {
    circle: { solid: "rounded-full bg-query", hollow: "rounded-full border-query bg-background" },
    square: { solid: "bg-key", hollow: "border-key bg-background" },
} as const;

export interface Ch07VectorProps {
    n: 1 | 2;
    kind: "circle" | "square";
    title: string;
    note: string;
    changes?: boolean;
    label: string;
    values: readonly number[];
}

/**
 * One vector of chapter 7 as a row of eight cells: a title line with its callout, kind marker and
 * remark, then one halftone shape per component, its area following the magnitude and an empty
 * ring marking a negative value, centred on a hairline guide so the columns line up across rows.
 *
 * @param n - Callout number of the row, 1 for the query and 2 for a key
 * @param kind - Vector kind, which picks the marker and the cell shape: circle for the query, square for a key
 * @param title - Name of the vector, such as the query of the word "il"
 * @param note - Remark printed after the title: that the query changes with the sentence or that a key is fixed
 * @param changes - Prints the remark in the signal ink instead of the muted colour, false by default
 * @param label - Accessible description of the eight components and their values, read in place of the cells
 * @param values - The eight components of the vector, one cell each, negative ones being drawn as hollow shapes
 */
export function Ch07Vector({
    n,
    kind,
    title,
    note,
    changes = false,
    label,
    values,
}: Ch07VectorProps) {
    return (
        <div>
            <p className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-semibold">
                <span className="inline-flex items-center gap-2.5">
                    <Callout n={n} size="flush" />
                    <Ch07Marker kind={kind} />
                    {title}
                </span>
                <span
                    className={cn(
                        "text-[13px] font-medium",
                        changes ? "text-signal-ink" : "text-muted-foreground",
                    )}
                >
                    {note}
                </span>
            </p>
            <div role="img" aria-label={label} className="grid grid-cols-8">
                {values.map((value, index) => {
                    const { size, hollow } = shapeSize(kind, value, MAX_COMPONENT);

                    return (
                        <div
                            key={index}
                            className="relative flex aspect-square max-h-[74px] min-w-0 items-center justify-center"
                        >
                            <span
                                aria-hidden="true"
                                className="absolute inset-y-0 left-1/2 w-px bg-border"
                            />
                            <span
                                style={{ "--size": `${size}%` } as CSSProperties}
                                className={cn(
                                    "relative block aspect-square w-(--size) flex-none",
                                    hollow
                                        ? `border-[1.5px] ${SHAPE_CLASS[kind].hollow}`
                                        : SHAPE_CLASS[kind].solid,
                                )}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
