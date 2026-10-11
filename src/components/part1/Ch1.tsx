"use client";

import { useLocale, useTranslations } from "next-intl";

import { formatNumber } from "@/lib/format";

import { Caption } from "./Caption";
import { Chapter } from "./Chapter";
import { useConfidenceText } from "./confidence";
import { useDigit } from "./DigitProvider";
import { ASIDE, BODY, FIGURE, FIGURE_BODY } from "./layout";
import { TOTAL_PARAMS } from "./network";
import { Note } from "./Note";
import { Pad } from "./Pad";
import { Prediction } from "./Prediction";
import { Sup } from "./Sup";

const SURE = 0.9;

/**
 * Margin note of chapter 1, which ends with a sentence about the current prediction once there
 * is one.
 */
function LiveNote() {
    const t = useTranslations("part1.ch1");
    const { digit, confidence } = useDigit();
    const percent = useConfidenceText(confidence, true);
    const reserve = `${t("note")} ${t("noteAlmost", { digit: 7 })}`;

    return (
        <Note number={1} reserve={reserve}>
            {t("note")}{" "}
            {digit === null
                ? null
                : t(confidence > SURE ? "noteAlmost" : "noteLead", { digit, percent })}
        </Note>
    );
}

/**
 * Caption of figure 1, which quotes the current prediction once there is one.
 */
function LiveCaption() {
    const t = useTranslations("part1.ch1");
    const { digit, confidence } = useDigit();
    const percent = useConfidenceText(confidence, true);
    const sure = useConfidenceText(1, true);

    return (
        <Caption
            number={1}
            className="mt-[26px]"
            reserve={t("captionLive", { digit: 7, percent: sure })}
        >
            {digit === null ? t("caption") : t("captionLive", { digit, percent })}
        </Caption>
    );
}

/**
 * Chapter 1, "Draw a digit": the live drawing pad next to the prediction. Only the small live
 * pieces read the drawing, so the text of the chapter is not rendered again on every stroke.
 */
export function Ch1() {
    const t = useTranslations("part1.ch1");
    const locale = useLocale();

    return (
        <Chapter number={1}>
            <p className={BODY}>
                {t.rich("body", {
                    count: formatNumber(locale, TOTAL_PARAMS),
                    sup: (chunks) => <Sup>{chunks}</Sup>,
                })}
            </p>
            <div role="note" aria-label={t("noteLabel")} className={ASIDE}>
                <LiveNote />
            </div>
            <figure className={FIGURE}>
                <div className={`${FIGURE_BODY} flex flex-wrap items-start gap-x-14 gap-y-12`}>
                    <Pad />
                    <Prediction />
                </div>
                <LiveCaption />
            </figure>
        </Chapter>
    );
}
