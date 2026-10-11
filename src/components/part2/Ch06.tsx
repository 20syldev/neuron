"use client";

import { useTranslations } from "next-intl";

import { useVariantView } from "@/components/part2/Ch08Shared";
import { thinnest, weightsOf } from "@/lib/attention";

import { Ch06Narrow } from "./Ch06Narrow";
import { Ch06Wide } from "./Ch06Wide";
import {
    Caption,
    Chapter,
    ChapterHeader,
    ChapterNext,
    Disclosure,
    Fact,
    Facts,
    Figure,
    Label,
    MarginNote,
    Plate,
    Prose,
    VariantSwitch,
} from "./kit";
import { OpenerList } from "./OpenerList";
import { linkTag, PROSE_TAGS } from "./OpenerTags";

/**
 * Chapter 6, the attention graph: every word is a node and "il" draws an arc to each of the
 * others, thickness following the weight. The figure is a dark plate with a wide layout on
 * desktop and a vertical one at 760 px and below, and follows the sentence variant.
 */
export function Ch06() {
    const t = useTranslations("part2.ch6");
    const titles = useTranslations("header.chapters");
    const { word, data, share, label, percent } = useVariantView();

    const weights = weightsOf(data);
    const thin = thinnest(weights);
    const words = data.rows.map((_, index) => label(index));
    const [first, second, third] = [share.first, share.second, share.third].map(label);
    const firstShare = percent(share.firstWeight);
    const secondShare = percent(share.secondWeight);
    const thirdShare = percent(share.thirdWeight);
    const percents = [firstShare, secondShare] as const;

    const figureLabel = t("figureLabel", {
        word,
        t1: first,
        t2: second,
        t3: third,
        p1: firstShare,
        p2: secondShare,
        p3: thirdShare,
    });

    const entries = share.order.map((index) => ({
        word: words[index],
        percent: percent(weights[index]),
        strong: index === share.first || index === share.second,
    }));

    return (
        <Chapter number={6}>
            <ChapterHeader number={6} title={titles("6")}>
                {t.rich("statement", {
                    ...PROSE_TAGS,
                    t1: first,
                    t2: second,
                    p1: firstShare,
                    p2: secondShare,
                })}
            </ChapterHeader>
            <Prose>{t("intro")}</Prose>
            <MarginNote>{t.rich("linksNote", { link: linkTag("#ch-11") })}</MarginNote>
            <Prose>
                {t.rich("reading", {
                    ...PROSE_TAGS,
                    word,
                    t1: first,
                    t2: second,
                    t3: third,
                    p1: firstShare,
                    p2: secondShare,
                    p3: thirdShare,
                    thinCount: thin.count,
                    thinWeight: percent(thin.weight),
                })}
            </Prose>
            <MarginNote>{t("widthNote")}</MarginNote>
            <Figure wide>
                <Plate tone="dark" padClassName="pb-6" aside={<VariantSwitch />}>
                    <Ch06Wide
                        data={data}
                        share={share}
                        words={words}
                        percents={percents}
                        label={figureLabel}
                    />
                    <Ch06Narrow
                        data={data}
                        share={share}
                        words={words}
                        percents={percents}
                        label={figureLabel}
                    />
                </Plate>
                <Caption
                    plate={6}
                    disclosure={
                        <Disclosure id="c6">
                            <Label>{t("numbers.all", { word })}</Label>
                            <OpenerList entries={entries} min={170} className="mb-[18px]" />
                            <Facts min={200}>
                                <Fact label={t("numbers.thickest")}>
                                    {t("numbers.pair", { word: first, percent: firstShare })}
                                    <br />
                                    {t("numbers.pair", { word: second, percent: secondShare })}
                                </Fact>
                                <Fact label={t("numbers.then")}>
                                    {t("numbers.pair", { word: third, percent: thirdShare })}
                                </Fact>
                                <Fact label={t("numbers.thinnest")}>
                                    {t("numbers.thinnestValue", {
                                        weight: percent(thin.weight),
                                        count: thin.count,
                                    })}
                                </Fact>
                            </Facts>
                        </Disclosure>
                    }
                >
                    {t.rich("caption", { ...PROSE_TAGS, word })}
                </Caption>
            </Figure>
            <ChapterNext next={7} title={titles("7")}>
                {t("next")}
            </ChapterNext>
        </Chapter>
    );
}
