import { useMemo } from "react";

import { narrowGeometry } from "@/components/part2/Ch10Layout";
import { Ch10Mark } from "@/components/part2/Ch10Mark";
import { LAST_INDEX, type SoftmaxShare, type Variant, weightsOf } from "@/lib/attention";
import { NARROW_FIGURE } from "@/lib/figures";
import { cn } from "@/lib/utils";

export interface Ch10NarrowProps {
    data: Variant;
    share: SoftmaxShare;
    words: readonly string[];
    label: string;
    mixLabel: string;
}

/**
 * Phone figure of chapter 10, shown at 760 px and below: the sentence runs down the left edge
 * with one value diamond per word, and the flows run right into the merged diamond.
 *
 * @param data - Attention data of the active variant, whose weights size the diamonds and the flows
 * @param share - Ranking of the words by weight, which picks the two heaviest words drawn in the signal colour
 * @param words - The 13 words as shown, in sentence order, the last one following the language
 * @param label - Accessible description of the figure, read in place of the drawing
 * @param mixLabel - Caption written under the merged diamond
 */
export function Ch10Narrow({ data, share, words, label, mixLabel }: Ch10NarrowProps) {
    const geometry = useMemo(() => narrowGeometry(weightsOf(data), share), [data, share]);
    const { wordX, mixX, mixY, mixHalf } = NARROW_FIGURE;

    return (
        <svg
            viewBox="0 0 480 530"
            role="img"
            aria-label={label}
            className="mx-auto hidden h-auto w-full max-w-[520px] max-[761px]:block"
        >
            {geometry.flows.map((flow, index) => (
                <path
                    key={index}
                    d={flow.path}
                    fill="none"
                    strokeWidth={flow.width}
                    strokeLinecap="round"
                    className={flow.strong ? "stroke-signal" : "stroke-border-strong"}
                />
            ))}
            {geometry.diamonds.map((diamond, index) => (
                <polygon
                    key={index}
                    points={diamond.points}
                    className={diamond.strong ? "fill-signal" : "fill-value"}
                />
            ))}
            {geometry.words.map((word, index) => (
                <text
                    key={index}
                    lang={index === LAST_INDEX ? undefined : "fr"}
                    x={wordX}
                    y={word.at}
                    textAnchor="end"
                    className={cn(
                        "font-sans text-lg",
                        word.self || word.strong ? "font-bold" : "font-medium",
                        word.self ? "fill-signal-ink" : "fill-foreground",
                    )}
                >
                    {words[index]}
                </text>
            ))}
            <polygon
                points={geometry.outline}
                fill="none"
                strokeWidth={1}
                className="stroke-border-strong"
            />
            <path
                d={geometry.lattice[0]}
                fill="none"
                strokeWidth={9}
                strokeLinecap="round"
                className="stroke-signal"
            />
            <path
                d={geometry.lattice[1]}
                fill="none"
                strokeWidth={9}
                strokeLinecap="round"
                className="stroke-foreground"
            />
            <path
                d={geometry.lattice[2]}
                fill="none"
                strokeWidth={9}
                strokeLinecap="round"
                className="stroke-muted-foreground"
            />
            <text
                x={mixX}
                y={mixY + mixHalf + 36}
                textAnchor="middle"
                className="fill-foreground font-sans text-lg font-semibold"
            >
                {mixLabel}
            </text>
            <Ch10Mark n={1} tone="foreground" large {...geometry.mixMark} />
            <Ch10Mark n={2} tone="signal" large {...geometry.topMark} />
        </svg>
    );
}
