import { useTranslations } from "next-intl";

import { Callout } from "@/components/part2/kit";
import { dotRowsPath } from "@/lib/figures";

const SMALL_PATH = dotRowsPath(2, 4, 0, 12, 0, 12);

const REST_PATH = dotRowsPath(2, 4, 0, 12, 13, 25) + dotRowsPath(2, 4, 13, 25, 0, 25);

export interface Ch15CostProps {
    values: Record<string, string>;
}

/**
 * Right column of plate 15: the big head count of GPT-3 (2020) and the two squares of dots that
 * show the cost of the grid, 13 words against 26 words, the second containing the first.
 *
 * @param values - Formatted numbers read by the messages of the figure (head and comparison counts), with the total printed as the big figure under the key total
 */
export function Ch15Cost({ values }: Ch15CostProps) {
    const t = useTranslations("part2.ch15");

    return (
        <div className="min-w-0 flex-[1_1_260px]">
            <p className="sr-only">{t("summary", values)}</p>
            <p
                aria-hidden="true"
                className="m-0 font-display text-[clamp(44px,4.4vw,56px)] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap text-signal"
            >
                {values.total}
            </p>
            <p aria-hidden="true" className="mt-4 mb-0 text-lg leading-[1.3] font-semibold">
                {t("statLabel")}
            </p>
            <p
                aria-hidden="true"
                className="mt-1.5 mb-0 font-mono text-[13px] text-muted-foreground"
            >
                {t("statFormula", values)}
            </p>
            <div className="mt-[26px] flex items-end gap-[26px] border-t border-border pt-[18px]">
                <div>
                    <svg
                        width={52}
                        height={52}
                        viewBox="0 0 52 52"
                        role="img"
                        aria-label={t("smallLabel", values)}
                        className="block"
                    >
                        <path
                            d={SMALL_PATH}
                            fill="none"
                            strokeWidth={2.4}
                            strokeLinecap="round"
                            strokeDasharray="0 4"
                            className="stroke-foreground"
                        />
                    </svg>
                    <p className="mt-2.5 mb-0 font-mono text-xs leading-normal">
                        {t("smallWords", values)}
                        <br />
                        <span className="text-muted-foreground">
                            {t("smallComparisons", values)}
                        </span>
                    </p>
                </div>
                <div>
                    <div className="relative w-[104px]">
                        <svg
                            width={104}
                            height={104}
                            viewBox="0 0 104 104"
                            role="img"
                            aria-label={t("bigLabel", values)}
                            className="block"
                        >
                            <path
                                d={REST_PATH}
                                fill="none"
                                strokeWidth={2.4}
                                strokeLinecap="round"
                                strokeDasharray="0 4"
                                className="stroke-border-strong"
                            />
                            <path
                                d={SMALL_PATH}
                                fill="none"
                                strokeWidth={2.4}
                                strokeLinecap="round"
                                strokeDasharray="0 4"
                                className="stroke-foreground"
                            />
                        </svg>
                        <Callout
                            n={2}
                            size="flush"
                            className="absolute -right-2.5 -bottom-2.5 size-[22px]"
                        />
                    </div>
                    <p className="mt-2.5 mb-0 font-mono text-xs leading-normal">
                        {t("bigWords", values)}
                        <br />
                        <span className="text-muted-foreground">{t("bigComparisons", values)}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
