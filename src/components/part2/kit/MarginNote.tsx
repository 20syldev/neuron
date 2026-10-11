import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Label } from "./Label";
import { NOTE_COLUMN } from "./layout";

export interface MarginNoteProps {
    label?: string;
    className?: string;
    children: ReactNode;
}

/**
 * Note in the margin column, level with the paragraph before it; under 1101 px it drops below
 * that paragraph with a narrower measure.
 *
 * @param label - Title of the note, "Note" in the active language when omitted
 * @param className - Extra classes merged over the base style
 * @param children - Note text, kept short
 */
export function MarginNote({ label, className, children }: MarginNoteProps) {
    const t = useTranslations("part2.kit");

    return (
        <div
            role="note"
            className={cn(
                NOTE_COLUMN,
                "mt-1.5 mb-[26px] border-t border-border-strong pt-[9px] text-[13px] leading-[1.55] text-muted-foreground max-[1101px]:mt-2 max-[1101px]:max-w-[690px]",
                className,
            )}
        >
            <Label as="span" className="block">
                {label ?? t("note")}
            </Label>
            {children}
        </div>
    );
}
