import { useTranslations } from "next-intl";

import { SommaireTrigger } from "@/components/header/sommaire";
import { Wordmark } from "@/components/header/wordmark";
import { LocaleSwitcher } from "@/components/locale";
import { ThemeToggle } from "@/components/theme";

const TAGLINE_CLASS = "m-0 min-w-0 max-w-[640px] text-[15px] leading-5 font-semibold text-balance";

/**
 * The first layer of the compact bar, the row of the masthead: the tagline on the left, then the
 * Sommaire button, the language switch and the theme toggle on the right, all as high as the
 * shared control height. On a phone the tagline moves under the wordmark (see Masthead) and the
 * controls line up on the left. The Sommaire button opens its sheet from this row, under the bar.
 */
export function MastheadRow() {
    const t = useTranslations("meta");

    return (
        <div className="mx-auto flex h-full max-w-[1280px] items-center gap-x-6 px-(--gutter)">
            <p className={`${TAGLINE_CLASS} max-[760px]:hidden`}>{t("tagline")}</p>
            <div className="ml-auto flex flex-none items-center gap-2 max-[760px]:ml-0">
                <SommaireTrigger origin="top" />
                <LocaleSwitcher />
                <ThemeToggle />
            </div>
        </div>
    );
}

/**
 * Top of the page: the halftone wordmark with 32 px of padding above and 16 px below, and on a
 * phone the tagline on its own line under a foreground rule. The row of controls that follows
 * lives in the compact bar (MastheadRow), which sticks once the masthead has scrolled away.
 */
export function Masthead() {
    const t = useTranslations("meta");

    return (
        <div id="masthead" className="relative z-35">
            <Wordmark />
            <div className="relative z-1 hidden border-t border-foreground bg-background max-[760px]:block">
                <div className="mx-auto max-w-[1280px] px-(--gutter) pt-4 pb-1.5">
                    <p className={TAGLINE_CLASS}>{t("tagline")}</p>
                </div>
            </div>
        </div>
    );
}
