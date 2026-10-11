import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { pad2 } from "@/lib/format";

import { RailLayout } from "./RailLayout";

export interface ChapterProps {
    number: number;
    children: ReactNode;
}

/**
 * Section of a Part II chapter laid out on the rail grid; its header, prose, margin notes and
 * figures are placed in the grid by their own column classes.
 *
 * @param number - Chapter number, 5 to 15; gives the section id "ch-<number>" and the rail value
 * @param children - Header, paragraphs, margin notes, figures and closing band of the chapter
 */
export function Chapter({ number, children }: ChapterProps) {
    const t = useTranslations("part2.kit");

    return (
        <RailLayout
            id={`ch-${number}`}
            titleId={`ch${number}-t`}
            label={t("part")}
            value={pad2(number)}
            chapter={number}
        >
            {children}
        </RailLayout>
    );
}
