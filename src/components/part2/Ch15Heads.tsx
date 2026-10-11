import { useTranslations } from "next-intl";

import { Callout } from "@/components/part2/kit";
import { dotRowsPath } from "@/lib/figures";

const HEADS_PATH = dotRowsPath(2.5, 5, 0, 95, 0, 95);

const VIEW = 480;

const AXIS_LINE = "bg-border-strong";

export interface Ch15HeadsProps {
    values: Record<string, string>;
}

/**
 * The 96 by 96 square of the heads of GPT-3 (2020): one dot per head, one layer per row, one
 * orange dot standing for a single head, with a bracket for the layers and one for the heads of
 * a layer.
 *
 * @param values - Formatted numbers read by the messages of the figure, such as the layer and head counts
 */
export function Ch15Heads({ values }: Ch15HeadsProps) {
    const t = useTranslations("part2.ch15");

    return (
        <div className="max-w-[410px] min-w-0 flex-[1_1_280px]">
            <div className="flex gap-3">
                <div aria-hidden="true" className="flex w-3.5 flex-none flex-col items-center">
                    <span className={`h-px w-[7px] ${AXIS_LINE}`} />
                    <span className={`w-px flex-[1_1_0] ${AXIS_LINE}`} />
                    <span className="rotate-180 py-2 font-mono text-[10.5px] leading-none whitespace-nowrap text-muted-foreground [writing-mode:vertical-rl]">
                        {t("axisLayers", values)}
                    </span>
                    <span className={`w-px flex-[1_1_0] ${AXIS_LINE}`} />
                    <span className={`h-px w-[7px] ${AXIS_LINE}`} />
                </div>
                <div className="relative min-w-0 flex-[1_1_0]">
                    <svg
                        width={VIEW}
                        height={VIEW}
                        viewBox={`0 0 ${VIEW} ${VIEW}`}
                        role="img"
                        aria-label={t("figureLabel", values)}
                        className="block h-auto w-full"
                    >
                        <path
                            d={HEADS_PATH}
                            fill="none"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeDasharray="0 5"
                            className="stroke-foreground"
                        />
                        <circle cx={37.5} cy={37.5} r={2.4} className="fill-signal" />
                        <circle
                            cx={37.5}
                            cy={37.5}
                            r={7.5}
                            fill="none"
                            strokeWidth={1.2}
                            className="stroke-signal"
                        />
                    </svg>
                    <Callout
                        n={1}
                        size="flush"
                        className="absolute top-[calc(7.8125%-11px)] left-[calc(7.8125%+16px)] size-[22px]"
                    />
                </div>
            </div>
            <div aria-hidden="true" className="mt-4 ml-[26px] flex items-center">
                <span className={`h-[7px] w-px flex-none ${AXIS_LINE}`} />
                <span className={`h-px flex-[1_1_0] ${AXIS_LINE}`} />
                <span className="px-2 font-mono text-[10.5px] leading-none whitespace-nowrap text-muted-foreground">
                    {t("axisHeads", values)}
                </span>
                <span className={`h-px flex-[1_1_0] ${AXIS_LINE}`} />
                <span className={`h-[7px] w-px flex-none ${AXIS_LINE}`} />
            </div>
        </div>
    );
}
