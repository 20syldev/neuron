const NO_BREAK_SPACE = "\u00a0";

const cache = new Map<string, Intl.NumberFormat>();

/**
 * Returns a cached Intl.NumberFormat so repeated calls in a render loop do not rebuild it.
 *
 * @param locale - BCP 47 locale tag
 * @param style - Intl number style
 * @param digits - Exact number of fraction digits
 * @returns The shared formatter for this combination
 */
function formatter(locale: string, style: "decimal" | "percent", digits: number) {
    const key = `${locale}|${style}|${digits}`;
    let format = cache.get(key);

    if (!format) {
        format = new Intl.NumberFormat(locale, {
            style,
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        });
        cache.set(key, format);
    }

    return format;
}

/**
 * Formats a number with the decimal and grouping conventions of a locale.
 *
 * @param locale - BCP 47 locale tag, "fr" gives "72,4" and "en" gives "72.4"
 * @param value - Number to format
 * @param digits - Exact number of fraction digits, 0 by default
 * @returns The formatted string, grouping spaces being plain no-break spaces in French
 */
export function formatNumber(locale: string, value: number, digits = 0) {
    return formatter(locale, "decimal", digits).format(value).replace(/\s/g, NO_BREAK_SPACE);
}

/**
 * Formats a ratio as a percentage: "72,4 %" in French (no-break space before the sign, a
 * plain one because the narrow form is almost invisible in the display and mono faces), "72.4%"
 * in English.
 *
 * @param locale - BCP 47 locale tag
 * @param ratio - Value between 0 and 1, where 1 is 100 percent
 * @param digits - Exact number of fraction digits of the percentage, 0 by default
 * @returns The formatted string, never breaking between the number and the sign
 */
export function formatPercent(locale: string, ratio: number, digits = 0) {
    return formatter(locale, "percent", digits).format(ratio).replace(/\s/g, NO_BREAK_SPACE);
}

/**
 * Left-pads a non-negative integer to two digits.
 *
 * @param n - Integer to pad, such as a chapter number
 * @returns "07" for 7, "15" for 15
 */
export function pad2(n: number) {
    return String(n).padStart(2, "0");
}
