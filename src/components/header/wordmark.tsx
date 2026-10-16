"use client";

import { useTranslations } from "next-intl";
import { type CSSProperties, useEffect } from "react";

import { useLens } from "@/hooks/useLens";
import {
    dotDelays,
    type DotKind,
    type HalftoneDot,
    round2,
    signalOf,
    WORD_FIELD,
    WORD_VIEW,
} from "@/lib/halftone";
import { MOTION } from "@/lib/motion";

const DOT_CLASS: Record<DotKind, string> = {
    ink: "wm-d fill-foreground",
    halo: "wm-d wm-h fill-foreground",
    grid: "wm-d wm-g fill-grid",
    sig: "wm-d wm-sig fill-signal",
};

const SIGNAL = signalOf(WORD_FIELD);

/**
 * Per-dot animation delays as CSS custom properties, read by the wordmark rules of globals.css.
 *
 * @param dot - Dot of the wordmark field
 * @returns Style object carrying --wm-idle and --wm-in in seconds
 */
function delayStyle(dot: HalftoneDot) {
    const delays = dotDelays(dot);

    return { "--wm-idle": `${delays.idle}s`, "--wm-in": `${delays.arrive}s` } as CSSProperties;
}

/**
 * The 36 x 9 halftone wordmark of the masthead, a link back to the top of the essay. All 324 dots
 * are circles rendered on the server: they grow in a diagonal wave on arrival, then the ink dots
 * ride a quiet idle wave (paused while the masthead is off screen or under the pointer, and absent
 * on a phone) around a breathing orange dot, and swell under the mouse through useLens. The halo
 * dots only play the arrival: their idle swing is a fraction of a pixel, and every extra animated
 * circle costs a style recalculation per frame. Fills follow the theme through classes; reduced
 * motion turns the animation, the transitions and the lens off.
 */
export function Wordmark() {
    const t = useTranslations("masthead");
    const ref = useLens<HTMLDivElement>({
        field: WORD_FIELD,
        width: WORD_VIEW.width,
        sigmaPx: MOTION.lens.sigmaPx.masthead,
    });

    useEffect(() => {
        const host = ref.current;
        if (!host || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(([entry]) => {
            host.dataset.paused = entry.isIntersecting ? "false" : "true";
        });

        observer.observe(host);

        return () => observer.disconnect();
    }, [ref]);

    return (
        <div ref={ref} className="wm wm-anim relative z-1 bg-background">
            <div className="mx-auto max-w-[1280px] px-(--gutter) pt-8 pb-4">
                <a href="#top" aria-label={t("home")} className="block text-foreground">
                    <svg
                        viewBox={`0 0 ${WORD_VIEW.width} ${WORD_VIEW.height}`}
                        aria-hidden="true"
                        className="block h-auto w-full"
                    >
                        {WORD_FIELD.map((dot, index) => (
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
                </a>
            </div>
        </div>
    );
}
