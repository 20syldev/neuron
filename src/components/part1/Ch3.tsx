"use client";

import { useLocale, useTranslations } from "next-intl";

import { formatNumber } from "@/lib/format";

import { Caption } from "./Caption";
import { Chapter } from "./Chapter";
import { CropMarks } from "./CropMarks";
import { useDigit, useNeuron } from "./DigitProvider";
import { activeCount } from "./halftone";
import { ASIDE, BODY, FIGURE } from "./layout";
import { LAYER_PARAMS, TOTAL_PARAMS } from "./network";
import { Note } from "./Note";
import { Strip } from "./Strip";
import { Sup } from "./Sup";

const BREAKDOWN = [
    { key: "first", count: LAYER_PARAMS.first },
    { key: "second", count: LAYER_PARAMS.second },
    { key: "output", count: LAYER_PARAMS.output },
] as const;

/**
 * Paragraph of chapter 3, which counts the neurons that light up in each hidden layer.
 */
function LiveBody() {
    const t = useTranslations("part1.ch3");
    const { inference } = useDigit();

    return (
        <p className={BODY}>
            {t.rich("body", {
                first: inference ? activeCount(inference.hidden1) : 0,
                second: inference ? activeCount(inference.hidden2) : 0,
                sup: (chunks) => <Sup>{chunks}</Sup>,
            })}
        </p>
    );
}

/**
 * Caption of figure 3, which names the neuron ringed in orange and whether it is the most active.
 */
function LiveCaption() {
    const t = useTranslations("part1.ch3");
    const { neuron, best } = useNeuron();

    return (
        <Caption number={3} className="mt-[30px]">
            {t(neuron === best ? "caption" : "captionPicked", { neuron })}
        </Caption>
    );
}

/**
 * Chapter 3, "Layer after layer": the network strip with its live activations, the count of
 * active neurons in the paragraph and the breakdown of the parameters in the margin.
 */
export function Ch3() {
    const t = useTranslations("part1.ch3");
    const locale = useLocale();
    const total = formatNumber(locale, TOTAL_PARAMS);

    return (
        <Chapter number={3}>
            <LiveBody />
            <div role="note" aria-label={t("noteLabel")} className={ASIDE}>
                <Note number={4}>{t("note", { total })}</Note>
                <dl className="m-0 mt-2.5 text-[12.5px] leading-[1.4]">
                    {BREAKDOWN.map((row) => (
                        <div
                            key={row.key}
                            className="flex items-baseline justify-between gap-3 border-b border-border py-[5px]"
                        >
                            <dt className="text-muted-foreground">{t(`breakdown.${row.key}`)}</dt>
                            <dd className="m-0 font-mono text-xs leading-[1.4]">
                                {formatNumber(locale, row.count)}
                            </dd>
                        </div>
                    ))}
                    <div className="flex items-baseline justify-between gap-3 py-[5px]">
                        <dt className="font-semibold">{t("breakdown.total")}</dt>
                        <dd className="m-0 font-mono text-xs leading-[1.4] font-semibold">
                            {total}
                        </dd>
                    </div>
                </dl>
            </div>
            <figure className={FIGURE}>
                <div className="relative min-w-0 px-8 pt-[26px] pb-[30px] max-[1080px]:px-0 min-[1081px]:col-[1/4]">
                    <CropMarks />
                    <div className="mb-[22px] flex flex-wrap justify-between gap-x-4 gap-y-1.5 font-mono text-[11px] leading-4 text-muted-foreground">
                        <span>{t("architecture")}</span>
                        <span>{t("totalParams", { total })}</span>
                    </div>
                    <Strip />
                </div>
                <LiveCaption />
            </figure>
        </Chapter>
    );
}
