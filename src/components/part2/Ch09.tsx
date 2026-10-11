"use client";

import { useTranslations } from "next-intl";

import { useVariantView } from "@/components/part2/Ch08Shared";
import { Ch09Legend } from "@/components/part2/Ch09Legend";
import { Ch09Table } from "@/components/part2/Ch09Table";
import { Ch09Waffle } from "@/components/part2/Ch09Waffle";
import {
    Accent,
    Callout,
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
} from "@/components/part2/kit";
import { IL_INDEX, shareCounts, TOKEN_COUNT, WAFFLE_DOTS } from "@/lib/attention";
import { formatPercent } from "@/lib/format";

/**
 * Chapter 9, softmax: the raw scores of "il" become weights that sum to 100 percent. The recipe
 * is drawn as a waffle of 100 dots shared between the two heaviest words and the others, with a
 * legend, and the disclosure lists the score and the weight of the 13 words.
 */
export function Ch09() {
    const t = useTranslations("part2.ch9");
    const titles = useTranslations("header.chapters");
    const { locale, word, data, share, label, percent, decimal } = useVariantView();

    const first = data.rows[share.first];
    const second = data.rows[share.second];
    const counts = shareCounts(share.firstWeight, share.secondWeight, WAFFLE_DOTS);
    const others = TOKEN_COUNT - 2;
    const rest = percent(share.restPercent / 100);
    const total = formatPercent(locale, 1);
    const firstWord = label(share.first);
    const secondWord = label(share.second);

    const marker = {
        c1: () => <Callout n={1} />,
        c2: () => <Callout n={2} />,
    };

    return (
        <Chapter number={9}>
            <ChapterHeader number={9} title={titles("9")}>
                {t.rich("statement", {
                    word,
                    first: firstWord,
                    share: percent(share.firstWeight),
                    n: (chunks) => <Accent>{chunks}</Accent>,
                })}
            </ChapterHeader>
            <Prose>{t("intro")}</Prose>
            <MarginNote label={t("formulaLabel")}>{t("formulaNote")}</MarginNote>
            <Prose>
                {t.rich("scores", {
                    word,
                    first: firstWord,
                    second: secondWord,
                    firstScore: decimal(first.score),
                    secondScore: decimal(second.score),
                    firstShare: percent(share.firstWeight),
                    secondShare: percent(share.secondWeight),
                    others,
                    rest,
                    ...marker,
                })}
            </Prose>
            <MarginNote>{t("sum", { total })}</MarginNote>
            <Figure>
                <Plate number="09" aside={<VariantSwitch />}>
                    <div className="flex flex-wrap items-center gap-x-9 gap-y-7">
                        <Ch09Waffle
                            first={counts.first}
                            second={counts.second}
                            label={t("waffleLabel", {
                                dots: WAFFLE_DOTS,
                                first: counts.first,
                                firstWord,
                                second: counts.second,
                                secondWord,
                                rest: counts.rest,
                                others,
                            })}
                            scale={t("scale", { dots: WAFFLE_DOTS, total })}
                        />
                        <Ch09Legend
                            entries={[
                                {
                                    callout: 1,
                                    tone: "signal",
                                    label: t("quoted", { word: firstWord }),
                                    value: percent(share.firstWeight),
                                },
                                {
                                    callout: 2,
                                    tone: "foreground",
                                    label: t("quoted", { word: secondWord }),
                                    value: percent(share.secondWeight),
                                },
                                {
                                    tone: "muted",
                                    label: t("others", { others }),
                                    value: rest,
                                },
                            ]}
                        />
                    </div>
                </Plate>
                <Caption
                    figure={9}
                    disclosure={
                        <Disclosure id="c9">
                            <Label>{t("table.title", { word })}</Label>
                            <Ch09Table
                                label={t("table.label", { word })}
                                rows={data.rows.map((row, index) => ({
                                    word: label(index),
                                    score: decimal(row.score),
                                    weight: percent(row.weight),
                                    self: index === IL_INDEX,
                                    strong: index === share.first || index === share.second,
                                }))}
                            />
                            <Facts min={250}>
                                <Fact label={t("numbers.formula")}>{t("formula")}</Fact>
                                <Fact label={t("numbers.sum")}>
                                    {t("numbers.always", { total })}
                                </Fact>
                            </Facts>
                        </Disclosure>
                    }
                >
                    {t.rich("caption", { others, ...marker })}
                </Caption>
            </Figure>
            <MarginNote label={t("readingLabel")}>{t("reading")}</MarginNote>
            <ChapterNext next={10} title={titles("10")}>
                {t("next")}
            </ChapterNext>
        </Chapter>
    );
}
