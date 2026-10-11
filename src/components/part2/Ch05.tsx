"use client";

import { useTranslations } from "next-intl";

import { useVariantView } from "@/components/part2/Ch08Shared";
import {
    ANIMAL_INDEX,
    BOULEVARD_INDEX,
    IL_INDEX,
    LAST_INDEX,
    TOKEN_COUNT,
    TOKENS,
} from "@/lib/attention";

import { Ch05Sentence } from "./Ch05Sentence";
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
    VariantSwitch,
} from "./kit";
import { linkTag, PROSE_TAGS } from "./OpenerTags";

/**
 * Chapter 5, the problem: the sentence set large with its two candidates for "il" and the only
 * setting of Part II, the last word of the sentence. Picking "tired" or "wide" here drives
 * chapters 6 to 10 through the provider.
 */
export function Ch05() {
    const t = useTranslations("part2.ch5");
    const kit = useTranslations("part2.kit.variant");
    const titles = useTranslations("header.chapters");
    const { word, data } = useVariantView();

    const words = data.rows.map((row, index) => (index === LAST_INDEX ? word : row.token));

    return (
        <Chapter number={5}>
            <ChapterHeader number={5} title={titles("5")}>
                {t.rich("statement", { ...PROSE_TAGS, words: TOKEN_COUNT })}
            </ChapterHeader>
            <Prose>{t("intro", { wide: kit("wide") })}</Prose>
            <MarginNote>{t("genderNote")}</MarginNote>
            <Prose>{t.rich("candidates", { ...PROSE_TAGS, link: linkTag("#ch-6") })}</Prose>
            <MarginNote label={t("positionLabel")}>{t("position")}</MarginNote>
            <Figure>
                <Plate
                    number="05"
                    aside={
                        <span className="font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
                            {t("plateTag", { count: TOKEN_COUNT })}
                        </span>
                    }
                >
                    <Ch05Sentence words={words} open={t("quoteOpen")} close={t("quoteClose")} />
                    {t("gloss", { word }) ? (
                        <p className="mt-4 mb-0 text-sm text-muted-foreground">
                            {t("gloss", { word })}
                        </p>
                    ) : null}
                    <VariantSwitch size="large" hint={t("switchHint")} />
                </Plate>
                <Caption
                    figure={5}
                    disclosure={
                        <Disclosure id="c5">
                            <Facts>
                                <Fact label={t("numbers.query")}>
                                    {t("numbers.queryValue", {
                                        position: IL_INDEX + 1,
                                        count: TOKEN_COUNT,
                                    })}
                                </Fact>
                                <Fact label={t("numbers.candidates")}>
                                    {t("numbers.candidateValue", {
                                        token: TOKENS[ANIMAL_INDEX],
                                        position: ANIMAL_INDEX + 1,
                                    })}
                                    <br />
                                    {t("numbers.candidateValue", {
                                        token: TOKENS[BOULEVARD_INDEX],
                                        position: BOULEVARD_INDEX + 1,
                                    })}
                                </Fact>
                                <Fact label={t("numbers.last")}>
                                    {t("numbers.lastValue", {
                                        token: data.rows[LAST_INDEX].token,
                                        word,
                                        position: LAST_INDEX + 1,
                                        count: TOKEN_COUNT,
                                    })}
                                </Fact>
                                <Fact label={t("numbers.sentence")}>
                                    {t("numbers.sentenceValue", { count: TOKEN_COUNT })}
                                </Fact>
                            </Facts>
                        </Disclosure>
                    }
                >
                    {t.rich("caption", {
                        ...PROSE_TAGS,
                        tired: kit("tired"),
                        wide: kit("wide"),
                    })}
                </Caption>
            </Figure>
            <ChapterNext next={6} title={titles("6")}>
                {t("next")}
            </ChapterNext>
        </Chapter>
    );
}
