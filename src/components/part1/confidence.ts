import { useLocale, useTranslations } from "next-intl";

import { formatPercent } from "@/lib/format";

import { CONFIDENCE_CAP } from "./network";

/**
 * Formats a probability for display: one decimal place, and "> 99,9 %" in place of a rounded
 * "100,0 %" so a confident answer never claims to be certain.
 *
 * @param probability - Probability of the predicted digit, 0 to 1
 * @param prose - Writes "plus de 99,9 %" instead of "> 99,9 %", for a sentence or a screen reader
 * @returns The translated text, such as "72,4 %" or "> 99,9 %"
 */
export function useConfidenceText(probability: number, prose = false): string {
    const t = useTranslations("part1.confidence");
    const locale = useLocale();

    if (probability > CONFIDENCE_CAP) {
        return t(prose ? "aboveProse" : "above", {
            percent: formatPercent(locale, CONFIDENCE_CAP, 1),
        });
    }

    return formatPercent(locale, probability, 1);
}
