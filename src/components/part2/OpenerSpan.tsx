import { cn } from "@/lib/utils";

export interface OpenerSpanProps {
    children: string;
    className?: string;
}

/**
 * Dimension line under a figure: a hairline with an end tick on each side and the extent of the
 * grid printed in its middle.
 *
 * @param children - Text printed in the middle of the line, such as "13 x 13 = 169 weights"
 * @param className - Margin and width classes of the line, which differ between figures
 */
export function OpenerSpan({ children, className }: OpenerSpanProps) {
    return (
        <div aria-hidden="true" className={cn("flex items-center", className)}>
            <span className="h-[7px] w-px flex-none bg-border-strong" />
            <span className="h-px flex-[1_1_0] bg-border-strong" />
            <span className="px-2 font-mono text-[10.5px] leading-none whitespace-nowrap text-muted-foreground">
                {children}
            </span>
            <span className="h-px flex-[1_1_0] bg-border-strong" />
            <span className="h-[7px] w-px flex-none bg-border-strong" />
        </div>
    );
}
