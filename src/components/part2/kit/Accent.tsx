import { type ReactNode } from "react";

export interface AccentProps {
    children: ReactNode;
}

/**
 * Highlights the key figures of a statement headline in the signal colour.
 *
 * @param children - Figures or words to highlight, rendered inline in semibold
 */
export function Accent({ children }: AccentProps) {
    return <span className="font-semibold text-signal">{children}</span>;
}
