import { Callout } from "@/components/part2/kit";
import { cn } from "@/lib/utils";

export interface Ch09LegendEntry {
    callout?: 1 | 2;
    tone: "signal" | "foreground" | "muted";
    label: string;
    value: string;
}

export interface Ch09LegendProps {
    entries: readonly Ch09LegendEntry[];
}

const DOT_TONES = {
    signal: "bg-signal",
    foreground: "bg-foreground",
    muted: "bg-muted-foreground",
};

const VALUE_TONES = {
    signal: "text-signal-ink",
    foreground: "text-foreground",
    muted: "text-muted-foreground",
};

const LABEL_TONES = {
    signal: "font-bold",
    foreground: "font-semibold",
    muted: "font-medium text-muted-foreground",
};

/**
 * Legend of the waffle of chapter 9: one row per group of dots, laid out on a fixed grid so the
 * callouts, the colour dots, the names and the values line up from row to row.
 *
 * @param entries - The three rows in order: heaviest word, second, all the others. A row has an optional callout number (1 or 2, omitted for the row of the other words), a tone for its dot, label and value (signal, foreground or muted), a label naming the group of words (already quoted for a single word) and the already formatted share of attention of the group
 */
export function Ch09Legend({ entries }: Ch09LegendProps) {
    return (
        <ul className="m-0 min-w-0 flex-[1_1_280px] list-none border-t border-foreground p-0">
            {entries.map((entry) => (
                <li
                    key={entry.label}
                    className="grid grid-cols-[17px_18px_minmax(0,1fr)_auto] items-center gap-3.5 border-b border-border py-3.5"
                >
                    {entry.callout ? (
                        <Callout n={entry.callout} size="flush" />
                    ) : (
                        <span aria-hidden="true" />
                    )}
                    <span
                        aria-hidden="true"
                        className={cn("size-4 flex-none rounded-full", DOT_TONES[entry.tone])}
                    />
                    <span className={cn("text-base", LABEL_TONES[entry.tone])}>{entry.label}</span>
                    <span
                        className={cn(
                            "font-mono text-[28px] leading-none font-medium tracking-[-0.01em]",
                            VALUE_TONES[entry.tone],
                        )}
                    >
                        {entry.value}
                    </span>
                </li>
            ))}
        </ul>
    );
}
