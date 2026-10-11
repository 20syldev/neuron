import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface LabelProps {
    as?: "p" | "span" | "dt";
    className?: string;
    children: ReactNode;
}

/**
 * Small uppercase mono label used for kickers, margin note titles and number captions.
 *
 * @param as - Element to render, a paragraph by default; "dt" for the term of a definition list
 * @param className - Extra classes merged over the base style
 * @param children - Inline text of the label, kept short so it stays on one line
 */
export function Label({ as: Tag = "p", className, children }: LabelProps) {
    return (
        <Tag
            className={cn(
                "m-0 font-mono text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase",
                className,
            )}
        >
            {children}
        </Tag>
    );
}
