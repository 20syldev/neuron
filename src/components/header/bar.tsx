import { Mark } from "@/components/header/mark";
import { MastheadRow } from "@/components/header/masthead";
import { LocaleSwitcher } from "@/components/locale";
import { ThemeToggle } from "@/components/theme";

/**
 * Full-width sticky bar under the masthead, as high as --bar-height with a bottom border. It
 * stacks two layers cross-faded by the page scroll (rules "Header scroll cross-fade" of
 * globals.css): the masthead row first, then the compact tools, which are the square "n" mark on
 * the left and the language switch and theme toggle on the right, inside the 1280 px container
 * and its shared gutter. Without scroll-driven animations only the compact tools show. It is a
 * header element so that the Sommaire sheet knows which bar to hang under.
 */
export function Bar() {
    return (
        <header className="sticky top-0 z-30 h-(--bar-height) border-b border-border bg-background">
            <div className="hd-strip absolute inset-0 border-t border-foreground max-[760px]:border-t-0">
                <MastheadRow />
            </div>
            <div className="hd-tools absolute inset-0">
                <div className="mx-auto flex h-full max-w-[1280px] items-center gap-x-[18px] px-(--gutter) max-[760px]:gap-x-3">
                    <Mark />
                    <span aria-hidden="true" className="min-w-3 flex-[1_1_12px]" />
                    <div className="flex flex-none items-center gap-1.5">
                        <LocaleSwitcher />
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}
