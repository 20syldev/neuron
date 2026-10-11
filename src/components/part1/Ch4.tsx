"use client";

import { useTranslations } from "next-intl";

import { Caption } from "./Caption";
import { Chapter } from "./Chapter";
import { useNeuron } from "./DigitProvider";
import { Inspector } from "./Inspector";
import { ASIDE, BODY, FIGURE } from "./layout";
import { Note } from "./Note";
import { Sup } from "./Sup";

/**
 * Caption of figure 4, which names the neuron being shown.
 */
function LiveCaption() {
    const t = useTranslations("part1.ch4");
    const { neuron } = useNeuron();

    return (
        <Caption number={4} className="mt-[26px]">
            {t("caption", { neuron })}
        </Caption>
    );
}

/**
 * Chapter 4, "What a neuron looks for": the paragraph, the margin note and the neuron
 * inspector, whose caption names the neuron being shown.
 */
export function Ch4() {
    const t = useTranslations("part1.ch4");

    return (
        <Chapter number={4}>
            <p className={BODY}>{t.rich("body", { sup: (chunks) => <Sup>{chunks}</Sup> })}</p>
            <div role="note" aria-label={t("noteLabel")} className={ASIDE}>
                <Note number={5}>{t("note")}</Note>
            </div>
            <figure className={FIGURE}>
                <Inspector />
                <LiveCaption />
            </figure>
        </Chapter>
    );
}
