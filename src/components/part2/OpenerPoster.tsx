import { type CSSProperties } from "react";

import { FULL, IL_INDEX, topTwo } from "@/lib/attention";
import { matrixDotPercent } from "@/lib/figures";
import { cn } from "@/lib/utils";

import { Callout } from "./kit";
import { OpenerSpan } from "./OpenerSpan";

export interface OpenerPosterProps {
    label: string;
    query: string;
    extent: string;
}

const HIGHLIGHTED = topTwo(FULL[IL_INDEX], IL_INDEX);

/**
 * The 13 x 13 attention grid of the opener, one dot per weight with its area carrying the value.
 * The row of "il" is boxed and labelled, its two heaviest dots are orange, a second callout marks
 * the column of "animal", and a dimension line under the grid gives the extent. Meant to be drawn
 * inside a dark plate.
 *
 * @param label - Accessible description of the grid, read in place of its 169 dots
 * @param query - Word printed at the left of the row of "il", next to the first callout
 * @param extent - Text of the dimension line under the grid, such as "13 x 13 = 169 weights"
 */
export function OpenerPoster({ label, query, extent }: OpenerPosterProps) {
    return (
        <>
            <div className="relative mx-auto mt-9 max-w-[622px] pl-[62px] max-[561px]:pl-[54px]">
                <div className="relative">
                    <div
                        role="img"
                        aria-label={label}
                        className="grid aspect-square w-full grid-cols-[repeat(13,minmax(0,1fr))]"
                    >
                        {FULL.flatMap((row, i) =>
                            row.map((weight, j) => (
                                <span
                                    key={`${i}-${j}`}
                                    className="flex aspect-square min-w-0 items-center justify-center"
                                >
                                    <span
                                        style={
                                            {
                                                "--dot": `${matrixDotPercent(weight, 0.92)}%`,
                                            } as CSSProperties
                                        }
                                        className={cn(
                                            "block aspect-square w-(--dot) flex-none rounded-full",
                                            i === IL_INDEX && HIGHLIGHTED.includes(j)
                                                ? "bg-signal"
                                                : "bg-foreground",
                                        )}
                                    />
                                </span>
                            )),
                        )}
                    </div>
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-1.5 -left-1.5 top-[calc(100%*9/13)] h-[calc(100%/13)] border border-signal"
                    />
                    <span
                        aria-hidden="true"
                        className="absolute top-[calc(100%*9.5/13)] right-[calc(100%+14px)] flex -translate-y-1/2 items-center gap-1.5 font-mono text-[15px] leading-none font-semibold text-signal-ink max-[561px]:right-[calc(100%+6px)]"
                    >
                        {query}
                        <Callout n={1} />
                    </span>
                    <span
                        aria-hidden="true"
                        className="absolute -top-8 left-[calc(100%*1.5/13)] -translate-x-1/2"
                    >
                        <Callout n={2} />
                    </span>
                </div>
            </div>
            <OpenerSpan className="mx-auto mt-3.5 max-w-[560px]">{extent}</OpenerSpan>
        </>
    );
}
