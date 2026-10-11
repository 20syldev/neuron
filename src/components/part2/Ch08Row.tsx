import { type CSSProperties } from "react";

import { Callout } from "@/components/part2/kit";
import { shapeSize } from "@/lib/figures";
import { cn } from "@/lib/utils";

export interface Ch08RowProps {
    n: 1 | 2;
    title: string;
    label: string;
    products: readonly number[];
    maxAbs: number;
    score: string;
    scoreLabel: string;
    wins: boolean;
    last?: boolean;
}

/**
 * One row of the plate of chapter 8: a callout and the query and key markers, the eight
 * component-wise products as a row of circles (hollow when negative) and the resulting score.
 *
 * @param n - Callout number of the row, 1 for "animal" and 2 for "boulevard"
 * @param title - Name of the pair shown beside the markers, such as "il" and "animal"
 * @param label - Accessible description of the eight products and their values, read in place of the circles
 * @param products - The eight unrounded products of the query and the key, which size the circles
 * @param maxAbs - Magnitude of a product that fills 92 percent of its cell, shared by both rows so the circles compare
 * @param score - Score already formatted for the active locale
 * @param scoreLabel - Screen reader text spoken before the score
 * @param wins - Whether this score is the higher of the two, which prints it in the signal colour
 * @param last - Adds the closing hairline under the last row, false by default
 */
export function Ch08Row({
    n,
    title,
    label,
    products,
    maxAbs,
    score,
    scoreLabel,
    wins,
    last = false,
}: Ch08RowProps) {
    return (
        <div className={cn("border-t border-border pt-4 pb-[18px]", last && "border-b")}>
            <p className="mb-2 flex items-center gap-2 text-[15px] font-semibold">
                <Callout n={n} size="flush" />
                <span
                    aria-hidden="true"
                    className="inline-block size-[11px] flex-none rounded-full bg-query"
                />
                <span aria-hidden="true" className="inline-block size-[11px] flex-none bg-key" />
                <span className="ml-1">{title}</span>
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div
                    role="img"
                    aria-label={label}
                    className="grid max-w-[520px] min-w-0 flex-[1_1_340px] grid-cols-8"
                >
                    {products.map((value, index) => {
                        const { size, hollow } = shapeSize("circle", value, maxAbs);

                        return (
                            <div
                                key={index}
                                className="relative flex aspect-square min-w-0 items-center justify-center"
                            >
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-y-0 left-1/2 w-px bg-border"
                                />
                                <span
                                    className={cn(
                                        "relative block aspect-square w-(--size) flex-none rounded-full",
                                        hollow
                                            ? "border-[1.5px] border-foreground bg-background"
                                            : "bg-foreground",
                                    )}
                                    style={{ "--size": `${size}%` } as CSSProperties}
                                />
                            </div>
                        );
                    })}
                </div>
                <p className="m-0 flex flex-none items-center gap-3.5">
                    <span
                        aria-hidden="true"
                        className="font-mono text-[30px] leading-none text-muted-foreground"
                    >
                        =
                    </span>
                    <span className="sr-only">{scoreLabel}</span>
                    <span
                        aria-live="polite"
                        className={cn(
                            "font-mono text-[clamp(30px,3.4vw,42px)] leading-none font-medium tracking-[-0.02em]",
                            wins ? "text-signal" : "text-foreground",
                        )}
                    >
                        {score}
                    </span>
                </p>
            </div>
        </div>
    );
}
