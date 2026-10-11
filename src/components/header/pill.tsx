"use client";

import { useTranslations } from "next-intl";
import { Fragment, type MouseEvent, useRef } from "react";

import {
    type ChapterItem,
    FISH_PEAK,
    GridIcon,
    StateDot,
    useChapterItems,
} from "@/components/header/dots";
import { useSommaire } from "@/components/header/sommaire";
import { LAST_PART_ONE } from "@/data/chapters";
import { useChapter } from "@/hooks/useChapter";
import { useFisheye } from "@/hooks/useFisheye";
import { usePillReveal } from "@/hooks/usePillReveal";
import { pad2 } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PillDotProps {
    item: ChapterItem;
}

interface CurrentChapterProps {
    title: string;
    number: number;
    compact?: boolean;
}

const SOMMAIRE_BUTTON_CLASS =
    "inline-flex flex-none cursor-pointer items-center justify-center border border-foreground bg-foreground text-background hover:opacity-[.86] aria-expanded:bg-card aria-expanded:text-foreground";

/**
 * Chapter dot of the pill: a link to the chapter whose dock magnification is driven by
 * useFisheye, with the chapter title in a tooltip above it on hover and on keyboard focus.
 *
 * @param item - Chapter entry from useChapterItems: gives the link target, the accessible name, the
 *   reading state and the tooltip title
 */
function PillDot({ item }: PillDotProps) {
    const { chapter, state } = item;

    return (
        <li className="flex">
            <a
                href={`#${chapter.id}`}
                aria-label={item.label}
                aria-current={state === "current" ? "location" : undefined}
                className="group relative flex h-9 w-[15px] flex-none items-center justify-center"
            >
                <StateDot
                    state={state}
                    scale="pill"
                    progress={item.progress}
                    data-fish=""
                    data-peak={FISH_PEAK[state]}
                    className="transition-transform duration-[140ms] ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none"
                />
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-[calc(100%+14px)] left-1/2 z-10 hidden -translate-x-1/2 rounded-[3px] border border-border-strong bg-card px-2.5 pt-1.5 pb-[7px] text-left whitespace-nowrap group-hover:block group-focus-visible:block"
                >
                    <span className="block font-mono text-[11px] leading-[14px] tracking-[0.04em] text-muted-foreground">
                        {chapter.part} / {pad2(chapter.number)}
                    </span>
                    <span className="mt-px block text-[13px] leading-[17px] font-semibold text-foreground">
                        {item.title}
                    </span>
                </span>
            </a>
        </li>
    );
}

/**
 * Number and title of the chapter being read, as shown next to the dots.
 *
 * @param title - Translated title of the chapter, or of the prologue
 * @param number - Chapter number, 0 before the first chapter, in which case no number is shown
 * @param compact - Dock variant: slightly smaller, and the title is cut with an ellipsis when it
 *   does not fit
 */
function CurrentChapter({ title, number, compact }: CurrentChapterProps) {
    return (
        <p
            className={cn(
                "m-0 flex items-baseline font-semibold",
                compact
                    ? "mt-[3px] min-w-0 gap-[7px] text-[13.5px] leading-[1.2]"
                    : "gap-2 text-sm leading-none text-nowrap",
            )}
        >
            {number > 0 && (
                <span className="flex-none font-mono text-[11.5px] text-signal-ink">
                    {pad2(number)}
                </span>
            )}
            <span className={cn(compact && "min-w-0 truncate")}>{title}</span>
        </p>
    );
}

/**
 * Floating navigation of the essay, hidden over the masthead and revealed once it scrolls away.
 * On desktop it is a 52 px pill at the bottom centre with the 15 chapter dots, the current
 * chapter and the filled Sommaire button; on a phone it becomes a full-width 60 px dock with a
 * compact dot row. Both sit in a zero-height sticky wrapper, so render this component as the last
 * child of the element that contains the whole page, inside SommaireProvider.
 */
