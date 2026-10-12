import { useLocale, useTranslations } from "next-intl";
import { type CSSProperties } from "react";

import { Callout } from "@/components/part2/kit";
import { matrixDotPercent } from "@/lib/figures";
import { formatNumber, formatPercent } from "@/lib/format";
import {
    isTied,
    POSITION_BONUS,
    POSITION_OFFSET,
    QUERY_WORD,
    rowOf,
    type Sentence,
    topTwoWords,
} from "@/lib/order";
import { cn } from "@/lib/utils";

const DOT_FRACTION = 0.92;

interface Ch12PanelProps {
    sentence: Sentence;
    withPosition: boolean;
}

/**
 * One sentence of the plate of chapter 12: its five words in reading order, and under each word a
 * halftone dot whose area carries the weight "mord" gives to it. The two heaviest words are drawn
 * in the signal colour with their percentage, "mord" itself carries the first callout, and with
 * the marker on each word shows its place and the word right before "mord" shows its bonus.
 *
 * @param sentence - Sentence drawn in this panel, "dog" or "man"
 * @param withPosition - True when the position marker is on: places and the bonus are shown and the weights follow it
 * @returns The panel, exposed as one image with the five weights in its accessible name
 */
export function Ch12Panel({ sentence, withPosition }: Ch12PanelProps) {
    const t = useTranslations("part2.ch12");
    const locale = useLocale();
    const row = rowOf(sentence, withPosition, QUERY_WORD);
    const [first, second] = topTwoWords(sentence, withPosition, QUERY_WORD);
    const tied = isTied(first.weight, second.weight);
    const queryIndex = sentence.tokens.indexOf(QUERY_WORD);
    const percent = (ratio: number) => formatPercent(locale, ratio, 1);
    const word = (token: string) => t(`words.${token}`);

    const weights = sentence.tokens
        .map((token, index) => `${word(token)} ${percent(row[index])}`)
        .join(", ");

    return (
        <div className="min-w-0 border border-border p-3.5 max-[561px]:p-3">
            <p className="m-0 font-mono text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                {t(`panel.${sentence.id}.title`)}
            </p>
            <p
                lang="fr"
                className="mt-1 mb-0 font-display text-[22px] leading-[1.2] font-medium tracking-[-0.01em]"
            >
                {t(`panel.${sentence.id}.text`)}
            </p>
            <p className="mt-1 mb-4 text-[13px] leading-[1.4] text-muted-foreground">
                {t(`panel.${sentence.id}.biter`)}
            </p>
            <div
                role="img"
                aria-label={t("panel.label", {
                    title: t(`panel.${sentence.id}.title`),
                    text: t(`panel.${sentence.id}.text`),
                    weights,
                })}
                className="grid grid-cols-5 gap-1"
            >
                {sentence.tokens.map((token, index) => {
                    const isQuery = index === queryIndex;
                    const isStrong = index === first.index || index === second.index;
                    const hasBonus = index === queryIndex + POSITION_OFFSET;

                    return (
                        <div key={index} className="flex min-w-0 flex-col items-center">
                            <div
                                aria-hidden="true"
                                className={cn(
                                    "flex h-9 flex-col items-center gap-0.5 font-mono text-[11px] leading-none text-muted-foreground transition-opacity duration-300 motion-reduce:transition-none",
                                    !withPosition && "opacity-0",
                                )}
                            >
                                <span className="pt-0.5">{formatNumber(locale, index + 1)}</span>
                                {hasBonus ? (
                                    <span className="rounded-[3px] border border-signal px-1 py-0.5 font-semibold text-signal-ink">
                                        +{formatNumber(locale, POSITION_BONUS)}
                                    </span>
                                ) : null}
                            </div>
                            <span
                                lang="fr"
                                className={cn(
                                    "flex items-center gap-1 font-mono text-[13px] leading-none",
                                    isQuery ? "font-semibold text-signal-ink" : "text-foreground",
                                )}
                            >
                                {isQuery ? (
                                    <span
                                        aria-hidden="true"
                                        className="inline-block size-2 flex-none rounded-full bg-query"
                                    />
                                ) : null}
                                {word(token)}
                            </span>
                            <div className="mt-2 flex aspect-square w-full items-center justify-center">
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        "block aspect-square w-[max(3px,var(--dot))] flex-none rounded-full transition-[width,background-color] duration-300 ease-out motion-reduce:transition-none",
                                        isStrong ? "bg-signal" : "bg-foreground",
                                    )}
                                    style={
                                        {
                                            "--dot": `${matrixDotPercent(row[index], DOT_FRACTION)}%`,
                                        } as CSSProperties
                                    }
                                />
                            </div>
                            <div className="mt-1 flex h-[22px] items-center justify-center">
                                {isQuery ? <Callout n={1} size="flush" /> : null}
                                {isStrong ? (
                                    <span className="font-mono text-[12.5px] font-semibold text-signal-ink">
                                        {percent(row[index])}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="mt-2.5 mb-0 flex items-start gap-2 text-[13px] leading-[1.45] text-foreground">
                <Callout n={2} size="flush" className="mt-px" />
                <span>
                    {t(tied ? "panel.tie" : "panel.top", {
                        first: word(first.word),
                        second: word(second.word),
                    })}
                </span>
            </p>
        </div>
    );
}
