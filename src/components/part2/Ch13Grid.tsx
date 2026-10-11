import { type CSSProperties, Fragment } from "react";

import { Callout } from "@/components/part2/kit";
import { LAST_INDEX, type Matrix } from "@/lib/attention";
import { matrixDotPercent } from "@/lib/figures";
import { cn } from "@/lib/utils";

const DOT_FRACTION = 0.9;

const FRAME = {
    top: "[border-top:1px_solid_var(--signal)]",
    bottom: "[border-bottom:1px_solid_var(--signal)]",
    left: "[border-left:1px_solid_var(--signal)]",
    right: "[border-right:1px_solid_var(--signal)]",
};

interface Ch13GridProps {
    values: Matrix;
    words: readonly string[];
    label: string;
    emphasis: number;
    strong: readonly number[];
}

/**
 * Border classes of one cell of the grid, framing the emphasised row in the signal colour.
 *
 * @param row - Row of the cell
 * @param col - Column of the cell, -1 for the row label
 * @param last - Index of the last column
 * @param emphasis - Row that carries the frame
 * @returns Border classes to add to the cell, empty outside the framed row
 */
const edgeClasses = (row: number, col: number, last: number, emphasis: number) => {
    if (row !== emphasis) return "";

    return cn(FRAME.top, FRAME.bottom, col === -1 && FRAME.left, col === last && FRAME.right);
};

/**
 * Compact attention grid of one head as a CSS grid: the vertical column labels on desktop, then
 * per row one halftone dot per cell, the dot area carrying the weight, and a narrow label column
 * that holds the first callout beside the framed row. Cells stay square and fluid, 11 px or more
 * at 390 px, where the column labels give way to the legend under the grid.
 *
 * @param values - Attention weights of one head, one row per word that looks and one column per word looked at
 * @param words - Words as printed on the column labels, in sentence order
 * @param label - Accessible description of the whole grid, exposed as one image
 * @param emphasis - Row framed in the signal colour and marked with the first callout
 * @param strong - Columns of the framed row drawn in the signal colour, the heaviest words of that row
 * @returns The grid, exposed as one image with its description as accessible name
 */
export function Ch13Grid({ values, words, label, emphasis, strong }: Ch13GridProps) {
    return (
        <div
            role="img"
            aria-label={label}
            className="grid grid-cols-[22px_repeat(13,minmax(0,1fr))] max-[561px]:grid-cols-[18px_repeat(13,minmax(0,1fr))]"
        >
            <div aria-hidden="true" className="max-[561px]:hidden" />
            {words.map((word, col) => (
                <div
                    key={col}
                    aria-hidden="true"
                    className="flex h-[68px] min-w-0 items-end justify-center pb-1.5 max-[561px]:hidden"
                >
                    <span
                        lang={col === LAST_INDEX ? undefined : "fr"}
                        className="rotate-180 font-mono text-[11px] leading-none whitespace-nowrap text-muted-foreground [writing-mode:vertical-rl]"
                    >
                        {word}
                    </span>
                </div>
            ))}
            {values.map((cells, row) => (
                <Fragment key={row}>
                    <div
                        className={cn(
                            "flex min-w-0 items-center justify-start",
                            edgeClasses(row, -1, LAST_INDEX, emphasis),
                        )}
                    >
                        {row === emphasis ? <Callout n={1} size="flush" /> : null}
                    </div>
                    {cells.map((value, col) => (
                        <div
                            key={col}
                            className={cn(
                                "flex aspect-square min-w-0 items-center justify-center",
                                edgeClasses(row, col, LAST_INDEX, emphasis),
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className={cn(
                                    "block aspect-square w-[max(2px,var(--dot))] flex-none rounded-full",
                                    row === emphasis && strong.includes(col)
                                        ? "bg-signal"
                                        : "bg-foreground",
                                )}
                                style={
                                    {
                                        "--dot": `${matrixDotPercent(value, DOT_FRACTION)}%`,
                                    } as CSSProperties
                                }
                            />
                        </div>
                    ))}
                </Fragment>
            ))}
        </div>
    );
}
