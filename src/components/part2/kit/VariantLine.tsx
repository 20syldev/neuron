"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { usePartTwo } from "./PartTwoProvider";

export interface VariantLineProps {
    frozen?: boolean;
}

/**
 * Right end of a light plate header: a dot, the sentence the plate was drawn for, and a "changer"
 * link back to the switch of chapter 5. A frozen plate states that its sentence is fixed.
 *
 * @param frozen - Frozen plates always show the "tired" sentence and have no link to change it; false by default
 */
export function VariantLine({ frozen = false }: VariantLineProps) {
    const t = useTranslations("part2.kit.variant");
    const { word } = usePartTwo();

    return (
        <>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
                <span
                    aria-hidden="true"
                    className={cn(
                        "size-1.5 rounded-full",
                        frozen ? "border border-muted-foreground" : "bg-signal",
                    )}
                />
                <span>
                    {frozen
                        ? t("frozen", { word: t("tired") })
                        : t.rich("sentence", {
                              word,
                              b: (chunks) => (
                                  <span className="font-semibold text-foreground">{chunks}</span>
                              ),
                          })}
                </span>
            </span>
            {frozen ? null : (
                <a
                    href="#ch-5"
                    aria-label={t("changeLabel")}
                    className="ml-1 px-2 py-3 font-mono text-[11px] text-signal-ink underline decoration-1 underline-offset-[3px] hover:decoration-2"
                >
                    {t("change")}
                </a>
            )}
        </>
    );
}
