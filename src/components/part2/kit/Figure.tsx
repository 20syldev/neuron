import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { MAIN_COLUMN, WIDE_COLUMN } from "./layout";

export interface FigureProps {
    wide?: boolean;
    className?: string;
    children: ReactNode;
}

/**
 * Figure of a chapter placed on the grid: the plate, then its caption.
 *
 * @param wide - Spans the main and the margin columns, for the wide dark plates of chapters 6 and 10
 * @param className - Extra classes merged over the base style
 * @param children - A Plate followed by its Caption
 */
export function Figure({ wide, className, children }: FigureProps) {
    return (
        <figure className={cn(wide ? WIDE_COLUMN : MAIN_COLUMN, "mt-1.5", className)}>
            {children}
        </figure>
    );
}
