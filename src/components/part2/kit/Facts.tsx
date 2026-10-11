import { type CSSProperties, type ReactNode } from "react";

import { Label } from "./Label";

export interface FactsProps {
    min?: number;
    children: ReactNode;
}

export interface FactProps {
    label: ReactNode;
    children: ReactNode;
}

/**
 * Responsive definition list of the numbers behind a figure: columns of label and value that
 * wrap by the minimum column width.
 *
 * @param min - Smallest width of a column in px before the grid wraps, 180 by default
 * @param children - Fact elements, each one a label and a value pair rendered as dt and dd
 */
export function Facts({ min = 180, children }: FactsProps) {
    return (
        <dl
            className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,var(--fact-min)),1fr))] gap-x-8 gap-y-[18px]"
            style={{ "--fact-min": `${min}px` } as CSSProperties}
        >
            {children}
        </dl>
    );
}

/**
 * One label and value pair of a Facts grid.
 *
 * @param label - Term of the fact, a short mono label
 * @param children - Value of the fact; use line breaks for a short list
 */
export function Fact({ label, children }: FactProps) {
    return (
        <div className="min-w-0">
            <Label as="dt">{label}</Label>
            <dd className="mt-1.5 mb-0 font-mono text-[12.5px] leading-[1.65] text-pretty text-foreground">
                {children}
            </dd>
        </div>
    );
}
