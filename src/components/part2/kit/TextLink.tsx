import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Inline link of the prose: underlined with a hairline that thickens on hover.
 *
 * @param className - Extra classes merged over the underline style
 * @param props - Any other anchor attribute (href, target, rel, children), spread onto the link
 */
export function TextLink({ className, ...props }: ComponentProps<"a">) {
    return (
        <a
            className={cn(
                "underline decoration-1 underline-offset-[3px] hover:decoration-2",
                className,
            )}
            {...props}
        />
    );
}
