import { useLocale, useTranslations } from "next-intl";

import { RICH } from "@/components/part2/Ch11Rich";
import { Ch15Cost } from "@/components/part2/Ch15Cost";
import { Ch15Heads } from "@/components/part2/Ch15Heads";
import { Ch15Next } from "@/components/part2/Ch15Next";
import {
    Caption,
    Chapter,
    ChapterHeader,
    Disclosure,
    Fact,
    Facts,
    Figure,
    MarginNote,
    Plate,
    Prose,
} from "@/components/part2/kit";
import { COST } from "@/lib/attention";
import { formatNumber } from "@/lib/format";

/**
 * Chapter 15, layers and cost: the 9 216 heads of GPT-3 (2020) as a square of dots, and the
 * squares of 169 and 676 comparisons that show why doubling the sentence quadruples the work.
 * GPT-3 is cited with its date because its architecture is public, which the margin says.
 */
export function Ch15() {
    const t = useTranslations("part2.ch15");
    const titles = useTranslations("header.chapters");
    const extras = useTranslations("header.extras");
    const locale = useLocale();

    const values = {
        words: formatNumber(locale, COST.words),
        doubledWords: formatNumber(locale, COST.doubledWords),
        comparisons: formatNumber(locale, COST.comparisons),
        doubled: formatNumber(locale, COST.doubledComparisons),
        layers: formatNumber(locale, COST.layers),
        heads: formatNumber(locale, COST.headsPerLayer),
        total: formatNumber(locale, COST.totalHeads),
        factor: formatNumber(locale, COST.doubledComparisons / COST.comparisons),
    };

    return (
        <Chapter number={15}>
            <ChapterHeader number={15} title={titles("15")}>
                {t.rich("headline", { ...RICH, ...values })}
            </ChapterHeader>
            <Prose>{t("intro", values)}</Prose>
            <MarginNote>{t("gptNote", values)}</MarginNote>
            <Prose>{t.rich("reading", { ...RICH, ...values })}</Prose>
            <MarginNote>{t("doublingNote", values)}</MarginNote>
            <Figure>
                <Plate
                    number="15"
                    aside={
                        <span className="font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
                            {t("aside", values)}
                        </span>
                    }
                >
                    <div className="flex flex-wrap items-end gap-x-10 gap-y-8">
                        <Ch15Heads values={values} />
                        <Ch15Cost values={values} />
                    </div>
                </Plate>
                <Caption
                    figure={15}
                    disclosure={
                        <Disclosure id="c15">
                            <Facts min={220}>
                                <Fact label={t("facts.gpt.label")}>
                                    {t.rich("facts.gpt.value", { ...RICH, ...values })}
                                </Fact>
                                <Fact label={t("facts.small.label", values)}>
                                    {t("facts.small.value", values)}
                                </Fact>
                                <Fact label={t("facts.big.label", values)}>
                                    {t.rich("facts.big.value", { ...RICH, ...values })}
                                </Fact>
                            </Facts>
                        </Disclosure>
                    }
                >
                    {t.rich("caption", { ...RICH, ...values })}
                </Caption>
            </Figure>
            <MarginNote label={t("readingLabel")}>{t("readingNote")}</MarginNote>
            <Ch15Next title={extras("epilogue")}>{t("next")}</Ch15Next>
        </Chapter>
    );
}
