import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { MAIN_COLUMN } from "./layout";

export interface ProseProps {
    className?: string;
    children: ReactNode;
}

/**
 * Body paragraph of a chapter: 18.5 px, a 560 px measure, placed in the main column of the grid.
 *
 * @param className - Extra classes merged over the base style
 * @param children - Inline content of the paragraph, no block element since it is a p
 */
export function Prose({ className, children }: ProseProps) {
    return (
        <p
            className={cn(
                MAIN_COLUMN,
                "mb-[26px] max-w-[560px] text-[18.5px] leading-[1.65] text-pretty text-foreground",
                className,
            )}
        >
            {children}
        </p>
    );
}
