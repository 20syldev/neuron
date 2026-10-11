import { type ReactNode } from "react";

import { Accent, Callout, TextLink } from "./kit";

/**
 * Rich text tag that highlights a key figure of a statement in the signal colour.
 *
 * @param chunks - Text wrapped by the tag
 * @returns The highlighted text
 */
function renderAccent(chunks: ReactNode) {
    return <Accent>{chunks}</Accent>;
}

/**
 * Rich text tag that prints the first numbered callout, in the signal colour.
 *
 * @returns The badge with its screen reader text
 */
function renderFirstMark() {
    return <Callout n={1} />;
}

/**
 * Rich text tag that prints the second numbered callout, in the foreground colour.
 *
 * @returns The badge with its screen reader text
 */
function renderSecondMark() {
    return <Callout n={2} />;
}

/**
 * Builds the rich text tag of an inline link to another chapter of the essay.
 *
 * @param href - In-page anchor such as "#ch-5"
 * @returns A tag renderer that wraps its text in the prose link style
 */
export function linkTag(href: string) {
    return function renderLink(chunks: ReactNode) {
        return <TextLink href={href}>{chunks}</TextLink>;
    };
}

export const PROSE_TAGS = {
    n: renderAccent,
    m1: renderFirstMark,
    m2: renderSecondMark,
};
