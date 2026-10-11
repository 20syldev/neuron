import { useMemo } from "react";

import { wideGeometry } from "@/components/part2/Ch10Layout";
import { Ch10Mark } from "@/components/part2/Ch10Mark";
import { LAST_INDEX, type SoftmaxShare, type Variant, weightsOf } from "@/lib/attention";
import { WIDE_FIGURE } from "@/lib/figures";
import { cn } from "@/lib/utils";

export interface Ch10WideProps {
    data: Variant;
    share: SoftmaxShare;
    words: readonly string[];
    label: string;
    mixLabel: string;
}

/**
 * Desktop figure of chapter 10: the 13 value diamonds sit along the top, each sized by its
 * weight, their flows funnel into one merged diamond made of 113 lattice dots in three groups.
 *
 * @param data - Attention data of the active variant, whose weights size the diamonds and the flows
 * @param share - Ranking of the words by weight, which picks the two heaviest words drawn in the signal colour
 * @param words - The 13 words as shown, in sentence order, the last one following the language
 * @param label - Accessible description of the figure, read in place of the drawing
 * @param mixLabel - Caption written beside the merged diamond
 */
export function Ch10Wide({ data, share, words, label, mixLabel }: Ch10WideProps) {
    const geometry = useMemo(() => wideGeometry(weightsOf(data), share), [data, share]);
    const { mixX, mixY, mixHalf } = WIDE_FIGURE;

    return (
        <svg
            width={1184}
            height={444}
            viewBox="0 0 1184 444"
            role="img"
            aria-label={label}
            className="block h-auto w-full max-[761px]:hidden"
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
                    x={word.at}
                    y={24}
                    textAnchor="middle"
                    className={cn(
                        "font-sans text-[19px]",
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
                strokeWidth={10}
                strokeLinecap="round"
                className="stroke-signal"
            />
            <path
                d={geometry.lattice[1]}
                fill="none"
                strokeWidth={10}
                strokeLinecap="round"
                className="stroke-foreground"
            />
            <path
                d={geometry.lattice[2]}
                fill="none"
                strokeWidth={10}
                strokeLinecap="round"
                className="stroke-muted-foreground"
            />
            <text
                x={mixX - mixHalf - 22}
                y={mixY + 6}
                textAnchor="end"
                className="fill-foreground font-sans text-[17px] font-semibold"
            >
                {mixLabel}
            </text>
            <Ch10Mark n={1} tone="foreground" {...geometry.mixMark} />
            <Ch10Mark n={2} tone="signal" {...geometry.topMark} />
        </svg>
    );
}
