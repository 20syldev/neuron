import { type CSSProperties } from "react";

import { cn } from "@/lib/utils";

export interface HingeDot {
    size: number;
    tone: "muted" | "ink" | "signal" | "tick";
}

const FIXED_DOTS = 28;

const TAIL_DOTS = 28;

const TONES = {
    muted: "bg-muted-foreground",
    ink: "bg-foreground",
    signal: "bg-signal",
    tick: "bg-border-strong",
};

/**
 * Builds the dots of the hinge: an even row for the fixed gaze of the perceptron, a tick, then a
 * tail whose dots grow like a softmax into the signal dot of attention. Each dot has a diameter in
 * pixels, 0 for the tick, and a colour role.
 *
 * @returns The 57 dots, in reading order
 */
function buildDots(): HingeDot[] {
    const dots: HingeDot[] = [];

    for (let i = 0; i < FIXED_DOTS; i++) {
        dots.push({ size: 3, tone: "muted" });
    }

    dots.push({ size: 0, tone: "tick" });

    for (let i = 0; i < TAIL_DOTS; i++) {
        const last = i === TAIL_DOTS - 1;
        const size = last ? 14 : 3 + 9 * Math.exp((i - 26) / 4.2);

        dots.push({ size, tone: last ? "signal" : i > 23 ? "ink" : "muted" });
    }

    return dots;
}

const DOTS = buildDots();

/**
 * Decorative row between the two parts of the essay: even dots, a tick, then dots that swell into
 * one orange dot.
 */
export function Hinge() {
    return (
        <div aria-hidden="true" className="flex h-4 items-center justify-between">
            {DOTS.map((dot, index) => (
                <span
                    key={index}
                    style={{ "--d": `${Math.round(dot.size * 100) / 100}px` } as CSSProperties}
                    className={cn(
                        "block flex-none",
                        TONES[dot.tone],
                        dot.tone === "tick" ? "h-4 w-px" : "size-(--d) rounded-full",
                    )}
                />
            ))}
        </div>
    );
}
