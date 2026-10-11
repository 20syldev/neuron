import { cn } from "@/lib/utils";

export interface DimensionProps {
    label: string;
    className?: string;
}

/**
 * Dimension line of a figure: a bar with a tick at each end and its measure in the middle.
 *
 * @param label - Text of the annotation, such as "28 px"
 * @param className - Extra classes merged over the base style, for the margins and the width
 */
export function Dimension({ label, className }: DimensionProps) {
    return (
        <div aria-hidden="true" className={cn("flex items-center", className)}>
            <span className="h-[7px] w-px bg-border-strong" />
            <span className="h-px flex-[1_1_0] bg-border-strong" />
            <span className="px-2 font-mono text-[10.5px] leading-none text-muted-foreground">
                {label}
            </span>
            <span className="h-px flex-[1_1_0] bg-border-strong" />
            <span className="h-[7px] w-px bg-border-strong" />
        </div>
    );
}
