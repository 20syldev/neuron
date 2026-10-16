"use client";

import { useTranslations } from "next-intl";

import { useConfidenceText } from "./confidence";
import { CropMarks } from "./CropMarks";
import { useDigit } from "./DigitProvider";
import { Dimension } from "./Dimension";
import { SCALES } from "./halftone";
import { InkField } from "./InkField";
import { DISPLAY } from "./layout";
import { INPUT_SIDE } from "./network";

/**
 * Output line under the opener poster: the predicted digit with its confidence, or the reason
 * why there is none yet.
 */
function OutputLine() {
    const t = useTranslations("part1.opener.output");
    const { digit, confidence, status, empty } = useDigit();
    const percent = useConfidenceText(confidence);

    let text = t("digit", { digit: digit ?? 0, percent });

    if (status === "error") {
        text = t("error");
    } else if (empty) {
        text = t("empty");
    } else if (digit === null) {
        text = t("loading");
    }

    return (
        <span className="inline-flex items-center gap-[7px] font-medium text-signal-ink">
            <span aria-hidden="true" className="size-[7px] rounded-full bg-signal" />
            {text}
        </span>
    );
}

/**
 * Live 28 x 28 halftone of the drawing, the poster of the part.
 */
function Poster() {
    const t = useTranslations("part1.opener");
    const { input } = useDigit();

    return (
        <InkField values={input} side={INPUT_SIDE} scale={SCALES.poster} label={t("posterLabel")} />
    );
}

/**
 * Opening of Part I: the rule with the part and chapter range, the giant numeral with the part
 * title, and the live 28 x 28 halftone of the drawing as the poster of the part, with its
 * dimension line and input and output readout.
 */
export function Opener() {
    const t = useTranslations("part1.opener");

    return (
        <section
            id="part-1"
            aria-labelledby="part-1-t"
            className="mx-auto w-full max-w-[1280px] px-(--gutter) pt-[168px] -scroll-mt-42 max-[760px]:pt-22 max-[760px]:-scroll-mt-22"
        >
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-foreground pb-3 font-mono text-[11px] leading-4 font-medium tracking-[0.14em] text-muted-foreground uppercase">
                <span>{t("label")}</span>
                <span>{t("range")}</span>
            </div>
            <div className="mt-14 flex flex-wrap items-end justify-between gap-x-16 gap-y-14">
                <div className="min-w-0 flex-[1_1_420px]">
                    <p
                        aria-hidden="true"
                        className={`${DISPLAY} m-0 text-[clamp(200px,28vw,360px)] leading-[0.74] font-semibold tracking-[-0.018em]`}
                    >
                        I
                    </p>
                    <h2
                        id="part-1-t"
                        className={`${DISPLAY} mt-[30px] mb-0 text-[clamp(76px,10vw,128px)] leading-[0.9] font-semibold tracking-[-0.018em] text-balance`}
                    >
                        <span className="sr-only">{t("srTitle")}</span>
                        {t("title")}
                    </h2>
                    <p className="mt-[22px] mb-0 text-[22px] leading-[1.4] text-muted-foreground">
                        {t("subtitle")}
                    </p>
                </div>
                <figure className="m-0 w-[476px] max-w-full flex-none">
                    <div className="relative">
                        <Poster />
                        <CropMarks />
                    </div>
                    <Dimension label={t("dimension")} className="mt-[26px]" />
                    <figcaption className="mt-3.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5 font-mono text-[11px] leading-4 text-muted-foreground">
                        <span>{t("input")}</span>
                        <OutputLine />
                    </figcaption>
                </figure>
            </div>
        </section>
    );
}
