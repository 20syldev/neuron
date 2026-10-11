"use client";

import { type CSSProperties } from "react";

import { useLens } from "@/hooks/useLens";
import {
    dotDelays,
    type DotKind,
    type HalftoneDot,
    LOST_FIELD,
    LOST_VIEW,
    round2,
    signalOf,
} from "@/lib/halftone";
import { MOTION } from "@/lib/motion";

const DOT_CLASS: Record<DotKind, string> = {
    ink: "wm-d fill-foreground",
    halo: "wm-d fill-foreground",
    grid: "wm-d wm-g fill-grid",
    sig: "wm-d wm-sig fill-signal",
};

const SIGNAL = signalOf(LOST_FIELD);

/**
 * Per-dot animation delays as CSS custom properties, read by the wordmark rules of globals.css.
 *
 * @param dot - Dot of the 404 field
 * @returns Style object carrying --wm-idle and --wm-in in seconds
 */
function delayStyle(dot: HalftoneDot) {
    const delays = dotDelays(dot);

    return { "--wm-idle": `${delays.idle}s`, "--wm-in": `${delays.arrive}s` } as CSSProperties;
}

/**
 * The halftone "404" of the not found page, drawn with the grammar of the masthead wordmark: bold
 * ink dots with halos, faint grid dots and the orange dot in the counter of the zero. It grows in
 * a diagonal wave on arrival, breathes quietly afterwards and swells under the pointer, all of it
 * switched off by reduced motion. It is decorative: the heading carries the meaning.
 */
export function Missing() {
    const ref = useLens<HTMLDivElement>({
        field: LOST_FIELD,
        width: LOST_VIEW.width,
        sigmaPx: MOTION.lens.sigmaPx.masthead / 2,
    });

    return (
        <div ref={ref} aria-hidden="true" className="wm wm-anim w-full max-w-[520px]">
            <svg
                viewBox={`0 0 ${LOST_VIEW.width} ${LOST_VIEW.height}`}
                className="block h-auto w-full text-foreground"
            >
                {LOST_FIELD.map((dot, index) => (
                    <circle
                        key={index}
                        data-dot=""
                        cx={round2(dot.x)}
                        cy={round2(dot.y)}
                        r={round2(dot.r)}
                        className={DOT_CLASS[dot.kind]}
                        style={delayStyle(dot)}
                    />
                ))}
                <circle
                    cx={round2(SIGNAL.x)}
                    cy={round2(SIGNAL.y)}
                    r={round2(SIGNAL.r)}
                    strokeWidth={0.7}
                    className="wm-ring fill-none stroke-signal"
                />
            </svg>
        </div>
    );
}
