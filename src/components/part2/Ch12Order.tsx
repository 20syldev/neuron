"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { RICH } from "@/components/part2/Ch11Rich";
import { Ch12Panel } from "@/components/part2/Ch12Panel";
import { Ch12Switch } from "@/components/part2/Ch12Switch";
import { Ch12Table } from "@/components/part2/Ch12Table";
import { Caption, Disclosure, Fact, Facts, Figure, Plate } from "@/components/part2/kit";
import { formatNumber, formatPercent } from "@/lib/format";
import {
    POSITION_BONUS,
    POSITION_OFFSET,
    QUERY_WORD,
    scoresOf,
    SENTENCE_IDS,
    SENTENCES,
    topTwoWords,
} from "@/lib/order";
import { cn } from "@/lib/utils";

/**
 * Figure of chapter 12: the light plate with its local switch, the two sentence panels, the
 * statement of the result, the caption and the "Voir les nombres" disclosure. It holds the single
 * state of the chapter, whether the position marker is on, and starts without it so that the
 * reader first sees the problem.
 *
 * @returns The figure element with its plate and its caption
 */
export function Ch12Order() {
    const t = useTranslations("part2.ch12");
    const locale = useLocale();
    const [withPosition, setWithPosition] = useState(false);

    const { dog, man } = SENTENCES;
    const percent = (ratio: number) => formatPercent(locale, ratio, 1);
    const decimal = (value: number) => formatNumber(locale, value, 1);
    const word = (token: string) => t(`words.${token}`);

    const [offFirst, offSecond] = topTwoWords(dog, false, QUERY_WORD);
    const [aFirst, aSecond] = topTwoWords(dog, true, QUERY_WORD);
    const [bFirst, bSecond] = topTwoWords(man, true, QUERY_WORD);

    const verdict = withPosition
        ? t("verdict.on.text", {
              aFirst: word(aFirst.word),
              aSecond: word(aSecond.word),
              aWin: percent(aFirst.weight),
              aLose: percent(aSecond.weight),
              bFirst: word(bFirst.word),
              bSecond: word(bSecond.word),
              bWin: percent(bFirst.weight),
              bLose: percent(bSecond.weight),
          })
        : t("verdict.off.text", {
              first: word(offFirst.word),
              second: word(offSecond.word),
              tie: percent(offFirst.weight),
          });

    const dogQuery = dog.tokens.indexOf(QUERY_WORD);
    const manQuery = man.tokens.indexOf(QUERY_WORD);
    const values = {
        place: formatNumber(locale, dogQuery + 1),
        bonus: formatNumber(locale, POSITION_BONUS),
        total: percent(1),
        a0: decimal(scoresOf(dog, false)[dogQuery][dogQuery + POSITION_OFFSET]),
        a1: decimal(scoresOf(dog, true)[dogQuery][dogQuery + POSITION_OFFSET]),
        b0: decimal(scoresOf(man, false)[manQuery][manQuery + POSITION_OFFSET]),
        b1: decimal(scoresOf(man, true)[manQuery][manQuery + POSITION_OFFSET]),
    };

    return (
        <Figure>
            <Plate
                number="12"
                aside={
                    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-query" />
                        <span>{t("aside")}</span>
                    </span>
                }
            >
                <Ch12Switch withPosition={withPosition} onChange={setWithPosition} />
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,290px),1fr))] gap-3.5">
                    {SENTENCE_IDS.map((id) => (
                        <Ch12Panel key={id} sentence={SENTENCES[id]} withPosition={withPosition} />
                    ))}
                </div>
                <div
                    aria-live="polite"
                    className="mt-4 flex flex-wrap items-baseline gap-x-3.5 gap-y-2 border-t border-foreground pt-3.5"
                >
                    <span
                        className={cn(
                            "rounded-[2px] border px-2 py-1 font-mono text-[10.5px] leading-none font-semibold tracking-[0.14em] uppercase",
                            withPosition
                                ? "border-signal-ink text-signal-ink"
                                : "border-border-strong text-muted-foreground",
                        )}
                    >
                        {t(withPosition ? "verdict.on.tag" : "verdict.off.tag")}
                    </span>
                    <p className="m-0 min-w-0 flex-[1_1_260px] text-[15px] leading-[1.5] text-foreground">
                        {verdict}
                    </p>
                </div>
            </Plate>
            <Caption
                figure={12}
                disclosure={
                    <Disclosure id="c12">
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-x-8 gap-y-6">
                            {SENTENCE_IDS.map((id) => (
                                <Ch12Table key={id} sentence={SENTENCES[id]} />
                            ))}
                        </div>
                        <div className="mt-6">
                            <Facts min={230}>
                                <Fact label={t("facts.rule.label")}>
                                    {t("facts.rule.value", values)}
                                </Fact>
                                <Fact label={t("facts.raw.label")}>
                                    {t.rich("facts.raw.value", { ...RICH, ...values })}
                                </Fact>
                                <Fact label={t("facts.sum.label")}>
                                    {t("facts.sum.value", values)}
                                </Fact>
                            </Facts>
                        </div>
                    </Disclosure>
                }
            >
                {t.rich("caption", { ...RICH, ...values })}
            </Caption>
        </Figure>
    );
}
