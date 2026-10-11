import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface CaptionProps {
    figure?: number | string;
    plate?: number | string;
    disclosure?: ReactNode;
    children: ReactNode;
}

/**
 * Caption of a figure: an optional printed plate line, the caption text started by "Fig. N.",
 * and the "Voir les nombres" disclosure underneath.
 *
 * @param figure - Figure number printed before the text as "Fig. 5.", for the caption of a light plate
 * @param plate - Plate number printed in a mono line with a rule above the text, such as "6", for the caption of a dark plate
 * @param disclosure - Disclosure placed under the caption text
 * @param children - Caption text; number its marks with Callout badges
 */
export function Caption({ figure, plate, disclosure, children }: CaptionProps) {
    const t = useTranslations("part2.kit");

    return (
        <figcaption className={cn("max-w-none", plate === undefined ? "mt-[18px]" : "mt-7")}>
            {plate !== undefined ? (
                <p className="m-0 flex items-center gap-3 font-mono text-[11.5px] leading-4 font-semibold tracking-[0.14em] text-foreground uppercase">
                    <span>
                        {t("plate")} {plate}
                    </span>
                    <span aria-hidden="true" className="h-px flex-[1_1_20px] bg-border" />
                </p>
            ) : null}
            <p
                className={cn(
                    "m-0 text-sm leading-[1.6] text-pretty text-muted-foreground",
                    plate !== undefined && "mt-[7px]",
                )}
            >
                {figure !== undefined ? (
                    <>
                        <span className="mr-[3px] font-mono text-xs font-semibold tracking-[0.02em] text-foreground">
                            {t("figure")} {figure}.
                        </span>{" "}
                    </>
                ) : null}
                {children}
            </p>
            {disclosure}
        </figcaption>
    );
}
