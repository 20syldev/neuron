"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Collapsible } from "radix-ui";
import { type ReactNode } from "react";

import { usePartTwo } from "./PartTwoProvider";

export interface DisclosureProps {
    id: string;
    children: ReactNode;
}

/**
 * "Voir les nombres" disclosure under a figure caption: a Radix Collapsible whose open state is
 * held by the Part II provider, so it survives re-renders and can be defaulted open.
 *
 * @param id - Figure key in the shared state, such as "c7"; the same key always opens the same panel
 * @param children - Numbers behind the figure, usually a Facts grid
 */
export function Disclosure({ id, children }: DisclosureProps) {
    const t = useTranslations("part2.kit.numbers");
    const { isOpen, setOpen } = usePartTwo();

    return (
        <Collapsible.Root open={isOpen(id)} onOpenChange={(open) => setOpen(id, open)}>
            <Collapsible.Trigger className="group mt-3.5 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-[3px] border border-border-strong bg-transparent pr-3.5 pl-[11px] font-mono text-xs font-medium tracking-[0.02em] text-foreground hover:border-foreground hover:bg-muted">
                <ChevronRight
                    aria-hidden="true"
                    size={14}
                    strokeWidth={2}
                    className="flex-none transition-transform duration-150 ease-out group-data-[state=open]:rotate-90 motion-reduce:transition-none"
                />
                <span>{t("show")}</span>
            </Collapsible.Trigger>
            <Collapsible.Content className="mt-3.5 border-t border-foreground pt-4">
                {children}
            </Collapsible.Content>
        </Collapsible.Root>
    );
}
