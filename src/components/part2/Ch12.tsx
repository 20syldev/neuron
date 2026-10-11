import { useLocale, useTranslations } from "next-intl";

import { RICH } from "@/components/part2/Ch11Rich";
import { Ch12Order } from "@/components/part2/Ch12Order";
import { Chapter, ChapterHeader, ChapterNext, MarginNote, Prose } from "@/components/part2/kit";
import { formatPercent } from "@/lib/format";
import { SENTENCES, topTwoWords } from "@/lib/order";

/**
 * Chapter 12, the order of words: the same five words in two orders give the same attention row
 * to "mord" until a position marker is added, which makes the word that bites win in each
 * sentence. The prose states the problem and the remedy, the figure lets the reader flip the
 * marker, and the numbers of the headline come from the same toy data as the figure.
 *
 * @returns The chapter with its prose, its margin notes and its figure
 */
export function Ch12() {
    const t = useTranslations("part2.ch12");
    const titles = useTranslations("header.chapters");
    const locale = useLocale();

    const percent = (ratio: number) => formatPercent(locale, ratio, 1);
    const [tied] = topTwoWords(SENTENCES.dog, false, "mord");
    const [winner, loser] = topTwoWords(SENTENCES.dog, true, "mord");

    const values = {
        tie: percent(tied.weight),
        win: percent(winner.weight),
        lose: percent(loser.weight),
    };

    return (
        <Chapter number={12}>
            <ChapterHeader number={12} title={titles("12")}>
                {t.rich("headline", { ...RICH, ...values })}
            </ChapterHeader>
            <Prose>{t("intro")}</Prose>
            <MarginNote label={t("toyLabel")}>{t("toyNote")}</MarginNote>
            <Prose>{t.rich("plan", RICH)}</Prose>
            <MarginNote>{t("rotationNote")}</MarginNote>
            <Ch12Order />
            <MarginNote label={t("readingLabel")}>{t.rich("readingNote", RICH)}</MarginNote>
            <ChapterNext next={13} title={titles("13")}>
                {t("next")}
            </ChapterNext>
        </Chapter>
    );
}
