import { useLocale, useTranslations } from "next-intl";

import {
    COST,
    FULL,
    IL_INDEX,
    KEY_ANIMAL,
    softmaxShare,
    TOKEN_COUNT,
    TOKENS,
    VARIANTS,
    weightsOf,
} from "@/lib/attention";
import { formatPercent } from "@/lib/format";

import {
    Caption,
    Disclosure,
    Fact,
    Facts,
    Figure,
    Label,
    MarginNote,
    Plate,
    Prose,
    RailLayout,
    Statement,
} from "./kit";
import { ChapterNext } from "./kit/ChapterNext";
import { WIDE_COLUMN } from "./kit/layout";
import { OpenerKicker } from "./OpenerKicker";
import { OpenerList } from "./OpenerList";
import { OpenerPoster } from "./OpenerPoster";
import { linkTag, PROSE_TAGS } from "./OpenerTags";

/**
 * Opener of Part II: the headline of the part, a short introduction with its margin notes, and
 * the whole attention grid of the "tired" sentence as a dark plate. It is frozen on the first
 * sentence, whatever the reader sets in chapter 5.
 */
export function Opener() {
    const t = useTranslations("part2.opener");
    const kit = useTranslations("part2.kit");
    const variantWords = useTranslations("part2.kit.variant");
    const titles = useTranslations("header.chapters");
    const locale = useLocale();

    const weights = weightsOf(VARIANTS.tired);
    const share = softmaxShare(FULL[IL_INDEX], IL_INDEX);
    const p1 = formatPercent(locale, share.firstWeight, 1);
    const p2 = formatPercent(locale, share.secondWeight, 1);
    const t1 = TOKENS[share.first];
    const t2 = TOKENS[share.second];
    const entries = FULL[IL_INDEX].map((weight, index) => ({
        word: TOKENS[index],
        percent: formatPercent(locale, weight, 1),
        strong: index === share.first || index === share.second,
    }));
    const dimensions = KEY_ANIMAL.length;

    return (
        <RailLayout
            id="partie-2"
            titleId="p2-title"
            label={t("rail")}
            value="II"
            state="read"
            divider={false}
            className="pt-19 pb-19"
        >
            <header className={`${WIDE_COLUMN} pb-[30px]`}>
                <OpenerKicker part={kit("part")} title={kit("read")}>
                    {t("range")}
                </OpenerKicker>
                <Statement id="p2-title" srPrefix={t("srTitle")}>
                    {t.rich("headline", {
                        ...PROSE_TAGS,
                        words: TOKEN_COUNT,
                        weights: COST.comparisons,
                    })}
                </Statement>
            </header>
            <Prose>
                {t("intro", {
                    rows: TOKEN_COUNT,
                    columns: TOKEN_COUNT,
                    weights: COST.comparisons,
                })}
            </Prose>
            <MarginNote>{t("toyNote", { dimensions })}</MarginNote>
            <Prose>{t.rich("rowText", { ...PROSE_TAGS, p1, p2, t1, t2 })}</Prose>
            <MarginNote>
                {t.rich("switchNote", {
                    link: linkTag("#ch-5"),
                    tired: variantWords("tired"),
                    wide: variantWords("wide"),
                })}
            </MarginNote>
            <Figure>
                <Plate
                    tone="dark"
                    padClassName="pb-[30px]"
                    aside={
                        <span className="font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
                            {t("plateTag", { word: variantWords("tired"), count: weights.length })}
                        </span>
                    }
                >
                    <OpenerPoster
                        query={t("query")}
                        label={t("posterLabel", { count: TOKEN_COUNT, p1, p2, t1, t2 })}
                        extent={t("span", { count: TOKEN_COUNT, total: COST.comparisons })}
                    />
                </Plate>
                <Caption
                    plate="II"
                    disclosure={
                        <Disclosure id="o">
                            <Label>{t("numbers.row", { word: variantWords("tired") })}</Label>
                            <OpenerList entries={entries} min={150} className="mb-[22px]" />
                            <Facts min={170}>
                                <Fact label={t("numbers.sentence")}>
                                    {t("numbers.sentenceValue", { count: TOKEN_COUNT })}
                                </Fact>
                                <Fact label={t("numbers.weights")}>
                                    {t("numbers.weightsValue", {
                                        count: TOKEN_COUNT,
                                        total: COST.comparisons,
                                    })}
                                </Fact>
                                <Fact label={t("numbers.vectors")}>
                                    {t("numbers.vectorsValue", { dimensions })}
                                </Fact>
                                <Fact label={t("numbers.rowSum")}>{formatPercent(locale, 1)}</Fact>
                            </Facts>
                        </Disclosure>
                    }
                >
                    {t.rich("caption", PROSE_TAGS)}
                </Caption>
            </Figure>
            <MarginNote label={t("readingLabel")}>
                {t("reading", { count: TOKEN_COUNT, sum: formatPercent(locale, 1) })}
            </MarginNote>
            <ChapterNext next={5} title={titles("5")}>
                {t("next")}
            </ChapterNext>
        </RailLayout>
    );
}
