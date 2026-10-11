"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

import { type AppLocale, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export interface LocaleSwitcherProps {
    className?: string;
}

/**
 * Saves the locale choice and moves to that locale's root, keeping the query string and the hash
 * so the reader stays on the same section. The default locale lives at "/", the others under
 * "/<locale>/"; each is its own root layout, so switching is a full navigation. Saving is best
 * effort: storage can be blocked.
 *
 * @param next - Locale to switch to
 */
function switchTo(next: AppLocale) {
    try {
        window.localStorage.setItem("locale", next);
    } catch {}

    const prefix = next === routing.defaultLocale ? "/" : `/${next}/`;
    window.location.href = prefix + window.location.search + window.location.hash;
}

/**
 * Segmented FR / EN control. The group is as high as the shared control height, its segments are
 * 6 px shorter so the 2 px padding and the border frame them; on a phone they are 40 px square, the
 * minimum touch target, inside a 1 px padding. Alt+L cycles to the next locale
 * from anywhere on the page, using the physical key so it works on any keyboard layout.
 *
 * @param className - Extra classes merged onto the group, such as a visibility override per layout
 */
export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
    const t = useTranslations("header.language");
    const locale = useLocale();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (!event.altKey || event.code !== "KeyL" || event.defaultPrevented) return;

            event.preventDefault();
            const index = routing.locales.indexOf(locale as AppLocale);
            switchTo(routing.locales[(index + 1) % routing.locales.length]);
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [locale]);

    return (
        <div
            role="group"
            aria-label={t("label")}
            className={cn(
                "box-border inline-flex h-(--control) flex-none items-center gap-0.5 rounded-[3px] border border-border bg-card p-0.5 max-[760px]:gap-px max-[760px]:p-px",
                className,
            )}
        >
            {(["fr", "en"] as const).map((code) => (
                <button
                    key={code}
                    type="button"
                    lang={code}
                    aria-label={t(code)}
                    aria-pressed={locale === code}
                    onClick={() => locale !== code && switchTo(code)}
                    className="inline-flex h-[calc(var(--control)-6px)] min-w-[calc(var(--control)-6px)] cursor-pointer items-center justify-center rounded-[2px] border-0 px-1.5 max-[760px]:h-10 max-[760px]:min-w-10 font-mono text-[11.5px] leading-none font-medium tracking-[0.06em] text-muted-foreground uppercase hover:bg-muted hover:text-foreground aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:hover:bg-foreground aria-pressed:hover:text-background"
                >
                    {code}
                </button>
            ))}
        </div>
    );
}
