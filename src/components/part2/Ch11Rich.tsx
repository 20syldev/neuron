import { type RichTranslationValues } from "next-intl";

import { Accent, Callout, TextLink } from "@/components/part2/kit";

// Rich text tags of the messages of chapters 11 to 15 and of the epilogue.
export const RICH: RichTranslationValues = {
    n: (chunks) => <Accent>{chunks}</Accent>,
    c1: () => <Callout n={1} />,
    c2: () => <Callout n={2} />,
    br: () => <br />,
    ch7: (chunks) => <TextLink href="#ch-7">{chunks}</TextLink>,
    ch9: (chunks) => <TextLink href="#ch-9">{chunks}</TextLink>,
    ch11: (chunks) => <TextLink href="#ch-11">{chunks}</TextLink>,
    ch15: (chunks) => <TextLink href="#ch-15">{chunks}</TextLink>,
};
