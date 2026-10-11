export interface SvgCalloutProps {
    x: number;
    y: number;
    n: number;
}

/**
 * Numbered callout drawn inside a figure SVG, for the plates whose marks sit among the arcs and
 * the diamonds. It follows the tone of the plate it is drawn in: callout 1 in the signal colour,
 * the others in the foreground. The figure SVG carries the accessible label.
 *
 * @param x - Centre abscissa in SVG units
 * @param y - Centre ordinate in SVG units
 * @param n - Number printed in the badge, 1 or 2
 */
export function SvgCallout({ x, y, n }: SvgCalloutProps) {
    const first = n === 1;

    return (
        <g aria-hidden="true">
            <circle
                cx={x}
                cy={y}
                r={10}
                strokeWidth={1}
                className={
                    first ? "fill-background stroke-signal" : "fill-background stroke-foreground"
                }
            />
            <text
                x={x}
                y={y}
                dy={3.6}
                textAnchor="middle"
                className={`font-mono text-[11px] font-semibold ${first ? "fill-signal-ink" : "fill-foreground"}`}
            >
                {n}
            </text>
        </g>
    );
}
