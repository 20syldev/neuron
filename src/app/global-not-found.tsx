import { type Metadata } from "next";
import { getMessages, setRequestLocale } from "next-intl/server";

import { NotFound, type NotFoundCopy } from "@/components/notfound";
import { Shell } from "@/components/shell";
import { type AppLocale, routing } from "@/i18n/routing";

export const metadata: Metadata = {
    title: "404 : neuron",
};

/**
 * Global 404 for any unmatched route. Each locale lives in its own route group with its own root
 * layout, so there is no layout to wrap this page: it owns the whole document through the Shell,
 * and Next skips its default layout (experimental.globalNotFound).
 *
 * A static export serves one 404 document for every path, so it is rendered in the default locale
 * and hands the client the copy of every locale to choose from by URL. The copy map is built from
 * routing.locales, so a new locale only needs its messages/<locale>/notfound.json file.
 */
export default async function GlobalNotFound() {
    setRequestLocale(routing.defaultLocale);
    const messages = await getMessages({ locale: routing.defaultLocale });
    const entries = await Promise.all(
        routing.locales.map(
            async (locale) =>
                [locale, (await import(`../../messages/${locale}/notfound.json`)).default] as [
                    AppLocale,
                    NotFoundCopy,
                ],
        ),
    );
    const copy = Object.fromEntries(entries) as Record<AppLocale, NotFoundCopy>;

    return (
        <Shell locale={routing.defaultLocale} messages={messages}>
            <NotFound copy={copy} />
        </Shell>
    );
}
