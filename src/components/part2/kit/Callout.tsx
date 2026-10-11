import { cva, type VariantProps } from "class-variance-authority";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

const calloutVariants = cva(
    "inline-flex flex-none items-center justify-center rounded-full border bg-background font-mono leading-none font-semibold",
    {
        variants: {
            tone: {
                signal: "border-signal-ink text-signal-ink",
                foreground: "border-foreground text-foreground",
            },
            size: {
                sm: "mx-[3px] size-[17px] align-[1px] text-[10px]",
                md: "mx-[3px] size-[19px] align-[0.55em] text-[10px]",
                lg: "size-5 text-[10.5px]",
                flush: "size-[17px] text-[10px]",
            },
        },
        compoundVariants: [{ tone: "signal", size: "lg", className: "border-signal" }],
        defaultVariants: { tone: "foreground", size: "sm" },
    },
);

export interface CalloutProps extends VariantProps<typeof calloutVariants> {
    n: number;
    className?: string;
}

/**
 * Numbered callout badge that links a passage of the prose, the figure and its caption. Sizes:
 * "sm" in prose and captions (17 px), "md" in the sentence headline (19 px), "lg" in figures
 * (20 px), "flush" without side margins in plate labels. The tone defaults to the signal colour
 * for callout 1 and to the foreground for the others.
 *
 * @param n - Number printed in the badge, 1 or 2; also read by screen readers as a translated "(marker N)"
 * @param tone - "signal" or "foreground"; defaults to "signal" for n = 1 and "foreground" otherwise
 * @param size - "sm" (default), "md", "lg" or "flush"; see the sizes above
 * @param className - Extra classes merged over the badge, such as an absolute position inside a figure
 */
export function Callout({ n, tone, size, className }: CalloutProps) {
    const t = useTranslations("part2.kit");

    return (
        <>
            <span
                aria-hidden="true"
                className={cn(
                    calloutVariants({ tone: tone ?? (n === 1 ? "signal" : "foreground"), size }),
                    className,
                )}
            >
                {n}
            </span>
            <span className="sr-only">({t("callout", { n })})</span>
        </>
    );
}
