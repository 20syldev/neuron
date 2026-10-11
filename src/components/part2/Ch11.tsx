import { useLocale, useTranslations } from "next-intl";

import { Ch11Matrix } from "@/components/part2/Ch11Matrix";
import { RICH } from "@/components/part2/Ch11Rich";
import {
    Caption,
    Chapter,
    ChapterHeader,
    ChapterNext,
    Disclosure,
    Fact,
    Facts,
    Figure,
    MarginNote,
    Plate,
    Prose,
    VariantLine,
} from "@/components/part2/kit";
import {
    ANIMAL_INDEX,
    COST,
    FULL,
    IL_INDEX,
    LAST_INDEX,
    TOKEN_COUNT,
    TOKENS,
} from "@/lib/attention";
import { formatNumber, formatPercent } from "@/lib/format";

/**
 * Chapter 11, the attention matrix: the 13 by 13 grid of weights as a poster, with the row of
 * "il" framed in the signal colour and the column of "animal" dashed. Only the tired sentence
 * has a full grid, so the plate is frozen on it and says so in its header.
 */
export function Ch11() {
    const t = useTranslations("part2.ch11");
    const titles = useTranslations("header.chapters");
    const variants = useTranslations("part2.kit.variant");
    const locale = useLocale();

    const tired = variants("tired");
    const words = TOKENS.map((token, index) => (index === LAST_INDEX ? tired : token));
    const percent = (ratio: number) => formatPercent(locale, ratio, 1);

    const values = {
        words: formatNumber(locale, TOKEN_COUNT),
        weights: formatNumber(locale, COST.comparisons),
        total: formatPercent(locale, 1),
        tired,
        ilA: percent(FULL[IL_INDEX][ANIMAL_INDEX]),
        ilF: percent(FULL[IL_INDEX][LAST_INDEX]),
        naA: percent(FULL[2][ANIMAL_INDEX]),
        lA: percent(FULL[10][ANIMAL_INDEX]),
    };

    return (
        <Chapter number={11}>
            <ChapterHeader number={11} title={titles("11")}>
                {t.rich("headline", { ...RICH, ...values })}
            </ChapterHeader>
            <Prose>{t("intro")}</Prose>
            <MarginNote>{t("noteParallel")}</MarginNote>
            <Prose>{t.rich("reading", { ...RICH, ...values })}</Prose>
            <MarginNote>{t.rich("noteOpening", { ...RICH, ...values })}</MarginNote>
            <Figure>
                <Plate
                    number="11"
                    aside={<VariantLine frozen />}
                    padClassName="max-[561px]:px-1 max-[561px]:pt-3.5 max-[561px]:pb-[18px]"
                >
                    <div className="pr-[34px] max-[561px]:pr-0">
                        <Ch11Matrix
                            values={FULL}
                            words={words}
                            label={t("figureLabel", values)}
                            emphasis={IL_INDEX}
                            outlineColumn={ANIMAL_INDEX}
                            marks={[
                                { row: IL_INDEX, col: LAST_INDEX, n: 1 },
                                { row: LAST_INDEX, col: ANIMAL_INDEX, n: 2, below: true },
                            ]}
                        />
                    </div>
                </Plate>
                <Caption
                    figure={11}
                    disclosure={
                        <Disclosure id="c11">
                            <Facts min={230}>
                                <Fact label={t("facts.row.label")}>
                                    {t.rich("facts.row.value", { ...RICH, ...values })}
                                </Fact>
                                <Fact label={t("facts.column.label")}>
                                    {t.rich("facts.column.value", { ...RICH, ...values })}
                                </Fact>
                                <Fact label={t("facts.weights.label")}>
                                    {t("facts.weights.value", values)}
                                </Fact>
                            </Facts>
                        </Disclosure>
                    }
                >
                    {t.rich("caption", { ...RICH, ...values })}
                </Caption>
            </Figure>
            <MarginNote label={t("readingLabel")}>{t("readingNote")}</MarginNote>
            <ChapterNext next={12} title={titles("12")}>
                {t("next")}
            </ChapterNext>
        </Chapter>
    );
}
