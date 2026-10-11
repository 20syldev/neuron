import { type ReactNode } from "react";

export interface SupProps {
    children: ReactNode;
}

/**
 * Superscript reference to a margin note.
 *
 * @param children - Note number, matching the number of the Note it points to
 */
export function Sup({ children }: SupProps) {
    return (
        <sup className="ml-0.5 font-mono text-[11px] leading-[0] font-semibold text-muted-foreground">
            {children}
        </sup>
    );
}
