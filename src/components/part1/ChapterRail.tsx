"use client";

import { useLocale, useTranslations } from "next-intl";
import { type CSSProperties } from "react";

import { type ChapterState, chapterState } from "@/data/chapters";
import { useChapter } from "@/hooks/useChapter";
import { formatPercent, pad2 } from "@/lib/format";
import { cn } from "@/lib/utils";

import { Eyebrow } from "./Eyebrow";

export interface ChapterRailProps {
    number: number;
}

export interface StateMarkProps {
    state: ChapterState;
    progress: number;
}

/**
 * Reading-state mark of a rail: a medium ink dot when read, a signal dot whose area is the
 * progress inside a signal ring when current, a small grey dot when upcoming.
 *
 * @param state - Reading state drawn by the mark
 * @param progress - Share of the chapter read, 0 to 1; the area of the current dot is proportional to it
 */
export function StateMark({ state, progress }: StateMarkProps) {
    const style =
        state === "current"
            ? ({ "--dot": `${(14 * Math.sqrt(progress)).toFixed(2)}px` } as CSSProperties)
            : undefined;

    return (
        <span
            className={cn(
                "box-border flex size-3.5 flex-none items-center justify-center rounded-full border border-transparent",
                state === "current" && "border-signal",
            )}
        >
            <span
                className={cn(
                    "block flex-none rounded-full",
                    state === "read" && "size-2 bg-foreground",
                    state === "current" && "size-(--dot) bg-signal",
                    state === "next" && "size-[4.6px] bg-dot-next",
                )}
                style={style}
            />
        </span>
    );
}

/**
 * Left rail of a Part I chapter: a rule over a "Chapitre" label with its reading mark, the large
 * chapter number and the reading state. The rule turns orange on the chapter being read. Under
 * 1081 px the rail becomes a single line above the chapter head.
 *
 * @param number - Chapter number, 1 to 4, followed by the scroll spy to find the reading state
 */
export function ChapterRail({ number }: ChapterRailProps) {
    const t = useTranslations("part1");
    const locale = useLocale();
    const { current, progress } = useChapter();
    const state = chapterState(number, current);

    return (
        <div
            aria-hidden="true"
            className={cn(
                "mb-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-0.5 border-t pt-3 min-[1081px]:col-start-1 min-[1081px]:row-start-1 min-[1081px]:mb-0 min-[1081px]:block min-[1081px]:pt-3.5",
                state === "current" ? "border-signal" : "border-foreground",
            )}
        >
            <Eyebrow wide className="flex items-center gap-[9px]">
                <StateMark state={state} progress={progress} />
                {t("chapter")}
            </Eyebrow>
            <p className="m-0 font-mono text-[30px] leading-[38px] font-medium tracking-[-0.04em] text-foreground min-[1081px]:mt-3.5 min-[1081px]:text-[44px] min-[1081px]:leading-[56px]">
                {pad2(number)}
            </p>
            <p
                className={cn(
                    "m-0 font-mono text-[11px] leading-4 min-[1081px]:mt-1",
                    state === "current" ? "font-medium text-signal-ink" : "text-muted-foreground",
                )}
            >
                {t(`rail.${state}`, { percent: formatPercent(locale, progress) })}
            </p>
        </div>
    );
}
