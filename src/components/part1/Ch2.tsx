"use client";

import { ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { formatPercent } from "@/lib/format";

import { Caption } from "./Caption";
import { Chapter } from "./Chapter";
import { Dimension } from "./Dimension";
import { ASIDE, BODY } from "./layout";
import { Loupe } from "./Loupe";
import { Note } from "./Note";
import { Sup } from "./Sup";

const CROSSED_SEVEN_CONFIDENCE = 0.82;

/**
 * Small drawing of a crossed seven, an arrow and the digit the network reads in it, the visual
 * of the third margin note.
 */
function CrossedSeven() {
    const locale = useLocale();

    return (
        <div aria-hidden="true" className="mt-3.5 flex items-center gap-3 pl-5">
            <svg width={44} height={44} viewBox="0 0 44 44" className="block flex-none">
                <polyline
                    points="10,10 34,10 20,38"
                    fill="none"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="stroke-foreground"
                />
                <path
                    d="M20 24H34"
                    fill="none"
                    strokeWidth={4}
                    strokeLinecap="round"
                    className="stroke-foreground"
                />
            </svg>
            <ChevronRight size={14} strokeWidth={2} className="flex-none text-muted-foreground" />
            <span className="font-display text-[40px] leading-[0.8] font-semibold tracking-[-0.02em]">
                3
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
                {formatPercent(locale, CROSSED_SEVEN_CONFIDENCE)}
            </span>
        </div>
    );
}

/**
 * Chapter 2, "What the network sees": the live 28 x 28 input with its 20 x 20 frame and the
 * enlarged window, with two margin notes next to the paragraph.
 */
export function Ch2() {
    const t = useTranslations("part1.ch2");
    const locale = useLocale();

    return (
        <Chapter number={2}>
            <p className={BODY}>{t.rich("body", { sup: (chunks) => <Sup>{chunks}</Sup> })}</p>
            <div
                role="note"
                aria-label={t("noteLabel")}
                className={`${ASIDE} flex flex-col gap-[26px] min-[1081px]:row-[2/4]`}
            >
                <Note number={2}>{t("note2")}</Note>
                <div>
                    <Note number={3}>
                        {t("note3", { percent: formatPercent(locale, CROSSED_SEVEN_CONFIDENCE) })}
                    </Note>
                    <CrossedSeven />
                </div>
            </div>
            <figure className="m-0 mt-14 min-w-0 min-[1081px]:col-start-2 min-[1081px]:row-start-3">
                <Loupe />
                <Dimension label={t("dimension")} className="mt-[26px] ml-4 w-[308px] max-w-full" />
                <Caption number={2} className="mt-[22px]">
                    {t("caption")}
                </Caption>
            </figure>
        </Chapter>
    );
}
