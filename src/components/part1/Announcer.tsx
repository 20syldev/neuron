"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useConfidenceText } from "./confidence";
import { useDigit } from "./DigitProvider";

const SETTLE_MS = 700;

/**
 * Screen reader announcement of the prediction, in a polite live region. The text is only
 * published once the drawing has stopped changing it for a moment, so a stroke in progress does
 * not produce a flood of announcements.
 */
export function Announcer() {
    const t = useTranslations("part1.ch1");
    const { digit, confidence, empty, status } = useDigit();
    const percent = useConfidenceText(confidence, true);
    const [spoken, setSpoken] = useState("");

    let text = "";

    if (status === "error") {
        text = t("status.error");
    } else if (empty) {
        text = t("status.empty");
    } else if (digit !== null) {
        text = t("announce", { digit, percent });
    }

    useEffect(() => {
        const timer = window.setTimeout(() => setSpoken(text), SETTLE_MS);

        return () => window.clearTimeout(timer);
    }, [text]);

    return (
        <p role="status" aria-live="polite" className="sr-only">
            {spoken}
        </p>
    );
}
