import { useMemo } from "react";

import { LAST_INDEX, type SoftmaxShare, type Variant, weightsOf } from "@/lib/attention";
import { NARROW_FIGURE } from "@/lib/figures";

import { Ch06Arcs } from "./Ch06Arcs";
import { dotClass, narrowGraph, wordClass } from "./Ch06Layout";
import { Ch06Mark } from "./Ch06Mark";

export interface Ch06NarrowProps {
    data: Variant;
    share: SoftmaxShare;
    words: readonly string[];
    percents: readonly [string, string];
    label: string;
}

/**
 * Phone graph of chapter 6: the sentence runs down the left edge, one word per row, the arcs
 * bulge to the right of it and a dotted leader links the two heaviest to their percentage, set
 * at the right edge. It shows at 760 px and below.
 *
 * @param data - Attention data of the active variant, whose weights size the arcs
 * @param share - Ranking of the words by weight, which picks the two highlighted arcs
 * @param words - The 13 words as shown, in sentence order, the last one following the language
 * @param percents - Formatted percentages of the two heaviest words, heaviest first, printed next to their arcs
 * @param label - Accessible description of the figure, read in place of the drawing
 */
export function Ch06Narrow({ data, share, words, percents, label }: Ch06NarrowProps) {
    const graph = useMemo(() => narrowGraph(weightsOf(data), share), [data, share]);

    return (
        <svg
            viewBox="0 0 480 530"
            role="img"
            aria-label={label}
            className="mx-auto hidden h-auto w-full max-w-[520px] max-[761px]:block"
        >
            <Ch06Arcs arcs={graph.arcs} />
            {graph.labels.map((position, place) => (
                <g key={place}>
                    <path
                        d={`M${position.x + 12} ${position.y}H356`}
                        fill="none"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeDasharray="0 5"
                        className="stroke-signal"
                    />
                    <Ch06Mark n={place === 0 ? 1 : 2} x={372} y={position.y} />
                    <text
                        x={478}
                        y={position.y + 7.5}
                        textAnchor="end"
                        strokeWidth={6}
                        strokeLinejoin="round"
                        paintOrder="stroke"
                        className="fill-signal-ink stroke-background font-mono text-[22px] font-semibold tracking-[-0.02em]"
                    >
                        {percents[place]}
                    </text>
                </g>
            ))}
            {graph.words.map((word, index) => (
                <text
                    key={index}
                    lang={index === LAST_INDEX ? undefined : "fr"}
                    x={NARROW_FIGURE.wordX}
                    y={word.at + 6}
                    textAnchor="end"
                    className={`font-sans text-[18px] ${wordClass(word)}`}
                >
                    {words[index]}
                </text>
            ))}
            {graph.words.map((word, index) => (
                <circle
                    key={index}
                    cx={NARROW_FIGURE.dotX}
                    cy={word.at}
                    r={word.radius}
                    className={dotClass(word)}
                />
            ))}
            <circle
                cx={NARROW_FIGURE.dotX}
                cy={graph.query}
                r={12}
                fill="none"
                strokeWidth={1.2}
                className="stroke-signal"
            />
        </svg>
    );
}
