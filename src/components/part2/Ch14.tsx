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
    BOULEVARD_INDEX,
    CAUSAL,
    COST,
    IL_INDEX,
    LAST_INDEX,
    MASKED_COUNT,
    TOKEN_COUNT,
    TOKENS,
} from "@/lib/attention";
import { formatNumber, formatPercent } from "@/lib/format";

const TAG_ROW = 3;

const TAG_COLUMN = 9;

/**
 * Chapter 14, the causal mask: the causal grid as a dark plate, the future words hatched, with
 * the row of "il" that has only read ten words and the row of the last word that looks back.
 * Only the tired sentence has a causal grid, so the plate is frozen on it and says so.
 */
export function Ch14() {
    const t = useTranslations("part2.ch14");
    const titles = useTranslations("header.chapters");
    const variants = useTranslations("part2.kit.variant");
    const locale = useLocale();

    const tired = variants("tired");
    const words = TOKENS.map((token, index) => (index === LAST_INDEX ? tired : token));
    const percent = (ratio: number) => formatPercent(locale, ratio, 1);

    const values = {
        words: formatNumber(locale, TOKEN_COUNT),
        cells: formatNumber(locale, COST.comparisons),
        masked: formatNumber(locale, MASKED_COUNT),
        total: formatPercent(locale, 1),
        tired,
        ilA: percent(CAUSAL[IL_INDEX][ANIMAL_INDEX]),
        ilB: percent(CAUSAL[IL_INDEX][BOULEVARD_INDEX]),
        fIl: percent(CAUSAL[LAST_INDEX][IL_INDEX]),
        fA: percent(CAUSAL[LAST_INDEX][ANIMAL_INDEX]),
    };

    return (
        <Chapter number={14}>
            <ChapterHeader number={14} title={titles("14")}>
                {t.rich("headline", { ...RICH, ...values })}
            </ChapterHeader>
            <Prose>{t("intro", values)}</Prose>
            <MarginNote label={t("cellsLabel")}>{t("cells", values)}</MarginNote>
            <Prose>{t.rich("reading", { ...RICH, ...values })}</Prose>
            <MarginNote>{t("rows", values)}</MarginNote>
            <Figure>
                <Plate tone="dark" aside={<VariantLine frozen />}>
                    <div className="pr-[34px] max-[561px]:pr-0">
                        <Ch11Matrix
                            values={CAUSAL}
                            words={words}
                            label={t("figureLabel", values)}
                            emphasis={IL_INDEX}
                            outlineRow={LAST_INDEX}
                            masked
                            marks={[
                                { row: IL_INDEX, col: LAST_INDEX, n: 1 },
                                { row: LAST_INDEX, col: LAST_INDEX, n: 2 },
                            ]}
                            tag={{ row: TAG_ROW, col: TAG_COLUMN, text: t("tag") }}
                        />
                    </div>
                </Plate>
                <Caption
                    plate={14}
                    disclosure={
                        <Disclosure id="c14">
                            <Facts min={210}>
                                <Fact label={t("facts.masked.label")}>
                                    {t("facts.masked.value", values)}
                                </Fact>
                                <Fact label={t("facts.hesitates.label")}>
                                    {t.rich("facts.hesitates.value", { ...RICH, ...values })}
                                </Fact>
                                <Fact label={t("facts.backward.label", values)}>
                                    {t.rich("facts.backward.value", { ...RICH, ...values })}
                                </Fact>
                                <Fact label={t("facts.sentence.label")}>
                                    {t("facts.sentence.value", values)}
                                </Fact>
                            </Facts>
                        </Disclosure>
                    }
                >
                    {t.rich("caption", { ...RICH, ...values })}
                </Caption>
            </Figure>
            <MarginNote label={t("readingLabel")}>{t("readingNote")}</MarginNote>
            <ChapterNext next={15} title={titles("15")}>
                {t("next")}
            </ChapterNext>
        </Chapter>
    );
}
