"use client";

import { useLocale, useTranslations } from "next-intl";
import { type CSSProperties } from "react";

import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useConfidenceText } from "./confidence";
import { useDigit } from "./DigitProvider";
import { Eyebrow } from "./Eyebrow";
import { DIGITS } from "./network";

export interface StemProps {
    digit: number;
    probability: number;
    top: boolean;
}

const STEM_HEIGHT = 76;

const MIN_LABELLED = 0.05;

/**
 * One output probability: a value label, a head dot and a stem whose height is the probability.
 * The predicted digit is orange and larger; the others stay in the border colour.
 *
 * @param digit - Digit of the stem, 0 to 9, exposed as data-digit
 * @param probability - Probability of that digit from 0 to 1, rounded to whole pixels of a 76 px
 *   stem; its label is hidden under 0.05 unless the stem is the top one
 * @param top - Highlights the stem of the predicted digit in the signal colour
 */
function Stem({ digit, probability, top }: StemProps) {
    const locale = useLocale();
    const labelled = top || probability >= MIN_LABELLED;
    const style = { "--stem": `${Math.round(probability * STEM_HEIGHT)}px` } as CSSProperties;

    return (
        <div className="flex flex-col items-center justify-end" data-digit={digit}>
            <span
                className={cn(
                    "mb-2 font-mono text-[10.5px] leading-[14px] font-medium",
                    top ? "text-signal-ink" : "text-muted-foreground",
                    !labelled && "hidden",
                )}
            >
                {formatNumber(locale, probability, 2)}
            </span>
            <span
                className={cn(
                    "block flex-none rounded-full",
                    top ? "-mb-[5.5px] size-[11px] bg-signal" : "-mb-0.5 size-1 bg-border-strong",
                )}
            />
            <span
                style={style}
                className={cn(
                    "block h-(--stem) w-0.5 flex-none transition-[height] duration-150 motion-reduce:transition-none",
                    top ? "bg-signal" : "bg-border-strong",
                )}
            />
        </div>
    );
}

/**
 * The ten output probabilities of the network as a row of stems, one per digit, read live from
 * the inference. Without an inference every stem is flat.
 */
export function Probabilities() {
    const t = useTranslations("part1.ch1");
    const { inference, digit, confidence } = useDigit();
    const percent = useConfidenceText(confidence, true);
    const label =
        inference && digit !== null ? t("probsLabel", { digit, percent }) : t("probsNone");

    return (
        <div role="img" aria-label={label} className="mt-10">
            <div className="mb-2.5 flex items-baseline justify-between gap-3">
                <Eyebrow as="span">{t("probs")}</Eyebrow>
                <span className="font-mono text-[11px] text-muted-foreground">{t("range")}</span>
            </div>
            <div className="grid h-28 grid-cols-10 border-b border-border-strong">
                {DIGITS.map((index) => (
                    <Stem
                        key={index}
                        digit={index}
                        probability={inference ? inference.probs[index] : 0}
                        top={inference !== null && index === digit}
                    />
                ))}
            </div>
            <div className="mt-2 grid grid-cols-10">
                {DIGITS.map((index) => (
                    <span
                        key={index}
                        className={cn(
                            "block text-center font-mono text-xs leading-4",
                            inference && index === digit
                                ? "font-semibold text-signal-ink"
                                : "text-muted-foreground",
                        )}
                    >
                        {index}
                    </span>
                ))}
            </div>
        </div>
    );
}
