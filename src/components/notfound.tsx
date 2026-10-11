"use client";

import { useEffect, useSyncExternalStore } from "react";

import { Missing } from "@/components/Missing";
import { Button } from "@/components/ui/button";
import { type AppLocale, routing } from "@/i18n/routing";

export interface NotFoundCopy {
    title: string;
    description: string;
    back: string;
}

export interface NotFoundProps {
    copy: Record<AppLocale, NotFoundCopy>;
}

/**
 * Subscription of the locale store: the 404 document never navigates, so nothing is observed.
 *
 * @returns A no-op unsubscribe function
 */
function subscribe() {
    return () => {};
}

/**
 * Reads the locale from the first path segment when it is a known prefix, the default locale
 * being served unprefixed.
 *
 * @returns The locale of the current URL
 */
function getLocale(): AppLocale {
    const segment = window.location.pathname.split("/")[1];

    return (routing.locales as readonly string[]).includes(segment)
        ? (segment as AppLocale)
        : routing.defaultLocale;
}

/**
 * Locale used to render the server HTML, which is always the default one.
 *
 * @returns The default locale
 */
function getServerLocale(): AppLocale {
    return routing.defaultLocale;
}

/**
 * Standalone 404 page. A static export serves a single 404 document for every path, so it cannot
 * know its locale at build time: it resolves it on the client from the URL prefix and picks the
 * matching copy, falling back to the default locale at the root.
 *
 * @param copy - Translated copy of every locale, since the locale is only known in the browser. Each
 *   entry holds the page heading, one sentence explaining the situation and the label of the link
 *   back to the home page
 */
export function NotFound({ copy }: NotFoundProps) {
    const locale = useSyncExternalStore(subscribe, getLocale, getServerLocale);

    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    const t = copy[locale];
    const home = locale === routing.defaultLocale ? "/" : `/${locale}/`;

    return (
        <main className="flex min-h-svh flex-col items-center justify-center gap-8 px-(--gutter) text-center">
            <Missing />
            <div className="flex max-w-md flex-col gap-3">
                <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    {t.title}
                </h1>
                <p className="text-balance text-muted-foreground">{t.description}</p>
            </div>
            <Button asChild size="lg">
                <a href={home}>{t.back}</a>
            </Button>
        </main>
    );
}
