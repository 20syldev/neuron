"use client";

import { useTranslations } from "next-intl";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

export type PartTwoVariant = "tired" | "wide";

export interface PartTwoContextValue {
    variant: PartTwoVariant;
    word: string;
    setVariant: (variant: PartTwoVariant) => void;
    isOpen: (id: string) => boolean;
    setOpen: (id: string, open: boolean) => void;
}

export interface PartTwoProviderProps {
    defaultVariant?: PartTwoVariant;
    children: ReactNode;
}

const DEFAULT_OPEN: Record<string, boolean> = { c7: true };

const PartTwoContext = createContext<PartTwoContextValue | null>(null);

/**
 * Holds the Part II state shared across chapters: the fatigue or large variant of the sentence,
 * set once in chapter 5 and followed by chapters 6 to 10, and the open state of every "Voir les
 * nombres" disclosure, keyed by figure id. Only the disclosure of chapter 7 starts open. The
 * context exposes the variant ("tired" or "wide", the only setting of Part II), its display word
 * in the active language, a setter for the variant, and an isOpen/setOpen pair for the disclosures.
 *
 * @param defaultVariant - Variant selected on first render, "tired" by default
 * @param children - Part II content that reads or sets the shared state
 */
export function PartTwoProvider({ defaultVariant = "tired", children }: PartTwoProviderProps) {
    const t = useTranslations("part2.kit.variant");
    const [variant, setVariant] = useState<PartTwoVariant>(defaultVariant);
    const [open, setOpenState] = useState<Record<string, boolean>>(DEFAULT_OPEN);

    const isOpen = useCallback((id: string) => open[id] === true, [open]);

    const setOpen = useCallback((id: string, next: boolean) => {
        setOpenState((current) => ({ ...current, [id]: next }));
    }, []);

    const value = useMemo(
        () => ({ variant, word: t(variant), setVariant, isOpen, setOpen }),
        [variant, t, isOpen, setOpen],
    );

    return <PartTwoContext.Provider value={value}>{children}</PartTwoContext.Provider>;
}

/**
 * Reads the shared Part II state.
 *
 * @returns The variant, its display word in the active language, setVariant, and the isOpen and setOpen pair of the disclosures
 * @throws When called outside a PartTwoProvider
 */
export function usePartTwo() {
    const context = useContext(PartTwoContext);

    if (!context) throw new Error("usePartTwo must be used inside a PartTwoProvider");

    return context;
}
