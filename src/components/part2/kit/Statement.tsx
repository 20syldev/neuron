import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface StatementProps {
    id: string;
    srPrefix?: string;
    level?: 2 | 3;
    className?: string;
    children: ReactNode;
}

/**
 * Statement headline of a chapter or of the Part II opener: a Bricolage sentence that states the
 * finding of the chapter, up to 56 px.
 *
 * @param id - DOM id of the heading, referenced by aria-labelledby of the section
 * @param srPrefix - Text read by screen readers before the headline, such as the chapter number followed by its short name
 * @param level - Heading level, 2 by default; chapters use 3 so that they nest under the Part II heading as the Part I chapters do under theirs
 * @param className - Extra classes merged over the base style
 * @param children - Headline content; wrap the key figures in Accent
 */
export function Statement({ id, srPrefix, level = 2, className, children }: StatementProps) {
    const Heading = level === 3 ? "h3" : "h2";

    return (
        <Heading
            id={id}
            className={cn(
                "m-0 max-w-[18em] font-display text-[clamp(30px,1.2rem+2.8vw,56px)] leading-[1.06] font-medium tracking-[-0.01em] text-balance",
                className,
            )}
        >
            {srPrefix ? <span className="sr-only">{srPrefix}</span> : null}
            {children}
        </Heading>
    );
}
