import { cn } from "@/lib/utils";

export interface Ch10MarkProps {
    n: number;
    x: number;
    y: number;
    tone: "signal" | "foreground";
    large?: boolean;
}

/**
 * Numbered callout drawn inside the SVG of chapter 10. Unlike the other chapters, callout 1 marks
 * the merged value in the foreground tone and callout 2 the heaviest value in the signal tone.
 *
 * @param n - Number printed in the badge
 * @param x - Abscissa of the centre of the badge in SVG units
 * @param y - Ordinate of the centre of the badge in SVG units
 * @param tone - Colour of the badge: foreground for callout 1 and signal for callout 2 in this chapter
 * @param large - Draws the larger badge of the phone figure, false by default
 */
export function Ch10Mark({ n, x, y, tone, large = false }: Ch10MarkProps) {
    const signal = tone === "signal";

    return (
        <g aria-hidden="true">
            <circle
                cx={x}
                cy={y}
                r={large ? 12 : 10}
                strokeWidth={1}
                className={cn("fill-background", signal ? "stroke-signal" : "stroke-foreground")}
            />
            <text
                x={x}
                y={y}
                dy={large ? 5 : 3.6}
                textAnchor="middle"
                className={cn(
                    "font-mono font-semibold",
                    large ? "text-sm" : "text-[11px]",
                    signal ? "fill-signal-ink" : "fill-foreground",
                )}
            >
                {n}
            </text>
        </g>
    );
}
