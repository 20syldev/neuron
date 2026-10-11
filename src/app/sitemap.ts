import { type MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { pathOf, SITE_URL } from "@/lib/metadata";

export const dynamic = "force-static";

/**
 * Sitemap of the static export: one entry per locale home page, each listing the language
 * alternates of the whole set, plus x-default on the default locale as the page metadata does, so
 * search engines pair the translations.
 *
 * @returns The sitemap entries, with absolute URLs
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const languages = {
        ...Object.fromEntries(
            routing.locales.map((locale) => [locale, `${SITE_URL}${pathOf(locale)}`]),
        ),
        "x-default": `${SITE_URL}${pathOf(routing.defaultLocale)}`,
    };

    return routing.locales.map((locale) => ({
        url: `${SITE_URL}${pathOf(locale)}`,
        alternates: { languages },
    }));
}
