import { useLocale, useTranslations } from "next-intl";

import { formatPercent } from "@/lib/format";
import { QUERY_WORD, rowOf, type Sentence, topTwoWords } from "@/lib/order";
import { cn } from "@/lib/utils";

const HEAD_CELL =
    "border-b border-foreground px-2 py-1.5 font-mono text-[11px] font-medium tracking-[0.04em] text-muted-foreground";

interface Ch12TableProps {
    sentence: Sentence;
}

/**
 * Exact weights that "mord" gives to the five words of a sentence, without and with the position
 * marker, in reading order, with the two heaviest words of each state in the signal ink and the
 * total of each column. It is printed inside the "Voir les nombres" disclosure of chapter 12.
 *
 * @param sentence - Sentence whose row of "mord" is listed, "dog" or "man"
 * @returns A captioned table of five rows and a total row
 */
export function Ch12Table({ sentence }: Ch12TableProps) {
    const t = useTranslations("part2.ch12");
    const locale = useLocale();
    const title = t(`panel.${sentence.id}.title`);
    const text = t(`panel.${sentence.id}.text`);
    const states = [false, true].map((withPosition) => {
        const [first, second] = topTwoWords(sentence, withPosition, QUERY_WORD);

        return {
            row: rowOf(sentence, withPosition, QUERY_WORD),
            strong: [first.index, second.index],
        };
    });

    return (
        <div className="min-w-0">
            <p className="m-0 font-mono text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                {title}
            </p>
            <p lang="fr" className="mt-1 mb-2 font-mono text-[12.5px] text-foreground">
                {text}
            </p>
            <table className="w-full border-collapse font-mono text-xs">
                <caption className="sr-only">{t("table.label", { title, text })}</caption>
                <thead>
                    <tr>
                        <th scope="col" className={cn(HEAD_CELL, "text-left")}>
                            {t("table.word")}
                        </th>
                        {states.map((state, index) => (
                            <th key={index} scope="col" className={cn(HEAD_CELL, "text-right")}>
                                {t(index === 0 ? "table.off" : "table.on")}
                                <span className="sr-only"> {t("table.marker")}</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sentence.tokens.map((token, wordIndex) => (
                        <tr key={wordIndex} className="border-b border-border">
                            <th
                                scope="row"
                                lang="fr"
                                className="px-2 py-1.5 text-left font-normal text-foreground"
                            >
                                {t(`words.${token}`)}
                            </th>
                            {states.map((state, index) => (
                                <td
                                    key={index}
                                    className={cn(
                                        "px-2 py-1.5 text-right",
                                        state.strong.includes(wordIndex)
                                            ? "font-semibold text-signal-ink"
                                            : "text-foreground",
                                    )}
                                >
                                    {formatPercent(locale, state.row[wordIndex], 1)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <th
                            scope="row"
                            className="px-2 py-1.5 text-left font-medium text-muted-foreground"
                        >
                            {t("table.total")}
                        </th>
                        {states.map((state, index) => (
                            <td
                                key={index}
                                className="px-2 py-1.5 text-right text-muted-foreground"
                            >
                                {formatPercent(
                                    locale,
                                    state.row.reduce((sum, value) => sum + value, 0),
                                    1,
                                )}
                            </td>
                        ))}
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
