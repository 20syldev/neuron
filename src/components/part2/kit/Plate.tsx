import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

const CROP_MARKS = [
    "top-0 -left-4 h-px w-2.5",
    "-top-4 left-0 h-2.5 w-px",
    "top-0 -right-4 h-px w-2.5",
    "-top-4 right-0 h-2.5 w-px",
    "bottom-0 -left-4 h-px w-2.5",
    "-bottom-4 left-0 h-2.5 w-px",
    "bottom-0 -right-4 h-px w-2.5",
    "-bottom-4 right-0 h-2.5 w-px",
];

export interface PlateProps {
    tone?: "light" | "dark";
    number?: string;
    aside?: ReactNode;
    padClassName?: string;
    children: ReactNode;
}

/**
 * Framed plate of a figure: a thin hairline frame with eight crop marks at the corners. The
 * light plate shows the "Planche NN" header row; the dark plate redefines the colour tokens in
 * the opposite tone inside the plate only, so the figure inside reads from the same tokens.
 *
 * @param tone - "light" (default) is a card-toned plate with a header row; "dark" is an inset panel in the opposite tone of the page, framed by a thin paper mat, whose caption is printed under it
 * @param number - Plate number printed in the header row of a light plate, such as "07"
 * @param aside - Right end of the header row: the variant line, the compact switch, or a short text; a dark plate only has a header row when it receives one
 * @param padClassName - Extra classes for the padded content area, for plates whose bottom padding differs
 * @param children - Plate content: the figure itself
 */
export function Plate({ tone = "light", number, aside, padClassName, children }: PlateProps) {
    const t = useTranslations("part2.kit");
    const dark = tone === "dark";
    const hasHeader = dark ? Boolean(aside) : Boolean(number || aside);

    const content = (
        <div
            className={cn(
                dark
                    ? "px-7 pt-[22px] pb-7 max-[561px]:px-1 max-[561px]:pt-3 max-[561px]:pb-4"
                    : "px-7 pt-[22px] pb-7 max-[561px]:px-3 max-[561px]:pt-4 max-[561px]:pb-5",
                padClassName,
            )}
        >
            {hasHeader ? (
                <div
                    className={cn(
                        "mb-4 flex min-h-[30px] items-center gap-3.5 max-[561px]:[&>span]:whitespace-nowrap max-[401px]:flex-wrap max-[401px]:gap-x-3 max-[401px]:gap-y-0.5",
                        dark && "justify-end",
                    )}
                >
                    {!dark ? (
                        <>
                            <span className="m-0 font-mono text-[10.5px] font-medium tracking-[0.14em] text-foreground uppercase">
                                {t("plate")} {number}
                            </span>
                            <span aria-hidden="true" className="h-px flex-[1_1_20px] bg-border" />
                        </>
                    ) : null}
                    {aside}
                </div>
            ) : null}
            {children}
        </div>
    );

    return (
        <div className="relative">
            {CROP_MARKS.map((mark) => (
                <span
                    key={mark}
                    aria-hidden="true"
                    className={cn("absolute bg-muted-foreground", mark)}
                />
            ))}
            {dark ? (
                <div className="border border-border-strong bg-card p-2.5 max-[561px]:p-1">
                    <div className={"tone-inverse bg-background text-foreground"}>{content}</div>
                </div>
            ) : (
                <div className="tone-card border border-border-strong bg-background text-foreground">
                    {content}
                </div>
            )}
        </div>
    );
}
