import { type CSSProperties } from "react";

import { cn } from "@/lib/utils";

export interface OpenerListEntry {
    word: string;
    percent: string;
    strong: boolean;
}

export interface OpenerListProps {
    entries: readonly OpenerListEntry[];
    min: number;
    className?: string;
}

/**
 * Two-column list of the weights of a row, one line per word with a hairline under it, used in
 * the "Voir les nombres" panels of the opener and of chapter 6.
 *
 * @param entries - Words in print order, each with its pre-formatted weight such as "72,4 %" and a flag that prints the two strongest in bold signal colour
 * @param min - Smallest column width in px before the list wraps to a single column
 * @param className - Margin classes of the list, which differ between figures
 */
export function OpenerList({ entries, min, className }: OpenerListProps) {
    return (
        <ul
            className={cn(
                "m-0 mt-3 grid list-none grid-cols-[repeat(auto-fit,minmax(var(--list-min),1fr))] gap-x-7 p-0",
                className,
            )}
            style={{ "--list-min": `${min}px` } as CSSProperties}
        >
            {entries.map((entry) => (
                <li
                    key={entry.word}
                    className={cn(
                        "flex justify-between gap-3 border-b border-border font-mono text-[12.5px] leading-[1.7]",
                        entry.strong ? "font-semibold text-signal-ink" : "text-foreground",
                    )}
                >
                    <span>{entry.word}</span>
                    <span>{entry.percent}</span>
                </li>
            ))}
        </ul>
    );
}
