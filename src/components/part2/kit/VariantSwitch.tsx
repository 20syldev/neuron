"use client";

import { cva } from "class-variance-authority";
import { useTranslations } from "next-intl";
import { type ReactNode, useId } from "react";

import { type PartTwoVariant, usePartTwo } from "./PartTwoProvider";

const OPTIONS: PartTwoVariant[] = ["tired", "wide"];

const groupVariants = cva("inline-flex border border-border-strong", {
    variants: {
        size: {
            large: "gap-1 rounded-[4px] p-1",
            compact: "gap-0.5 rounded-[3px] p-0.5",
        },
    },
});

const segmentVariants = cva(
    "inline-flex cursor-pointer items-center rounded-[2px] border-0 leading-none aria-[pressed=false]:bg-transparent aria-[pressed=false]:font-medium aria-[pressed=false]:text-muted-foreground aria-[pressed=false]:hover:bg-muted aria-[pressed=false]:hover:text-foreground aria-[pressed=true]:bg-foreground aria-[pressed=true]:font-semibold aria-[pressed=true]:text-background",
    {
        variants: {
            size: {
                large: "h-[46px] px-5 font-display text-[21px] tracking-[-0.01em]",
                compact: "h-7 px-[11px] font-mono text-xs tracking-[0.02em] max-[561px]:h-10",
            },
        },
    },
);

export interface VariantSwitchProps {
    size?: "large" | "compact";
    hint?: ReactNode;
}

/**
 * Switch of the last word of the sentence, "tired" or "wide": two buttons that expose their
 * state with aria-pressed and set the variant shared by chapters 6 to 10 through the provider.
 * The compact form hides its label under 560 px but keeps it as the accessible name.
 *
 * @param size - "large" is the block of chapter 5 (label, hint, big segments); "compact" (default) is the small switch of the plate headers of chapters 6, 9 and 10
 * @param hint - Sentence under the label of the large switch, explaining what the setting drives; ignored by the compact switch
 */
export function VariantSwitch({ size = "compact", hint }: VariantSwitchProps) {
    const t = useTranslations("part2.kit");
    const { variant, setVariant } = usePartTwo();
    const labelId = useId();
    const large = size === "large";

    const group = (
        <div role="group" aria-labelledby={labelId} className={groupVariants({ size })}>
            {OPTIONS.map((option) => (
                <button
                    key={option}
                    type="button"
                    aria-pressed={variant === option}
                    onClick={() => setVariant(option)}
                    className={segmentVariants({ size })}
                >
                    {t(`variant.${option}`)}
                </button>
            ))}
        </div>
    );

    if (large) {
        return (
            <div className="mt-[30px] flex flex-wrap items-center justify-between gap-x-7 gap-y-4 border-t border-border pt-5">
                <div>
                    <p
                        id={labelId}
                        className="m-0 font-mono text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase"
                    >
                        {t("switch.sentence")}
                    </p>
                    {hint ? (
                        <p className="mt-1.5 mb-0 text-[13px] text-pretty text-muted-foreground">
                            {hint}
                        </p>
                    ) : null}
                </div>
                {group}
            </div>
        );
    }

    return (
        <span className="inline-flex items-center gap-2.5">
            <span
                id={labelId}
                className="m-0 font-mono text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase max-[561px]:hidden"
            >
                {t("switch.short")}
            </span>
            {group}
        </span>
    );
}
