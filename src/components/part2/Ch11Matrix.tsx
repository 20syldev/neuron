import { useTranslations } from "next-intl";
import { type CSSProperties, Fragment } from "react";

import { Callout } from "@/components/part2/kit";
import { LAST_INDEX, type Matrix, topTwo } from "@/lib/attention";
import { matrixDotPercent } from "@/lib/figures";
import { cn } from "@/lib/utils";

const DOT_FRACTION = 0.9;

const HATCH = "M0 10L10 0M0 5L5 0M5 10L10 5";

const SOLID = {
    top: "[border-top:1px_solid_var(--signal)]",
    bottom: "[border-bottom:1px_solid_var(--signal)]",
    left: "[border-left:1px_solid_var(--signal)]",
    right: "[border-right:1px_solid_var(--signal)]",
};

const DASHED = {
    top: "[border-top:1px_dashed_var(--muted-foreground)]",
    bottom: "[border-bottom:1px_dashed_var(--muted-foreground)]",
    left: "[border-left:1px_dashed_var(--muted-foreground)]",
    right: "[border-right:1px_dashed_var(--muted-foreground)]",
};

const SIDE_MARK = "absolute top-1/2 left-[calc(100%+10px)] z-2 -mt-2.5 max-[561px]:hidden";

const BELOW_MARK = "absolute top-[calc(100%+10px)] left-1/2 z-2 -ml-2.5";

export interface MatrixMark {
    row: number;
    col: number;
    n: number;
    below?: boolean;
}

export interface MatrixTag {
    row: number;
    col: number;
    text: string;
}

export interface MatrixProps {
    values: Matrix;
    words: readonly string[];
    label: string;
    emphasis: number;
    outlineRow?: number;
    outlineColumn?: number;
    masked?: boolean;
    marks?: readonly MatrixMark[];
    tag?: MatrixTag;
}

interface Frame {
    emphasis: number;
    outlineRow?: number;
    outlineColumn?: number;
}

/**
 * Border classes of one cell of the grid, framing the emphasised row in the signal colour and the
 * outlined row and column with dashes. The row and column indices start at -1 for the label cells.
 *
 * @param row - Row of the cell, -1 for the column labels
 * @param col - Column of the cell, -1 for the row labels
 * @param last - Index of the last row and column
 * @param frame - Which row and column are framed
 * @returns Border classes to add to the cell, empty for a cell outside every frame
 */
function edgeClasses(row: number, col: number, last: number, frame: Frame) {
    const classes: string[] = [];

    if (row === frame.emphasis) {
        classes.push(SOLID.top, SOLID.bottom);
        if (col === -1) classes.push(SOLID.left);
        if (col === last) classes.push(SOLID.right);
    }

    if (row === frame.outlineRow) {
        classes.push(DASHED.top, DASHED.bottom);
        if (col === -1) classes.push(DASHED.left);
        if (col === last) classes.push(DASHED.right);
    }

    if (col === frame.outlineColumn) {
        classes.push(DASHED.left, DASHED.right);
        if (row === -1) classes.push(DASHED.top);
        if (row === last) classes.push(DASHED.bottom);
    }

    return classes.join(" ");
}

/**
 * Readable attention grid as a CSS grid: a corner with the two reading directions, the vertical
 * column labels, then per row a label and one halftone dot per cell, the dot area carrying the
 * weight. Cells stay square and fluid, 20 px or more on a 390 px phone. The labels grow no smaller
 * than 11 px. It serves the full grid of chapter 11 and the causal grid of chapter 14.
 *
 * @param values - Attention weights, one row per word that looks and one column per word looked at
 * @param words - Words as printed on the labels, in sentence order
 * @param label - Accessible description of the whole grid, exposed as one image
 * @param emphasis - Row framed in the signal colour, with its two heaviest cells drawn in the signal colour
 * @param outlineRow - Row framed with a dashed outline, none when omitted
 * @param outlineColumn - Column framed with a dashed outline and labelled in bold, none when omitted
 * @param masked - Hatches every cell above the diagonal and draws nothing in it, the future words, false by default
 * @param marks - Numbered callouts placed on cells, each with the row and column of its cell and its number 1 or 2; a badge with below set sits under the cell instead of at the right end of its row, which moves it into the row label on a phone where there is no room beside the grid
 * @param tag - Short text centred on a cell and printed over the cells, such as the label of the masked half, none when omitted
 */
