import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { MAIN_COLUMN } from "./layout";

export interface ChapterNextProps {
    next: number;
    title: string;
    children: ReactNode;
}

/**
 * Closing band of a chapter: a hairline, one sentence that hands over to the next chapter and
 * the link to it.
 *
 * @param next - Number of the chapter the link leads to; the link targets the anchor "#ch-<next>"
 * @param title - Title of the chapter the link leads to, used in the link label
 * @param children - Closing sentence that opens onto the next chapter
 */
export function ChapterNext({ next, title, children }: ChapterNextProps) {
    const t = useTranslations("part2.kit");

    return (
        <div
            className={`${MAIN_COLUMN} mt-[34px] flex flex-wrap items-end justify-between gap-x-8 gap-y-3.5 border-t border-foreground pt-[22px]`}
        >
            <p className="m-0 max-w-[26em] font-display text-[clamp(20px,2.2vw,24px)] leading-[1.28] font-medium tracking-[-0.01em] text-balance">
                {children}
            </p>
            <a
                href={`#ch-${next}`}
                className="group inline-flex min-h-10 flex-none items-center gap-2 font-mono text-xs font-medium tracking-[0.04em] text-foreground"
            >
                <span className="group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                    {t("nextChapter", { n: next, title })}
                </span>
                <ChevronRight aria-hidden="true" size={14} strokeWidth={2} />
            </a>
        </div>
    );
}
