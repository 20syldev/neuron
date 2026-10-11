import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export interface Ch09TableRow {
    word: string;
    score: string;
    weight: string;
    self: boolean;
    strong: boolean;
}

export interface Ch09TableProps {
    rows: readonly Ch09TableRow[];
    label: string;
}

/**
 * The 13 words of the sentence with their raw score and their softmax weight, as the grid of
 * small cells printed inside the "Voir les nombres" disclosure of chapter 9.
 *
 * @param rows - The 13 words in sentence order. A row has the word as shown (the last word follows the language), its raw score and its softmax weight already formatted as a percentage, a flag for "il" whose name is printed in the signal ink, and a flag for the two heaviest words whose weight is printed in the signal ink
 * @param label - Accessible name of the list of scores and weights
 */
export function Ch09Table({ rows, label }: Ch09TableProps) {
    const t = useTranslations("part2.ch9.table");

    return (
        <ol
            aria-label={label}
            className="mt-2.5 mb-[18px] grid list-none grid-cols-[repeat(auto-fit,minmax(118px,1fr))] p-0"
        >
            {rows.map((row) => (
                <li
                    key={row.word}
                    className="flex min-w-0 flex-col gap-0.5 border-l border-border py-1.5 pr-1.5 pl-2.5"
                >
                    <span
                        className={cn(
                            "font-mono text-xs leading-4 whitespace-nowrap",
                            row.self ? "font-semibold text-signal-ink" : "text-foreground",
                        )}
                    >
                        {row.word}
                    </span>
                    <span className="font-mono text-xs leading-4 text-muted-foreground">
                        <span className="sr-only">{t("score")} </span>
                        {row.score}
                    </span>
                    <span
                        className={cn(
                            "font-mono text-[12.5px] leading-4",
                            row.strong ? "font-semibold text-signal-ink" : "text-foreground",
                        )}
                    >
                        <span className="sr-only">{t("weight")} </span>
                        {row.weight}
                    </span>
                </li>
            ))}
        </ol>
    );
}
