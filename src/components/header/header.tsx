import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { Bar } from "@/components/header/bar";
import { MastheadGauge } from "@/components/header/gauge";
import { Masthead } from "@/components/header/masthead";
import { Pill } from "@/components/header/pill";
import { SommaireProvider, SommaireSheet } from "@/components/header/sommaire";
import { SECTION_IDS } from "@/data/chapters";

export interface HeaderProps {
    children: ReactNode;
}

/**
 * Header system of the page: the masthead at the top, the compact bar that sticks under it, the
 * page content, then the floating pill and the Sommaire sheet, all inside SommaireProvider. The
 * wrapper is the "top" anchor targeted by the wordmark and the mark, and it carries the --mh
 * custom property (masthead height) that times the scroll cross-fade of the bar, measured on the
 * rendered masthead by MastheadGauge. A skip link, hidden until it takes focus, comes first in the
 * tab order and jumps over the masthead controls to the prologue.
 *
 * @param children - Content of the page that follows the masthead and the bar, rendered in the same
 *   box so the bar can stick and the pill can float over the whole essay
 */
export function Header({ children }: HeaderProps) {
    const t = useTranslations("header");

    return (
        <SommaireProvider>
            <div id="top" className="hd-root">
                <a
                    href={`#${SECTION_IDS.prologue}`}
                    className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-60 focus-visible:rounded-[3px] focus-visible:bg-foreground focus-visible:px-4 focus-visible:py-2.5 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-background"
                >
                    {t("skip")}
                </a>
                <MastheadGauge />
                <Masthead />
                <Bar />
                {children}
                <Pill />
            </div>
            <SommaireSheet />
        </SommaireProvider>
    );
}
