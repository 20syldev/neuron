"use client";

import { useLocale, useTranslations } from "next-intl";
import { type CSSProperties, type HTMLAttributes, useMemo } from "react";

import { type Chapter, CHAPTERS, type ChapterState, chapterState } from "@/data/chapters";
import { useChapter } from "@/hooks/useChapter";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export type DotScale = "pill" | "dock" | "sheet" | "phone";

interface DotSizes {
    ring: number;
    ringClass: string;
    readClass: string;
    nextClass: string;
}

export interface ChapterItem {
    chapter: Chapter;
    title: string;
    state: ChapterState;
    label: string;
    progress: number;
    percent: string;
}

export interface GridIconProps {
    className?: string;
}

export interface StateDotProps extends HTMLAttributes<HTMLSpanElement> {
    state: ChapterState;
    scale: DotScale;
    progress?: number;
    inline?: boolean;
}

// Dot sizes per surface: "ring" is the ring box diameter in px, the classes are its Tailwind twins.
const SIZES: Record<DotScale, DotSizes> = {
    pill: { ring: 12, ringClass: "size-3", readClass: "size-1.5", nextClass: "size-1" },
    dock: { ring: 9, ringClass: "size-[9px]", readClass: "size-[5px]", nextClass: "size-[3px]" },
    sheet: { ring: 14, ringClass: "size-3.5", readClass: "size-2", nextClass: "size-1" },
    phone: { ring: 12, ringClass: "size-3", readClass: "size-[7px]", nextClass: "size-[3px]" },
};

export const FISH_PEAK: Record<ChapterState, number> = {
    read: 15 / 6,
    current: 17 / 12,
    next: 13 / 4,
};

const GRID_ICON = Array.from({ length: 15 }, (_, index) => {
    const cx = 3 + (index % 5) * 4.5;
    const cy = 7.5 + Math.floor(index / 5) * 4.5;

    return `M${cx - 1.55} ${cy}a1.55 1.55 0 1 0 3.1 0a1.55 1.55 0 1 0 -3.1 0Z`;
}).join("");

/**
 * Reading-state dot of a chapter: a filled ink dot when read, a signal dot whose area is the
 * progress inside a full-size signal ring when current, a faint grid dot when upcoming. Extra
 * attributes land on the ring box, which is the element the dock magnification scales.
 *
 * @param state - Reading state of the chapter: "read", "current" or "next"
 * @param scale - Size set of the surface the dot sits on, one of the DotScale keys
 * @param progress - Reading progress from 0 to 1, the area of the current dot is proportional to it
 * @param inline - Draws the upcoming dot darker and a little larger, as the in-page rails do, for a
 *   list on the page background instead of in a sheet
 * @param className - Extra classes merged onto the ring box
 * @param rest - Other span attributes, spread on the ring box that the dock magnification scales
 */
export function StateDot({
    state,
    scale,
    progress = 0,
    inline = false,
    className,
    ...rest
}: StateDotProps) {
    const sizes = SIZES[scale];
    const fill: CSSProperties | undefined =
        state === "current"
            ? ({ "--dot": `${(sizes.ring * Math.sqrt(progress)).toFixed(2)}px` } as CSSProperties)
            : undefined;

    return (
        <span
            aria-hidden="true"
            className={cn(
                "relative box-border flex flex-none items-center justify-center rounded-full",
                sizes.ringClass,
                state === "current" && "border border-signal",
                className,
            )}
            {...rest}
        >
            <span
                className={cn(
                    "block flex-none rounded-full",
                    state === "current" && "size-(--dot) bg-signal",
                    state === "read" && cn("bg-foreground", sizes.readClass),
                    state === "next" &&
                        (inline ? "size-[4.6px] bg-dot-next" : cn("bg-grid", sizes.nextClass)),
                )}
                style={fill}
            />
        </span>
    );
}

/**
 * The 3 by 5 chapter matrix drawn as a glyph, shown on the Sommaire buttons.
 *
 * @param className - Extra classes merged onto the svg, such as a colour or a size override
 */
export function GridIcon({ className }: GridIconProps) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={cn("flex-none", className)}
        >
            <path d={GRID_ICON} fill="currentColor" />
        </svg>
    );
}

/**
 * Builds the list of the 15 chapters with their translated title, reading state and accessible
 * name from the shared scroll spy. The pill, the dock and the Sommaire sheet all render from it.
 * "title" is the translated chapter title, "label" the accessible name of the chapter link with
 * its reading state, "progress" the reading progress inside the chapter from 0 to 1 (0 unless
 * current) and "percent" that progress as a localised percentage such as "50 %" (empty unless
 * current).
 *
 * @returns One item per chapter, in reading order
 */
export function useChapterItems() {
    const t = useTranslations("header");
    const locale = useLocale();
    const { current, progress } = useChapter();

    return useMemo<ChapterItem[]>(() => {
        const percent = formatPercent(locale, progress, 0);

        return CHAPTERS.map((chapter) => {
            const state = chapterState(chapter.number, current);
            const title = t(`chapters.${chapter.number}`);
            const values = { number: String(chapter.number), title, percent };

            return {
                chapter,
                title,
                state,
                label: t(`aria.${state === "current" ? "current" : state}`, values),
                progress: state === "current" ? progress : 0,
                percent: state === "current" ? percent : "",
            };
        });
    }, [t, locale, current, progress]);
}
