"use client";

import { useLocale } from "next-intl";
import { type ReactNode } from "react";

import { useChapter } from "@/hooks/useChapter";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

import { Rail, type RailState } from "./Rail";

export interface RailLayoutProps {
    id: string;
    titleId: string;
    label: string;
    value: string;
    chapter?: number;
    state?: RailState;
    divider?: boolean;
    className?: string;
    children: ReactNode;
}

/**
 * Grid of a chapter inside the shared 1280 px container: a 96 px rail, the main column and a
 * 232 px margin column, with the same 48 px gap. The section stacks into one column under
 * 1101 px. The rail follows the scroll spy, so it reads the reading state of the chapter.
 *
 * @param id - DOM id of the section, the anchor targeted by the Sommaire and the pill
 * @param titleId - DOM id of the heading that names the section, used by aria-labelledby
 * @param label - Top line of the rail, such as "Partie II"
 * @param value - Large value of the rail, such as the chapter number "05"
 * @param chapter - Chapter number the rail follows with the scroll spy; omit it together with state to freeze it
 * @param state - Fixed rail state, used instead of the scroll spy (the opener rail is always "read")
 * @param divider - Draws the hairline above the section, true by default
 * @param className - Extra classes merged over the base padding of the section
 * @param children - Blocks of the chapter, each placed with the column classes of the kit
 */
export function RailLayout({
    id,
    titleId,
    label,
    value,
    chapter,
    state,
    divider = true,
    className,
    children,
}: RailLayoutProps) {
    const locale = useLocale();
    const { current, progress } = useChapter();

    let railState: RailState = state ?? "next";

    if (!state && chapter !== undefined) {
        if (chapter < current) railState = "read";
        else if (chapter === current) railState = "current";
    }

    return (
        <section
            id={id}
            aria-labelledby={titleId}
            className={cn(
                "relative mx-auto w-full max-w-[1280px] px-(--gutter) pt-22 pb-16 max-[761px]:pt-16",
                className,
            )}
        >
            {divider ? (
                <span
                    aria-hidden="true"
                    className="absolute inset-x-(--gutter) top-0 h-px bg-border"
                />
            ) : null}
            <div className="grid grid-cols-1 items-start min-[1101px]:grid-cols-[96px_minmax(0,1fr)_232px] min-[1101px]:gap-x-12">
                <Rail
                    label={label}
                    value={value}
                    state={railState}
                    progress={progress}
                    percent={formatPercent(locale, progress)}
                />
                {children}
            </div>
        </section>
    );
}
