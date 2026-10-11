export interface Ch06MarkProps {
    x: number;
    y: number;
    n: 1 | 2;
}

/**
 * Larger numbered callout of the phone graph, which reads at arm's length: a 12 unit circle with
 * a 14 unit number, signal coloured for callout 1 and foreground for callout 2.
 *
 * @param x - Centre abscissa in SVG units
 * @param y - Centre ordinate in SVG units
 * @param n - Number printed in the badge, 1 for the heaviest arc and 2 for the second heaviest
 */
export function Ch06Mark({ x, y, n }: Ch06MarkProps) {
    const first = n === 1;

    return (
        <g aria-hidden="true">
            <circle
                cx={x}
                cy={y}
                r={12}
                strokeWidth={1}
                className={
                    first ? "fill-background stroke-signal" : "fill-background stroke-foreground"
                }
            />
            <text
                x={x}
                y={y}
                dy={5}
                textAnchor="middle"
                className={`font-mono text-[14px] font-semibold ${first ? "fill-signal-ink" : "fill-foreground"}`}
            >
                {n}
            </text>
        </g>
    );
}