export function Pill() {
    const t = useTranslations("header");
    const items = useChapterItems();
    const { current } = useChapter();
    const { open, setOpen } = useSommaire();
    const stickRef = useRef<HTMLDivElement>(null);
    const listRef = useFisheye<HTMLOListElement>();

    usePillReveal(stickRef);

    const title = current ? items[current - 1].title : t("extras.prologue");
    const toggle = (event: MouseEvent<HTMLButtonElement>) =>
        setOpen(open === "pill" ? null : "pill", event.currentTarget);

    return (
        <div
            ref={stickRef}
            data-shown="false"
            data-sheet={open ? "open" : "closed"}
            className="group/stick sticky bottom-6 z-50 h-0 [--lift:14px] [--reveal:0] max-[760px]:bottom-4"
        >
            <nav
                aria-label={t("nav")}
                className="absolute bottom-0 left-1/2 flex h-[52px] w-max max-w-[calc(100vw-24px)] -translate-x-1/2 translate-y-(--lift) items-center gap-3.5 rounded-[26px] border border-border-strong bg-card pr-1.5 pl-[18px] whitespace-nowrap opacity-(--reveal) outline-6 outline-background group-data-[shown=false]/stick:invisible max-[760px]:hidden"
            >
                <ol ref={listRef} className="m-0 flex list-none items-center p-0">
                    {items.slice(0, LAST_PART_ONE).map((item) => (
                        <PillDot key={item.chapter.id} item={item} />
                    ))}
                    <li aria-hidden="true" className="mx-2 h-2.5 w-px flex-none bg-border-strong" />
                    {items.slice(LAST_PART_ONE).map((item) => (
                        <PillDot key={item.chapter.id} item={item} />
                    ))}
                </ol>
                <span aria-hidden="true" className="h-5 w-px flex-none bg-border" />
                <CurrentChapter title={title} number={current} />
                <button
                    type="button"
                    aria-label={t("contents")}
                    aria-expanded={open === "pill"}
                    aria-controls={open === "pill" ? "som-pill" : undefined}
                    onClick={toggle}
                    className={cn(
                        SOMMAIRE_BUTTON_CLASS,
                        "h-10 gap-2 rounded-[20px] pr-4 pl-[13px] text-sm leading-none font-semibold",
                    )}
                >
                    <GridIcon />
                    <span>{t("contents")}</span>
                </button>
            </nav>

            <nav
                aria-label={t("nav")}
                className="absolute right-3 bottom-0 left-3 hidden h-[60px] translate-y-(--lift) items-center gap-2.5 rounded-[30px] border border-border-strong bg-card pr-2 pl-5 opacity-(--reveal) outline-6 outline-background group-data-[sheet=open]/stick:invisible group-data-[shown=false]/stick:invisible max-[760px]:flex"
            >
                <div className="min-w-0 flex-auto">
                    <div aria-hidden="true" className="flex h-3.5 items-center">
                        {items.map((item) => (
                            <Fragment key={item.chapter.id}>
                                {item.chapter.number === LAST_PART_ONE + 1 && (
                                    <span className="mx-[3px] h-2 w-px flex-none bg-border-strong" />
                                )}
                                <span className="flex h-3.5 min-w-0 flex-[1_1_0] items-center justify-center">
                                    <StateDot
                                        state={item.state}
                                        scale="dock"
                                        progress={item.progress}
                                    />
                                </span>
                            </Fragment>
                        ))}
                    </div>
                    <CurrentChapter title={title} number={current} compact />
                </div>
                <button
                    type="button"
                    aria-label={t("contents")}
                    aria-expanded={open === "pill"}
                    aria-controls={open === "pill" ? "som-pill" : undefined}
                    onClick={toggle}
                    className={cn(SOMMAIRE_BUTTON_CLASS, "size-11 rounded-full")}
                >
                    <GridIcon className="size-5" />
                </button>
            </nav>
        </div>
    );
}
