import { useMemo } from "react";

import { LAST_INDEX, type SoftmaxShare, type Variant, weightsOf } from "@/lib/attention";

import { Ch06Arcs } from "./Ch06Arcs";
import { dotClass, wideGraph, wordClass } from "./Ch06Layout";
import { SvgCallout } from "./kit";

export interface Ch06WideProps {
    data: Variant;
    share: SoftmaxShare;
    words: readonly string[];
    percents: readonly [string, string];
    label: string;
}

/**
 * Desktop graph of chapter 6: the 13 words in a row, an arc rising from "il" to each of them with
 * its thickness following the weight, the percentage of the two heaviest above their arcs and a
 * halftone dot under each word whose area follows the weight. It hides at 760 px and below.
 *
 * @param data - Attention data of the active variant, whose weights size the arcs
 * @param share - Ranking of the words by weight, which picks the two highlighted arcs
 * @param words - The 13 words as shown, in sentence order, the last one following the language
 * @param percents - Formatted percentages of the two heaviest words, heaviest first, printed next to their arcs
 * @param label - Accessible description of the figure, read in place of the drawing
 */
export function Ch06Wide({ data, share, words, percents, label }: Ch06WideProps) {
    const graph = useMemo(() => wideGraph(weightsOf(data), share), [data, share]);

    return (
        <svg
            width={1184}
            height={484}
            viewBox="0 0 1184 484"
            role="img"
            aria-label={label}
            className="block h-auto w-full max-[761px]:hidden"
        >
            <Ch06Arcs arcs={graph.arcs} />
            {graph.labels.map((position, place) => (
                <text
                    key={place}
                    x={position.x}
                    y={position.y - 14}
                    textAnchor="middle"
                    strokeWidth={7}
                    strokeLinejoin="round"
                    paintOrder="stroke"
                    className="fill-signal-ink stroke-background font-mono text-[21px] font-semibold tracking-[-0.02em]"
                >
                    {percents[place]}
                </text>
            ))}
            {graph.labels.map((position, place) => (
                <SvgCallout key={place} n={place + 1} x={position.x - 62} y={position.y - 21} />
            ))}
            {graph.words.map((word, index) => (
                <text
                    key={index}
                    lang={index === LAST_INDEX ? undefined : "fr"}
                    x={word.at}
                    y={416}
                    textAnchor="middle"
                    className={`font-sans text-[22px] ${wordClass(word)}`}
                >
                    {words[index]}
                </text>
            ))}
            {graph.words.map((word, index) => (
                <circle
                    key={index}
                    cx={word.at}
                    cy={454}
                    r={word.radius}
                    className={dotClass(word)}
                />
            ))}
            <circle
                cx={graph.query}
                cy={454}
                r={13}
                fill="none"
                strokeWidth={1.2}
                className="stroke-signal"
            />
        </svg>
    );
}
