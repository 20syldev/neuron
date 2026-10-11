import { type CSSProperties } from "react";

import { round2 } from "@/lib/figures";
import { cn } from "@/lib/utils";

const TAILS = {
    epilogue: {
        count: 32,
        base: 2,
        amplitude: 30,
        decay: 4.5,
        rowClassName: "h-[34px]",
        lastClassName: "bg-signal",
    },
    footer: {
        count: 40,
        base: 1.6,
        amplitude: 6.4,
        decay: 5.5,
        rowClassName: "h-3",
        lastClassName: "bg-foreground",
    },
} as const;

export type TailKind = keyof typeof TAILS;

/**
 * Diameters of the dots of a softmax tail: a small floor plus an exponential that makes the
 * last dot the largest, as the weight of one word dominates the many thin ones.
 *
 * @param kind - Which tail to compute, the epilogue one or the footer one
 * @returns One diameter in px per dot, rounded to the hundredth
 */
function diameters(kind: TailKind) {
    const { count, base, amplitude, decay } = TAILS[kind];

    return Array.from({ length: count }, (_, index) =>
        round2(base + amplitude * Math.exp((index - (count - 1)) / decay)),
    );
}

const DIAMETERS: Record<TailKind, number[]> = {
    epilogue: diameters("epilogue"),
    footer: diameters("footer"),
};

export interface EpilogueTailProps {
    kind: TailKind;
    className?: string;
}

/**
 * Decorative row of dots that grow toward the right until one dot stands out, the shape of a
 * softmax tail. The row is hidden from assistive technology.
 *
 * @param kind - Which tail to draw: "epilogue" is the tall one above the epilogue headline, ending in the signal dot of "il"; "footer" is the thin divider of the footer, ending in an ink dot
 * @param className - Extra classes, such as the grid column of the tail
 */
export function EpilogueTail({ kind, className }: EpilogueTailProps) {
    const config = TAILS[kind];
    const sizes = DIAMETERS[kind];

    return (
        <div
            aria-hidden="true"
            className={cn("flex items-center justify-between", config.rowClassName, className)}
        >
            {sizes.map((size, index) => (
                <span
                    key={index}
                    className={cn(
                        "block size-(--dot) flex-none rounded-full",
                        index === sizes.length - 1 ? config.lastClassName : "bg-muted-foreground",
                    )}
                    style={{ "--dot": `${size}px` } as CSSProperties}
                />
            ))}
        </div>
    );
}
