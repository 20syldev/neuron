"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { Announcer } from "./Announcer";
import { useConfidenceText } from "./confidence";
import { useDigit } from "./DigitProvider";
import { Eyebrow } from "./Eyebrow";
import { DISPLAY } from "./layout";
import { Probabilities } from "./Probabilities";

/**
 * The predicted digit in giant orange type with the confidence of the network next to it. The
 * slot of the confidence also carries the loading, error and empty pad states, so the layout
 * never jumps.
 */
function Readout() {
    const t = useTranslations("part1.ch1");
    const { digit, confidence, status, empty } = useDigit();
    const percent = useConfidenceText(confidence);
    const showDigit = digit !== null;

    let note = "";

    if (status === "error") {
        note = t("status.error");
    } else if (empty) {
        note = t("status.empty");
    } else if (!showDigit) {
        note = t("status.loading");
    }

    return (
        <div className="flex flex-wrap items-end gap-x-7 gap-y-4">
            <p
                aria-hidden="true"
                className={cn(
                    DISPLAY,
                    "m-0 text-[224px] leading-[0.76] font-semibold tracking-[-0.018em] max-[760px]:text-[168px]",
                    showDigit ? "text-signal" : "text-muted-foreground/70",
                )}
            >
                {showDigit ? digit : "?"}
            </p>
            <div className="flex max-w-[15rem] min-w-0 flex-col gap-1.5 pb-1">
                <span className="font-mono text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                    {t("confidence")}
                </span>
                {note ? (
                    <span
                        role={status === "error" ? "alert" : undefined}
                        className={cn(
                            "text-[13px] leading-[1.4]",
                            status === "error" ? "text-destructive" : "text-muted-foreground",
                        )}
                    >
                        {note}
                    </span>
                ) : (
                    <span className="font-mono text-[28px] leading-none font-medium tracking-[-0.03em]">
                        {percent}
                    </span>
                )}
            </div>
        </div>
    );
}

/**
 * Right half of the chapter 1 figure: the prediction readout, the ten output probabilities and the
 * screen reader announcement.
 */
export function Prediction() {
    const t = useTranslations("part1.ch1");

    return (
        <div className="min-w-0 flex-[1_1_320px]">
            <div className="mb-7 flex items-center gap-3">
                <Eyebrow as="span">{t("prediction")}</Eyebrow>
                <span aria-hidden="true" className="h-px flex-[1_1_0] bg-border" />
            </div>
            <Readout />
            <Probabilities />
            <Announcer />
        </div>
    );
}
