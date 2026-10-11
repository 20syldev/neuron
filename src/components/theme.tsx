"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
    className?: string;
}

/**
 * Subscribes to nothing: it only lets useSyncExternalStore tell the server render (false) from
 * the client one (true), which avoids a hydration mismatch on the theme-dependent icon.
 *
 * @returns A function that unsubscribes, which does nothing
 */
function subscribe() {
    return () => {};
}

/**
 * Square button that flips between light and dark. It shows a moon in light mode and a sun in
 * dark mode, and renders the moon until mounted because the resolved theme is unknown on the
 * server. The accessible name stays "toggle theme", it does not describe the state.
 *
 * @param className - Extra classes merged onto the button, such as a visibility override per layout
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
    const t = useTranslations("header.theme");
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
    const dark = mounted && resolvedTheme === "dark";
    const Icon = dark ? Sun : Moon;

    return (
        <button
            type="button"
            aria-label={t("toggle")}
            onClick={() => setTheme(dark ? "light" : "dark")}
            className={cn(
                "inline-flex size-(--control) flex-none cursor-pointer items-center justify-center rounded-[3px] border border-border bg-card p-0 text-foreground hover:border-border-strong hover:bg-muted",
                className,
            )}
        >
            <Icon className="size-[17px]" aria-hidden="true" />
        </button>
    );
}
