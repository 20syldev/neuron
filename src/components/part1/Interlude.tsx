import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { Eyebrow } from "./Eyebrow";
import { Hinge } from "./Hinge";
import { DISPLAY, SECTION } from "./layout";

/**
 * Interlude between the two parts: a headline statement that turns the fixed gaze of the
 * perceptron into the question of attention, then the hinge of dots and the link to Part II.
 */
export function Interlude() {
    const t = useTranslations("interlude");

    return (
        <section
            id="interlude"
            aria-labelledby="interlude-t"
            className={`${SECTION} pt-[168px] pb-32 -scroll-mt-42 max-[760px]:pt-22 max-[760px]:-scroll-mt-22 max-[760px]:pb-[72px]`}
        >
            <div
                aria-hidden="true"
                className="mb-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-0.5 border-t border-foreground pt-3 min-[1081px]:col-start-1 min-[1081px]:row-start-1 min-[1081px]:mb-0 min-[1081px]:block min-[1081px]:pt-3.5"
            >
                <Eyebrow wide className="flex items-center gap-[9px]">
                    <span className="block h-px w-3.5 flex-none bg-border-strong" />
                    {t("rail")}
                </Eyebrow>
            </div>
            <div className="min-w-0 pt-1 min-[1081px]:col-[2/4] min-[1081px]:row-start-1 min-[1081px]:border-t min-[1081px]:border-border min-[1081px]:pt-3.5">
                <Eyebrow wide>{t("label")}</Eyebrow>
                <h2
                    id="interlude-t"
                    className={`${DISPLAY} m-0 mt-3.5 text-[30px] leading-[1.15] font-semibold tracking-[-0.02em] text-balance`}
                >
                    {t("title")}
                </h2>
            </div>
            <p
                className={`${DISPLAY} m-0 mt-11 max-w-[960px] text-[clamp(28px,3.6vw,46px)] leading-[1.12] font-medium tracking-[-0.012em] min-[1081px]:col-[2/4] min-[1081px]:row-start-2`}
            >
                {t.rich("statement", {
                    muted: (chunks) => <span className="text-muted-foreground">{chunks}</span>,
                    signal: (chunks) => <span className="text-signal">{chunks}</span>,
                })}
            </p>
            <div className="mt-[104px] min-w-0 min-[1081px]:col-[1/-1] min-[1081px]:row-start-3">
                <Hinge />
                <div className="mt-[18px] flex flex-wrap items-center justify-between gap-x-6 gap-y-3 font-mono text-[11px] leading-4 font-medium tracking-[0.12em] text-muted-foreground uppercase">
                    <span>{t("from")}</span>
                    <a
                        href="#partie-2"
                        className="group inline-flex items-center gap-2 text-foreground max-[760px]:min-h-10"
                    >
                        <span className="group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                            {t("to")}
                        </span>
                        <ChevronDown
                            aria-hidden="true"
                            size={14}
                            strokeWidth={2}
                            className="flex-none"
                        />
                    </a>
                </div>
            </div>
        </section>
    );
}
