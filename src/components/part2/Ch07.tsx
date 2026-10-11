"use client";

import { useLocale, useTranslations } from "next-intl";

import { useVariantView } from "@/components/part2/Ch08Shared";
import {
    ANIMAL_INDEX,
    BOULEVARD_INDEX,
    KEY_ANIMAL,
    KEY_BOULEVARD,
    TOKENS,
    type Vector,
} from "@/lib/attention";
import { formatNumber } from "@/lib/format";

import { Ch07Marker } from "./Ch07Marker";
import { Ch07Vector } from "./Ch07Vector";
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
} from "./kit";
import { OpenerSpan } from "./OpenerSpan";
import { PROSE_TAGS } from "./OpenerTags";

/**
 * Chapter 7, query, key, value: "il" builds three vectors. The plate lays the query of "il" and
 * the keys of "animal" and "boulevard" on the same eight columns, circle for the query and square
 * for a key; the query follows the sentence variant while the keys stay put. The numbers panel
 * starts open.
 */
export function Ch07() {
    const t = useTranslations("part2.ch7");
    const titles = useTranslations("header.chapters");
    const locale = useLocale();
    const { word, data } = useVariantView();

    const animal = TOKENS[ANIMAL_INDEX];
    const boulevard = TOKENS[BOULEVARD_INDEX];
    const dimensions = KEY_ANIMAL.length;

    const list = (values: Vector) =>
        values.map((value) => formatNumber(locale, value, 2)).join(t("separator"));

    return (
        <Chapter number={7}>
            <ChapterHeader number={7} title={titles("7")}>
                {t.rich("statement", PROSE_TAGS)}
            </ChapterHeader>
            <Prose>{t("intro")}</Prose>
            <MarginNote>{t("absorbNote")}</MarginNote>
            <Prose>{t.rich("reading", PROSE_TAGS)}</Prose>
            <MarginNote>{t("toyNote", { dimensions })}</MarginNote>
            <Figure>
                <Plate number="07" aside={<VariantLine />}>
                    <div className="flex flex-col gap-[18px]">
                        <Ch07Vector
                            n={1}
                            kind="circle"
                            title={t("queryTitle")}
                            note={t("queryChange", { word })}
                            changes
                            label={t("queryLabel", { word, values: list(data.query) })}
                            values={data.query}
                        />
                        <Ch07Vector
                            n={2}
                            kind="square"
                            title={t("keyTitle", { token: animal })}
                            note={t("keyFixed")}
                            label={t("keyLabel", { token: animal, values: list(KEY_ANIMAL) })}
                            values={KEY_ANIMAL}
                        />
                        <Ch07Vector
                            n={2}
                            kind="square"
                            title={t("keyTitle", { token: boulevard })}
                            note={t("keyFixed")}
                            label={t("keyLabel", {
                                token: boulevard,
                                values: list(KEY_BOULEVARD),
                            })}
                            values={KEY_BOULEVARD}
                        />
                    </div>
                    <OpenerSpan className="mt-4">{t("span", { dimensions })}</OpenerSpan>
                    <ul
                        aria-label={t("legend")}
                        className="mt-5 mb-0 flex list-none flex-wrap gap-x-7 gap-y-2.5 border-t border-border p-0 pt-3.5 text-[15px] font-semibold"
                    >
                        <li className="flex items-center gap-2.5">
                            <Ch07Marker kind="circle" large />
                            {t("legendQuery")}
                        </li>
                        <li className="flex items-center gap-2.5">
                            <Ch07Marker kind="square" large />
                            {t("legendKey")}
                        </li>
                        <li className="flex items-center gap-2.5">
                            <Ch07Marker kind="diamond" large />
                            {t("legendValue")}
                        </li>
                    </ul>
                </Plate>
                <Caption
                    figure={7}
                    disclosure={
                        <Disclosure id="c7">
                            <Facts min={460}>
                                <Fact label={t("numbers.query", { word })}>{list(data.query)}</Fact>
                                <Fact label={t("numbers.key", { token: animal })}>
                                    {list(KEY_ANIMAL)}
                                </Fact>
                                <Fact label={t("numbers.key", { token: boulevard })}>
                                    {list(KEY_BOULEVARD)}
                                </Fact>
                            </Facts>
                        </Disclosure>
                    }
                >
                    {t.rich("caption", { ...PROSE_TAGS, word })}
                </Caption>
            </Figure>
            <MarginNote label={t("readingLabel")}>{t("readingNote")}</MarginNote>
            <ChapterNext next={8} title={titles("8")}>
                {t("next")}
            </ChapterNext>
        </Chapter>
    );
}
