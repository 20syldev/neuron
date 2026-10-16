"use client";

import { useTranslations } from "next-intl";

import { useLens } from "@/hooks/useLens";
import { type DotKind, MARK_FIELD, MARK_VIEW, round2, signalOf, WM } from "@/lib/halftone";
import { MOTION } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface MarkProps {
    className?: string;
}

const DOT_CLASS: Record<DotKind, string> = {
    ink: "wm-d fill-foreground",
    halo: "wm-d fill-foreground",
    grid: "wm-d fill-grid",
    sig: "wm-d mk-sig fill-signal",
};

const SIGNAL = signalOf(MARK_FIELD);

/**
 * The square 5 x 5 halftone "n" of the compact bar, a link back to the top of the essay. It uses
 * the field grammar of the wordmark in a 7 x 7 cell field, drawn 32 px wide (28 px on a phone)
 * inside a 40 x 44 px hit area, with the same lens at a smaller spread. At rest only the orange
 * dot moves, it breathes inside a ring; there is no arrival and no idle wave.
 *
 * @param className - Extra classes merged onto the link, such as a margin override for the layout
 */
export function Mark({ className }: MarkProps) {
    const t = useTranslations("masthead");
    const ref = useLens<HTMLAnchorElement>({
        field: MARK_FIELD,
        width: MARK_VIEW.width,
        sigmaPx: MOTION.lens.sigmaPx.compact,
        sigBoost: WM.sigSmall,
    });

    return (
        <a
            ref={ref}
            href="#top"
            aria-label={t("home")}
            className={cn(
                "wm -ml-[5px] box-border flex h-11 w-10 flex-none items-center justify-center text-foreground max-[760px]:-ml-2",
                className,
            )}
        >
            <svg
                viewBox={`0 0 ${MARK_VIEW.width} ${MARK_VIEW.height}`}
                aria-hidden="true"
                className="block size-8 overflow-visible max-[760px]:size-7"
            >
                {MARK_FIELD.map((dot, index) => (
                    <circle
                        key={index}
                        data-dot=""
                        cx={round2(dot.x)}
                        cy={round2(dot.y)}
                        r={round2(dot.kind === "sig" ? dot.r * WM.sigSmall : dot.r)}
                        className={DOT_CLASS[dot.kind]}
                    />
                ))}
                <circle
                    cx={round2(SIGNAL.x)}
                    cy={round2(SIGNAL.y)}
                    r={round2(SIGNAL.r * WM.sigSmall)}
                    strokeWidth={1.4}
                    className="wm-ring mk-ring fill-none stroke-signal"
                />
            </svg>
        </a>
    );
}
