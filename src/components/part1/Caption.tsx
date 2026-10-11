import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { FIGURE_CAPTION } from "./layout";

export interface CaptionProps {
    number: number;
    className?: string;
    reserve?: ReactNode;
    children: ReactNode;
}

/**
 * Figure caption of Part I, placed in the main column under its figure. A caption that changes
 * with the live drawing can carry a reserve, so the page below it never jumps.
 *
 * @param number - Figure number printed in the mono lead of the caption
 * @param className - Extra classes merged over the base style, which sets the top margin
 * @param reserve - Longest text the caption takes in its other states, laid out invisibly on top of the real text so the caption keeps the same height whichever one is shown
 * @param children - Caption text shown after the lead
 */
export function Caption({ number, className, reserve, children }: CaptionProps) {
    const t = useTranslations("part1");
    const lead = (
        <span className="mr-2 font-mono text-[11px] font-semibold tracking-[0.1em] text-foreground uppercase">
            {t("figure", { number })}
        </span>
    );

    return (
        <figcaption
            className={cn(
                FIGURE_CAPTION,
                "grid text-[13.5px] leading-[1.55] text-muted-foreground",
                className,
            )}
        >
            <span className="col-start-1 row-start-1">
                {lead}
                {children}
            </span>
            {reserve ? (
                <span aria-hidden="true" className="invisible col-start-1 row-start-1">
                    {lead}
                    {reserve}
                </span>
            ) : null}
        </figcaption>
    );
}
