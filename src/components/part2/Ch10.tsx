"use client";

import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { useVariantView } from "@/components/part2/Ch08Shared";
import { Ch10Narrow } from "@/components/part2/Ch10Narrow";
import { Ch10Wide } from "@/components/part2/Ch10Wide";
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
    MarginNote,
    Plate,
    Prose,
    TextLink,
    VariantSwitch,
} from "@/components/part2/kit";

/**
 * Chapter 10, the weighted sum: the 13 value diamonds, each sized by the weight "il" gives it,
 * funnel into one merged diamond of 113 dots shared between the two heaviest words and the others.
 * The figure is a dark plate with a wide layout on desktop and a vertical one at 760 px and below,
 * and it ends on the sentence that says what "il" now carries.
 */
export function Ch10() {
    const t = useTranslations("part2.ch10");
    const titles = useTranslations("header.chapters");
    const { word, data, share, label, percent } = useVariantView();

    const firstWord = label(share.first);
    const secondWord = label(share.second);
    const firstShare = percent(share.firstWeight);
    const secondShare = percent(share.secondWeight);
    const rest = percent(share.restPercent / 100);
    const words = data.rows.map((_, index) => label(index));

    const marker = {
        c1: () => <Callout n={1} tone="foreground" />,
        c2: () => <Callout n={2} tone="signal" />,
    };

    const bold = (chunks: ReactNode) => <b className="font-bold">{chunks}</b>;

    return (
        <Chapter number={10}>
            <ChapterHeader number={10} title={titles("10")}>
                {t.rich("statement", {
                    first: firstWord,
                    firstShare,
                    second: secondWord,
                    secondShare,
                    n: (chunks) => <Accent>{chunks}</Accent>,
                })}
            </ChapterHeader>
            <Prose>{t("intro")}</Prose>
            <MarginNote>{t("valueNote")}</MarginNote>
            <Prose>
                {t.rich("mix", {
                    word,
                    first: firstWord,
                    firstShare,
                    second: secondWord,
                    secondShare,
                    rest,
                    link: (chunks) => <TextLink href="#ch-9">{chunks}</TextLink>,
                    ...marker,
                })}
            </Prose>
            <MarginNote>{t("addNote")}</MarginNote>
            <Figure wide>
                <Plate tone="dark" aside={<VariantSwitch />}>
                    <Ch10Wide
                        data={data}
                        share={share}
                        words={words}
                        label={t("figureLabel", {
                            first: firstWord,
                            firstShare,
                            second: secondWord,
                            secondShare,
                            rest,
                        })}
                        mixLabel={t("mixLabel")}
                    />
                    <Ch10Narrow
                        data={data}
                        share={share}
                        words={words}
                        label={t("figureLabel", {
                            first: firstWord,
                            firstShare,
                            second: secondWord,
                            secondShare,
                            rest,
                        })}
                        mixLabel={t("mixLabel")}
                    />
                    <p
                        aria-live="polite"
                        className="mt-[26px] max-w-[25em] font-display text-[clamp(22px,2.4vw,30px)] leading-[1.25] font-medium tracking-[-0.01em] max-[561px]:mt-5 max-[561px]:px-3"
                    >
                        {t.rich(`conclusion.${data.id}`, {
                            a: (chunks) => <b className="font-bold text-signal">{chunks}</b>,
                            b: bold,
                        })}
                    </p>
                </Plate>
                <Caption
                    plate={10}
                    disclosure={
                        <Disclosure id="c10">
                            <Facts min={230}>
                                <Fact label={t("numbers.mix")}>
                                    {t("numbers.line", { share: firstShare, word: firstWord })}
                                    <br />
                                    {t("numbers.line", { share: secondShare, word: secondWord })}
                                    <br />
                                    {t("numbers.rest", { share: rest })}
                                </Fact>
                                <Fact label={t("numbers.drawing")}>{t("numbers.rounded")}</Fact>
                                <Fact label={t("numbers.sentence")}>
                                    {t("numbers.word", { word })}
                                </Fact>
                            </Facts>
                        </Disclosure>
                    }
                >
                    {t.rich("caption", { word, ...marker })}
                </Caption>
            </Figure>
            <ChapterNext next={11} title={titles("11")}>
                {t("next")}
            </ChapterNext>
        </Chapter>
    );
}
