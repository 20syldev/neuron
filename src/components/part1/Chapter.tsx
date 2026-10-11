import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { ChapterRail } from "./ChapterRail";
import { Eyebrow } from "./Eyebrow";
import { CHAPTER_SECTION, DISPLAY } from "./layout";

export interface ChapterProps {
    number: number;
    children: ReactNode;
}

/**
 * Section of a Part I chapter on the three column grid of the essay: the rail, the head with the
 * part label and the title, then the body that follows.
 *
 * @param number - Chapter number, 1 to 4; gives the section id "ch-<number>", its rail and its title
 * @param children - Paragraph, margin notes and figure of the chapter, each placed in the grid by its own classes
 */
export function Chapter({ number, children }: ChapterProps) {
    const t = useTranslations("part1");
    const titles = useTranslations("header.chapters");
    const title = titles(String(number));

    return (
        <section id={`ch-${number}`} aria-labelledby={`ch-${number}-t`} className={CHAPTER_SECTION}>
            <ChapterRail number={number} />
            <div className="min-w-0 pt-1 min-[1081px]:col-[2/4] min-[1081px]:row-start-1 min-[1081px]:border-t min-[1081px]:border-border min-[1081px]:pt-3.5">
                <Eyebrow wide>{t("partLabel")}</Eyebrow>
                <h3
                    id={`ch-${number}-t`}
                    className={`${DISPLAY} m-0 mt-3.5 text-[clamp(36px,4.4vw,56px)] leading-none font-semibold tracking-[-0.012em] text-balance`}
                >
                    <span className="sr-only">{t("chapterTitle", { number })}</span>
                    {title}
                </h3>
            </div>
            {children}
        </section>
    );
}
