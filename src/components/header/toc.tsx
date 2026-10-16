"use client";

import { useTranslations } from "next-intl";

import { type ChapterItem, StateDot, useChapterItems } from "@/components/header/dots";
import { DESKTOP_GRID, DISPLAY } from "@/components/part1/layout";
import { CHAPTER_COUNT, type ChapterState, LAST_PART_ONE, SECTION_IDS } from "@/data/chapters";
import { useChapter } from "@/hooks/useChapter";
import { pad2 } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TocPartProps {
    part: 1 | 2;
    numeral: string;
    title: string;
    items: ChapterItem[];
    target: string;
    extra: { id: string; title: string };
}

interface TocRowProps {
    item: ChapterItem;
}

const LEGEND_PROGRESS = 0.4;

const LEGEND: readonly ChapterState[] = ["read", "current", "next"];

const ROW_CLASS =
    "group grid min-h-11 grid-cols-[14px_26px_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-border py-[9px] text-[15px] leading-[1.35]";

/**
 * One chapter row of the inline table of contents: state dot, number, title and a read or
 * progress tag, the title underlined on hover.
 *
 * @param item - Chapter entry from useChapterItems: gives the link target, title, reading state and
 *   progress
 */
function TocRow({ item }: TocRowProps) {
    const t = useTranslations("header.toc");
    const { chapter, state } = item;
    const current = state === "current";

    return (
        <li>
            <a
                href={`#${chapter.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                    ROW_CLASS,
                    state === "read" && "text-muted-foreground",
                    current && "font-semibold",
                )}
            >
                <StateDot state={state} scale="sheet" progress={item.progress} inline />
                <span
                    aria-hidden="true"
                    className={cn(
                        "font-mono text-xs font-medium",
                        current ? "text-signal-ink" : "text-muted-foreground",
                    )}
                >
                    {pad2(chapter.number)}
                </span>
                <span className="min-w-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                    {item.title}
                </span>
                <span
                    className={cn(
                        "font-mono text-[11px] font-medium tracking-[0.04em] whitespace-nowrap",
                        current ? "text-signal-ink" : "text-muted-foreground",
                    )}
                >
                    {state === "next" ? "" : t(state)}
                </span>
            </a>
        </li>
    );
}

/**
 * One part of the table of contents: the numeral and title that link to the part opener, its
 * subtitle and chapter range, the chapter rows and the closing row (interlude or epilogue).
 *
 * @param part - Part number, selects the translated subtitle
 * @param numeral - Roman numeral of the part, shown large and read aloud as the link prefix
 * @param title - Translated title of the part
 * @param items - Chapters of the part, in reading order, at least one: the first and last numbers
 *   give the displayed range
 * @param target - Id of the part opener that the title links to
 * @param extra - Closing row of the part: the interlude after Part I, the epilogue after Part II
 */
function TocPart({ part, numeral, title, items, target, extra }: TocPartProps) {
    const t = useTranslations("header.toc");
    const first = items[0].chapter.number;
    const last = items[items.length - 1].chapter.number;

    return (
        <div className="min-w-0">
            <div className="flex items-end gap-4 border-b border-foreground pb-4 min-[761px]:max-[1080px]:min-h-[92px]">
                <span
                    aria-hidden="true"
                    className={`${DISPLAY} text-[72px] leading-[0.78] font-semibold tracking-[-0.018em]`}
                >
                    {numeral}
                </span>
                <div className="min-w-0 flex-auto">
                    <h3
                        className={`${DISPLAY} m-0 text-[26px] leading-none font-semibold tracking-[-0.02em]`}
                    >
                        <a
                            href={`#${target}`}
                            className="group inline-flex items-center max-[760px]:min-h-10"
                        >
                            <span className="sr-only">{t("partPrefix", { part: numeral })}</span>
                            <span className="group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                                {title}
                            </span>
                        </a>
                    </h3>
                    <p className="m-0 mt-1.5 text-[13.5px] leading-[1.35] text-muted-foreground">
                        {t(`subtitle.${part}`)}
                    </p>
                </div>
                <span className="flex-none font-mono text-[11px] text-muted-foreground">
                    {t("range", { from: first, to: last })}
                </span>
            </div>
            <ol className="m-0 list-none p-0">
                {items.map((item) => (
                    <TocRow key={item.chapter.id} item={item} />
                ))}
                <li>
                    <a href={`#${extra.id}`} className={cn(ROW_CLASS, "text-muted-foreground")}>
                        <span
                            aria-hidden="true"
                            className="flex size-3.5 items-center justify-center"
                        >
                            <span className="block h-px w-2.5 bg-border-strong" />
                        </span>
                        <span />
                        <span className="min-w-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                            {extra.title}
                        </span>
                        <span />
                    </a>
                </li>
            </ol>
        </div>
    );
}

/**
 * Inline table of contents between the prologue and Part I: a rail with the count of chapters
 * read and the legend of the three reading states, then the two parts side by side (stacked on
 * a phone) with their chapters. It reads the same scroll spy as the pill and the sheet.
 */
export function Toc() {
    const t = useTranslations("header");
    const items = useChapterItems();
    const { current } = useChapter();
    const parts = useTranslations("header.parts");

    return (
        <section
            id="contents"
            aria-labelledby="toc-t"
            className={cn(
                "mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-y-7 px-(--gutter) pt-32 -scroll-mt-32 max-[760px]:pt-22 max-[760px]:-scroll-mt-22",
                DESKTOP_GRID,
            )}
        >
            <div className="border-t border-foreground pt-3.5 min-[1081px]:col-start-1 min-[1081px]:row-start-1">
                <h2
                    id="toc-t"
                    className="m-0 font-mono text-[11px] leading-4 font-semibold tracking-[0.14em] uppercase"
                >
                    {t("contents")}
                </h2>
                <p className="m-0 mt-1.5 font-mono text-[11px] leading-4 text-muted-foreground">
                    {t("toc.count", { total: CHAPTER_COUNT, read: Math.max(0, current - 1) })}
                </p>
                <ul
                    aria-label={t("toc.legend")}
                    className="m-0 mt-[30px] flex list-none flex-col gap-2.5 p-0 text-[13px] text-muted-foreground"
                >
                    {LEGEND.map((state) => (
                        <li key={state} className="flex items-center gap-2.5">
                            <StateDot
                                state={state}
                                scale="sheet"
                                progress={LEGEND_PROGRESS}
                                inline
                            />
                            {t(`toc.${state}`)}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-12 pt-1 min-[761px]:grid-cols-2 min-[1081px]:col-[2/4] min-[1081px]:row-start-1 min-[1081px]:border-t min-[1081px]:border-border min-[1081px]:pt-3.5">
                <TocPart
                    part={1}
                    numeral="I"
                    title={parts("1")}
                    items={items.slice(0, LAST_PART_ONE)}
                    target="part-1"
                    extra={{ id: SECTION_IDS.interlude, title: t("toc.interlude") }}
                />
                <TocPart
                    part={2}
                    numeral="II"
                    title={parts("2")}
                    items={items.slice(LAST_PART_ONE)}
                    target={SECTION_IDS.partTwo}
                    extra={{ id: SECTION_IDS.epilogue, title: t("toc.epilogue") }}
                />
            </div>
        </section>
    );
}
