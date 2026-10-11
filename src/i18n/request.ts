import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

// Message files merged into one object, the Part II files sharing the "part2" key.
const MESSAGE_FILES = [
    "meta",
    "header",
    "masthead",
    "prologue",
    "part1",
    "interlude",
    "part2kit",
    "part2a",
    "part2b",
    "part2c",
    "part2d",
    "epilogue",
    "footer",
    "notfound",
    "common",
] as const;

const NAMESPACE_OF: Partial<Record<(typeof MESSAGE_FILES)[number], string>> = {
    part2kit: "part2",
    part2a: "part2",
    part2b: "part2",
    part2c: "part2",
    part2d: "part2",
};

/**
 * Loads one message file of a locale; a missing file yields an empty object so that adding a
 * namespace never breaks the build.
 *
 * @param locale - Locale folder under messages/
 * @param file - File name without extension, one of MESSAGE_FILES
 * @returns The parsed JSON object, or an empty object when the file does not exist
 */
async function loadFile(locale: string, file: string): Promise<Record<string, unknown>> {
    try {
        return (await import(`../../messages/${locale}/${file}.json`)).default;
    } catch {
        return {};
    }
}

/**
 * Builds the single messages object of a locale, keyed by namespace name.
 *
 * @param locale - Locale folder under messages/
 * @returns Messages where each file contributes the keys of its namespace
 */
async function loadMessages(locale: string) {
    const files = await Promise.all(MESSAGE_FILES.map((file) => loadFile(locale, file)));
    const messages: Record<string, Record<string, unknown>> = {};

    MESSAGE_FILES.forEach((file, index) => {
        const namespace = NAMESPACE_OF[file] ?? file;
        messages[namespace] = { ...messages[namespace], ...files[index] };
    });

    return messages;
}

/**
 * Per-request next-intl configuration: resolves the active locale, falling back to the default
 * one, and loads its merged messages.
 *
 * @param params - Request context of next-intl, whose requestLocale resolves to the locale
 *   segment of the URL, or to undefined when there is none
 * @returns The locale to render and its messages
 */
export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

    return { locale, messages: await loadMessages(locale) };
});
