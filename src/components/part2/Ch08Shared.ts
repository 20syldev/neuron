import { useLocale } from "next-intl";
import { useMemo } from "react";

import { usePartTwo } from "@/components/part2/kit";
import {
    LAST_INDEX,
    type SoftmaxShare,
    softmaxShare,
    type Variant,
    VARIANTS,
    weightsOf,
} from "@/lib/attention";
import { formatNumber, formatPercent } from "@/lib/format";

export interface VariantView {
    locale: string;
    word: string;
    data: Variant;
    share: SoftmaxShare;
    label: (index: number) => string;
    percent: (ratio: number) => string;
    decimal: (value: number) => string;
}

/**
 * Reads the active sentence variant and derives what chapters 8, 9 and 10 print from it: the
 * ranked words, the percentages and the two-decimal numbers in the active locale.
 *
 * @returns The active locale tag ("en" or "fr"), the display word of the last word of the sentence in that language, the attention data of the active variant (query, dot products and the 13 rows), the ranking of the words by the weight "il" gives them with the three heaviest and the rest, a label function giving the word shown for a sentence index (only the last word follows the language), and formatters bound to the locale that print a ratio as a percentage with one decimal and a number with two decimals
 */
export function useVariantView(): VariantView {
    const locale = useLocale();
    const { variant, word } = usePartTwo();

    return useMemo(() => {
        const data = VARIANTS[variant];

        return {
            locale,
            word,
            data,
            share: softmaxShare(weightsOf(data)),
            label: (index: number) => (index === LAST_INDEX ? word : data.rows[index].token),
            percent: (ratio: number) => formatPercent(locale, ratio, 1),
            decimal: (value: number) => formatNumber(locale, value, 2),
        };
    }, [locale, variant, word]);
}
