import { type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface EyebrowProps {
    as?: ElementType;
    wide?: boolean;
    className?: string;
    children: ReactNode;
}

/**
 * Small uppercase mono label that names a figure, a panel or a section.
 *
 * @param as - Element to render, a paragraph by default
 * @param wide - Uses the wider letter spacing of the rails and section heads instead of the one of figure labels
 * @param className - Extra classes merged over the base style
 * @param children - Inline text of the label, kept short so it stays on one line
 */
export function Eyebrow({ as: Tag = "p", wide, className, children }: EyebrowProps) {
    return (
        <Tag
            className={cn(
                "m-0 font-mono text-[11px] leading-4 font-medium text-muted-foreground uppercase",
                wide ? "tracking-[0.14em]" : "tracking-[0.12em]",
                className,
            )}
        >
            {children}
        </Tag>
    );
}
