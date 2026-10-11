import { cn } from "@/lib/utils";

export interface SwatchProps {
    diameter: number;
    box: number;
    tone?: "ink" | "faint" | "signal";
    ring?: number;
    className?: string;
}

const FILL = {
    ink: "fill-foreground",
    faint: "fill-grid",
    signal: "fill-signal",
};

const STROKE = {
    ink: "stroke-foreground",
    faint: "stroke-grid",
    signal: "stroke-signal",
};

/**
 * Single halftone dot or ring centred in a fixed square, the legend and loupe marks of the figures.
 *
 * @param diameter - Outer diameter of the dot or ring, in pixels
 * @param box - Side of the square the dot is centred in, in pixels, also the size of the svg
 * @param tone - Colour role of the dot: ink for a value, faint for a zero, signal for the
 *   highlighted one, ink by default
 * @param ring - Draws a hollow ring of this stroke width, in pixels, instead of a filled dot
 * @param className - Extra classes merged over the base style
 */
export function Swatch({ diameter, box, tone = "ink", ring, className }: SwatchProps) {
    return (
        <svg
            aria-hidden="true"
            width={box}
            height={box}
            viewBox={`0 0 ${box} ${box}`}
            className={cn("block flex-none", className)}
        >
            {ring ? (
                <circle
                    cx={box / 2}
                    cy={box / 2}
                    r={(diameter - ring) / 2}
                    fill="none"
                    strokeWidth={ring}
                    className={STROKE[tone]}
                />
            ) : (
                <circle cx={box / 2} cy={box / 2} r={diameter / 2} className={FILL[tone]} />
            )}
        </svg>
    );
}
