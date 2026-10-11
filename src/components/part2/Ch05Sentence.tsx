import { ANIMAL_INDEX, BOULEVARD_INDEX, IL_INDEX, LAST_INDEX } from "@/lib/attention";

import { Callout } from "./kit";

export interface Ch05SentenceProps {
    words: readonly string[];
    open: string;
    close: string;
}

/**
 * The sentence of the essay set large: the two candidates are underlined with a second callout,
 * "il" is orange with a dot under it and a first callout, and the last word sits on a muted chip
 * that announces its changes to screen readers. Words followed by an apostrophe stick to the next.
 *
 * @param words - Words of the sentence in order, the last one being the word of the active variant
 * @param open - Opening quote in the quoting style of the language, printed muted before the sentence
 * @param close - Closing quote, printed muted after the full stop
 */
export function Ch05Sentence({ words, open, close }: Ch05SentenceProps) {
    return (
        <p className="mt-3 mb-0 font-display text-[clamp(28px,3.7vw,40px)] leading-[1.28] font-medium tracking-[-0.012em] text-pretty">
            <span className="text-muted-foreground">{open}</span>
            {words.map((word, index) => {
                const space = index < LAST_INDEX && !word.endsWith("'") ? " " : "";

                if (index === ANIMAL_INDEX || index === BOULEVARD_INDEX) {
                    return (
                        <span key={index} lang="fr">
                            <span className="whitespace-nowrap">
                                <span className="underline decoration-border-strong decoration-[0.05em] underline-offset-[0.16em]">
                                    {word}
                                </span>
                                <Callout n={2} size="md" />
                            </span>
                            {space}
                        </span>
                    );
                }

                if (index === IL_INDEX) {
                    return (
                        <span key={index} lang="fr">
                            <span className="whitespace-nowrap">
                                <span className="relative inline-block font-semibold text-signal">
                                    {word}
                                    <span
                                        aria-hidden="true"
                                        className="absolute -bottom-[0.04em] left-1/2 -ml-[0.08em] size-[0.16em] rounded-full bg-signal"
                                    />
                                </span>
                                <Callout n={1} size="md" />
                            </span>
                            {space}
                        </span>
                    );
                }

                if (index === LAST_INDEX) {
                    return (
                        <span
                            key={index}
                            aria-live="polite"
                            className="rounded-[4px] bg-muted px-[0.12em]"
                        >
                            {word}
                        </span>
                    );
                }

                return (
                    <span key={index} lang="fr">
                        {word}
                        {space}
                    </span>
                );
            })}
            .<span className="text-muted-foreground">{close}</span>
        </p>
    );
}
