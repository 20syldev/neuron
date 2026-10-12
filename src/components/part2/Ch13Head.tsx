import { useLocale, useTranslations } from "next-intl";

import { Ch13Grid } from "@/components/part2/Ch13Grid";
import { Callout, Label } from "@/components/part2/kit";
import { IL_INDEX, TOKENS } from "@/lib/attention";
import { formatPercent } from "@/lib/format";
import { type Head, ilRow, ilTopTwo } from "@/lib/heads";

const TIE_EPSILON = 1e-9;

const APOSTROPHE = String.fromCodePoint(0x2019);

interface Ch13HeadProps {
    head: Head;
    position: number;
    words: readonly string[];
}

/**
 * Prints a word of the sentence the way the prose does: with a typographic apostrophe.
 *
 * @param word - Token of the sentence, such as "L'"
 * @returns The same word with its straight apostrophe turned into a typographic one
 */
export const typographic = (word: string) => word.replace("'", APOSTROPHE);

/**
 * One head of the figure: its kicker and role, the halftone grid with the row of "il" framed, and
 * a legend line naming the word that "il" looks at most with its weight, or the two words when
 * they tie exactly.
 *
 * @param head - Head whose attention row for "il" is drawn, with its name and role from the messages
 * @param position - Position of the head in the figure, counted from 1, printed in its kicker
 * @param words - Words as printed on the column labels, the last one following the sentence variant
 * @returns The head with its kicker, its grid and its legend line
 */
export function Ch13Head({ head, position, words }: Ch13HeadProps) {
    const t = useTranslations("part2.ch13");
    const locale = useLocale();

    const row = ilRow(head);
    const [first, second] = ilTopTwo(head);
    const tied = row[first] - row[second] < TIE_EPSILON;
    const strong = tied ? [first, second] : [first];
    const name = t(`names.${head.name}`);

    const legend = t(tied ? "legend.tie" : "legend.one", {
        top: typographic(TOKENS[first]),
        second: typographic(TOKENS[second]),
        share: formatPercent(locale, row[first], 1),
    });

    return (
        <div className="min-w-0">
            <Label as="p">{t("head", { n: position })}</Label>
            <h4 className="mt-1 mb-3 font-mono text-[13px] leading-[1.35] font-semibold text-foreground first-letter:uppercase max-[561px]:text-xs">
                {name}
            </h4>
            <Ch13Grid
                values={head.matrix}
                words={words}
                label={t("gridLabel", { n: position, name, legend })}
                emphasis={IL_INDEX}
                strong={strong}
            />
            <p className="m-0 mt-2.5 flex items-start gap-1.5 font-mono text-xs leading-[1.45] text-foreground max-[561px]:text-[11px]">
                <Callout n={2} size="flush" className="mt-px" />
                <span className="min-w-0">{legend}</span>
            </p>
        </div>
    );
}