export function Ch11Matrix({
    values,
    words,
    label,
    emphasis,
    outlineRow,
    outlineColumn,
    masked = false,
    marks = [],
    tag,
}: MatrixProps) {
    const t = useTranslations("part2.ch11.matrix");
    const last = values.length - 1;
    const frame: Frame = { emphasis, outlineRow, outlineColumn };
    const strong = topTwo(values[emphasis], emphasis);
    const sideMarks = marks.filter((mark) => !mark.below);

    return (
        <div
            role="img"
            aria-label={label}
            className="grid max-w-[680px] grid-cols-[92px_repeat(13,minmax(0,1fr))] max-[561px]:grid-cols-[76px_repeat(13,minmax(0,1fr))] max-[381px]:grid-cols-[68px_repeat(13,minmax(0,1fr))]"
        >
            <div className="relative h-[92px]">
                <span
                    aria-hidden="true"
                    className="absolute top-0 left-0 h-px w-[130.11px] origin-top-left rotate-45 bg-border max-[561px]:hidden"
                />
                <span className="absolute bottom-2 left-0 font-mono text-[11px] leading-none whitespace-nowrap text-muted-foreground">
                    {t("whoLooks")}
                </span>
                <span className="absolute top-0.5 right-1.5 font-mono text-[11px] leading-none whitespace-nowrap text-muted-foreground">
                    {t("lookedAt")}
                </span>
            </div>
            {words.map((word, col) => (
                <div
                    key={col}
                    className={cn(
                        "flex h-[92px] min-w-0 items-end justify-center pb-2",
                        edgeClasses(-1, col, last, frame),
                    )}
                >
                    <span
                        lang={col === LAST_INDEX ? undefined : "fr"}
                        className={cn(
                            "rotate-180 font-mono text-xs leading-none whitespace-nowrap [writing-mode:vertical-rl] max-[561px]:text-[11px]",
                            col === outlineColumn
                                ? "font-semibold text-foreground"
                                : "text-muted-foreground",
                        )}
                    >
                        {word}
                    </span>
                </div>
            ))}
            {values.map((cells, row) => (
                <Fragment key={row}>
                    <div
                        className={cn(
                            "flex min-w-0 items-center justify-end gap-[7px] pr-3 whitespace-nowrap max-[561px]:gap-1 max-[561px]:pr-1",
                            edgeClasses(row, -1, last, frame),
                        )}
                    >
                        {sideMarks
                            .filter((mark) => mark.row === row)
                            .map((mark) => (
                                <Callout
                                    key={mark.n}
                                    n={mark.n}
                                    size="flush"
                                    className="hidden max-[561px]:inline-flex"
                                />
                            ))}
                        {row === emphasis ? (
                            <span
                                aria-hidden="true"
                                className="inline-block size-2 flex-none rounded-full bg-query"
                            />
                        ) : null}
                        <span
                            lang={row === LAST_INDEX ? undefined : "fr"}
                            className={cn(
                                "font-mono text-[13px] leading-none max-[561px]:text-[11px]",
                                row === emphasis && "font-semibold text-signal-ink",
                                row === outlineRow && "font-semibold text-foreground",
                                row !== emphasis && row !== outlineRow && "text-muted-foreground",
                            )}
                        >
                            {words[row]}
                        </span>
                    </div>
                    {cells.map((value, col) => {
                        const future = masked && col > row;
                        const mark = marks.find((m) => m.row === row && m.col === col);

                        return (
                            <div
                                key={col}
                                className={cn(
                                    "relative flex aspect-square min-w-0 items-center justify-center",
                                    edgeClasses(row, col, last, frame),
                                )}
                            >
                                {future ? (
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 10 10"
                                        preserveAspectRatio="none"
                                        className="absolute top-0 left-0 block size-full fill-none stroke-border-strong"
                                    >
                                        <path
                                            d={HATCH}
                                            strokeWidth={1}
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    </svg>
                                ) : value <= 0 ? (
                                    <span
                                        aria-hidden="true"
                                        className="block size-0.5 flex-none rounded-full bg-grid"
                                    />
                                ) : (
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
                                )}
                                {mark ? (
                                    <Callout
                                        n={mark.n}
                                        size="lg"
                                        className={mark.below ? BELOW_MARK : SIDE_MARK}
                                    />
                                ) : null}
                                {tag && tag.row === row && tag.col === col ? (
                                    <span className="absolute top-1/2 left-1/2 z-2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 py-[5px] font-mono text-[11px] leading-none font-medium tracking-[0.12em] whitespace-nowrap text-muted-foreground uppercase">
                                        {tag.text}
                                    </span>
                                ) : null}
                            </div>
                        );
                    })}
                </Fragment>
            ))}
        </div>
    );
}
