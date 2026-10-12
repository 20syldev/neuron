"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";

import { cn } from "@/lib/utils";

const OPTIONS = [false, true] as const;

interface Ch12SwitchProps {
    withPosition: boolean;
    onChange: (withPosition: boolean) => void;
}

/**
 * Local switch of the plate of chapter 12: two real buttons, "without" and "with" position marker,
 * that expose their state with aria-pressed. It is not tied to the sentence variant of the other
 * chapters. The visible label disappears under 560 px, where the two buttons share the full width,
 * but it stays the accessible name of the group.
 *
 * @param withPosition - True when the position marker is on, false when only the words count
 * @param onChange - Called with the new state when the reader presses the button of the other state
 * @returns The labelled group of two toggle buttons
 */
export function Ch12Switch({ withPosition, onChange }: Ch12SwitchProps) {
    const t = useTranslations("part2.ch12.switch");
    const labelId = useId();

    return (
        <div className="mb-5 flex flex-wrap items-center gap-x-3.5 gap-y-2 max-[561px]:mb-4">
            <span
                id={labelId}
                className="m-0 font-mono text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase max-[561px]:hidden"
            >
                {t("label")}
            </span>
            <div
                role="group"
                aria-labelledby={labelId}
                className="inline-flex gap-0.5 rounded-[3px] border border-border-strong p-0.5 max-[561px]:flex max-[561px]:w-full"
            >
                {OPTIONS.map((option) => (
                    <button
                        key={String(option)}
                        type="button"
                        aria-pressed={withPosition === option}
                        onClick={() => onChange(option)}
                        className={cn(
                            "inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[2px] border-0 px-3.5 py-1 text-center font-mono text-xs leading-tight tracking-[0.02em] max-[561px]:flex-1 max-[561px]:px-2 max-[361px]:px-1 max-[361px]:text-[11px] max-[361px]:tracking-normal",
                            "aria-[pressed=false]:bg-transparent aria-[pressed=false]:font-medium aria-[pressed=false]:text-muted-foreground aria-[pressed=false]:hover:bg-muted aria-[pressed=false]:hover:text-foreground",
                            "aria-[pressed=true]:bg-foreground aria-[pressed=true]:font-semibold aria-[pressed=true]:text-background",
                        )}
                    >
                        {t(option ? "on" : "off")}
                    </button>
                ))}
            </div>
        </div>
    );
}
