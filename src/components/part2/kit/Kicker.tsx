import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface KickerProps {
    number?: string;
    className?: string;
    children: ReactNode;
}

/**
 * Mono kicker above a statement headline. The chapter number and its short rule only appear when
 * the left rail, which normally carries the number, is not displayed.
 *
 * @param number - Chapter number shown before the title when the rail is hidden (under 1101 px), such as "05"
 * @param className - Extra classes merged over the base style
 * @param children - Kicker text, usually the chapter title
 */
export function Kicker({ number, className, children }: KickerProps) {
    return (
        <p
            className={cn(
                "mb-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11.5px] leading-4 font-medium tracking-[0.14em] text-muted-foreground uppercase max-[561px]:tracking-[0.1em]",
                className,
            )}
        >
            {number ? (
                <>
                    <span className="font-semibold text-foreground min-[1101px]:hidden">
                        {number}
                    </span>
                    <span
                        aria-hidden="true"
                        className="h-px w-6 flex-none bg-border-strong min-[1101px]:hidden"
                    />
                </>
            ) : null}
            <span>{children}</span>
        </p>
    );
}
