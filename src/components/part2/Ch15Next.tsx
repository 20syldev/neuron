import { ChevronRight } from "lucide-react";
import { type ReactNode } from "react";

import { MAIN_COLUMN } from "@/components/part2/kit/layout";

export interface Ch15NextProps {
    title: string;
    children: ReactNode;
}

/**
 * Closing band of chapter 15: the same hairline, sentence and link as the other chapters, but
 * the link leads to the epilogue, which has no chapter number.
 *
 * @param title - Title of the epilogue, shown as the label of the link
 * @param children - Closing sentence that opens onto the epilogue
 */
export function Ch15Next({ title, children }: Ch15NextProps) {
    return (
        <div
            className={`${MAIN_COLUMN} mt-[34px] flex flex-wrap items-end justify-between gap-x-8 gap-y-3.5 border-t border-foreground pt-[22px]`}
        >
            <p className="m-0 max-w-[26em] font-display text-[clamp(20px,2.2vw,24px)] leading-[1.28] font-medium tracking-[-0.01em] text-balance">
                {children}
            </p>
            <a
                href="#epilogue"
                className="group inline-flex min-h-10 flex-none items-center gap-2 font-mono text-xs font-medium tracking-[0.04em] text-foreground"
            >
                <span className="group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                    {title}
                </span>
                <ChevronRight aria-hidden="true" size={14} strokeWidth={2} />
            </a>
        </div>
    );
}
