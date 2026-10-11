import { useLocale, useTranslations } from "next-intl";

import { RICH } from "@/components/part2/Ch11Rich";
import { Ch13Head, typographic } from "@/components/part2/Ch13Head";
import { Ch13Table } from "@/components/part2/Ch13Table";
import {
    Caption,
    Chapter,
    ChapterHeader,
    ChapterNext,
    Disclosure,
    Figure,
    MarginNote,
    Plate,
    Prose,
    VariantLine,
} from "@/components/part2/kit";
import { COST, LAST_INDEX, TOKEN_COUNT, TOKENS } from "@/lib/attention";
import { formatNumber, formatPercent } from "@/lib/format";
import { HEADS, ilPeak, ilTopTwo } from "@/lib/heads";

/**
 * Chapter 13, several heads: one grid captures one kind of relation, so a transformer runs several
 * in parallel. The plate draws four illustrative heads over the tired sentence, each with the row
 * of "il" framed, and the disclosure lists the 13 weights of that row for the four heads.
 *
 * @returns The chapter with its prose, its margin notes and its figure
 */
export function Ch13() {
    const t = useTranslations("part2.ch13");
    const titles = useTranslations("header.chapters");
    const variants = useTranslations("part2.kit.variant");
    const locale = useLocale();

    const tired = variants("tired");
    const words = TOKENS.map((token, index) => (index === LAST_INDEX ? tired : token));
    const byPeak = [...HEADS].sort((a, b) => ilPeak(b) - ilPeak(a));
    const heaviest = byPeak[0];
    const lightest = byPeak[byPeak.length - 1];

    const values = {
        words: formatNumber(locale, TOKEN_COUNT),
        heads: formatNumber(locale, COST.headsPerLayer),
        max: formatPercent(locale, ilPeak(heaviest), 1),
        maxWord: typographic(TOKENS[ilTopTwo(heaviest)[0]]),
        min: formatPercent(locale, ilPeak(lightest), 1),
        minWord: typographic(TOKENS[ilTopTwo(lightest)[0]]),
    };

    return (
        <Chapter number={13}>
            <ChapterHeader number={13} title={titles("13")}>
                {t.rich("headline", { ...RICH, ...values })}
            </ChapterHeader>
            <Prose>{t("intro")}</Prose>
            <MarginNote label={t("noteLabel")}>{t("note")}</MarginNote>
            <Prose>{t("combine")}</Prose>
            <MarginNote label={t("crossLabel")}>
                {t.rich("cross", { ...RICH, ...values })}
            </MarginNote>
            <Figure>
                <Plate
                    number="13"
                    aside={<VariantLine frozen />}
                    padClassName="max-[561px]:px-1 max-[561px]:pt-3.5 max-[561px]:pb-[18px]"
                >
                    <div
                        role="group"
                        aria-label={t("figureLabel", values)}
                        className="grid grid-cols-2 gap-x-10 gap-y-7 max-[561px]:gap-x-2 max-[561px]:gap-y-5"
                    >
                        {HEADS.map((head, index) => (
                            <Ch13Head
                                key={head.id}
                                head={head}
                                position={index + 1}
                                words={words}
                            />
                        ))}
                    </div>
                </Plate>
                <Caption
                    figure={13}
                    disclosure={
                        <Disclosure id="c13">
                            <Ch13Table heads={HEADS} words={words} />
                        </Disclosure>
                    }
                >
                    {t.rich("caption", { ...RICH, ...values })}
                </Caption>
            </Figure>
            <ChapterNext next={14} title={titles("14")}>
                {t("next")}
            </ChapterNext>
        </Chapter>
    );
}
