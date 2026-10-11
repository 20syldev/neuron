import { useLocale, useTranslations } from "next-intl";

import { IL_INDEX } from "@/lib/attention";
import { formatPercent } from "@/lib/format";
import { type Head, ilPeak, ilRow } from "@/lib/heads";
import { cn } from "@/lib/utils";

interface Ch13TableProps {
    heads: readonly Head[];
    words: readonly string[];
}

/**
 * Row of "il" of the four heads side by side, as printed inside the "Voir les nombres" disclosure
 * of chapter 13: one line per word, one column per head, each weight formatted for the active
 * locale and the heaviest weight of each head printed in the signal ink.
 *
 * @param heads - The four heads, one column each, in the order of the figure
 * @param words - The 13 words as printed on the rows, in sentence order
 * @returns The table of the row of "il", one column per head
 */
export function Ch13Table({ heads, words }: Ch13TableProps) {
    const t = useTranslations("part2.ch13");
    const locale = useLocale();

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-[12.5px] leading-[1.4] tabular-nums">
                <caption className="sr-only">{t("table.label")}</caption>
                <thead>
                    <tr className="border-b border-border-strong text-left align-bottom">
                        <th
                            scope="col"
                            className="py-2 pr-3 text-[11px] font-medium text-muted-foreground"
                        >
                            {t("table.word")}
                        </th>
                        {heads.map((head, index) => (
                            <th
                                key={head.id}
                                scope="col"
                                className="px-2 py-2 text-right text-[11px] max-[561px]:px-1 font-medium text-muted-foreground first-letter:uppercase"
                            >
                                <span className="block text-[10.5px] tracking-[0.1em] uppercase">
                                    {t("head", { n: index + 1 })}
                                </span>
                                <span className="max-[561px]:sr-only">
                                    {t(`names.${head.name}`)}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {words.map((word, col) => (
                        <tr key={col} className="border-b border-border">
                            <th
                                scope="row"
                                lang={col === words.length - 1 ? undefined : "fr"}
                                className={cn(
                                    "py-1.5 pr-3 text-left font-normal",
                                    col === IL_INDEX
                                        ? "font-semibold text-signal-ink"
                                        : "text-muted-foreground",
                                )}
                            >
                                {word}
                            </th>
                            {heads.map((head) => (
                                <td
                                    key={head.id}
                                    className={cn(
                                        "px-2 py-1.5 text-right max-[561px]:px-1",
                                        ilRow(head)[col] === ilPeak(head)
                                            ? "font-semibold text-signal-ink"
                                            : "text-foreground",
                                    )}
                                >
                                    {formatPercent(locale, ilRow(head)[col], 1)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
