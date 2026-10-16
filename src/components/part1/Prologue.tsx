import { ChevronDown, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

import { Eyebrow } from "./Eyebrow";
import { DESKTOP_GRID, DISPLAY } from "./layout";

/**
 * Prologue of the essay: the giant title "From ink to meaning" with its second line indented, the
 * lead paragraph, the two calls to action (draw a digit, jump to Part II) and a side note.
 */
export function Prologue() {
    const t = useTranslations("prologue");

    return (
        <section
            id="prologue"
            aria-labelledby="hero-t"
            className="mx-auto w-full max-w-[1280px] px-(--gutter) pt-24 max-[760px]:pt-14"
        >
            <h1
                id="hero-t"
                className={`${DISPLAY} m-0 text-[clamp(60px,13.2vw,168px)] leading-[0.86] font-semibold tracking-[-0.018em] text-balance`}
            >
                {t.rich("title.first", {
                    apostrophe: (chunks) => (
                        <span className="mr-[0.04em] ml-[0.03em]">{chunks}</span>
                    ),
                })}{" "}
                <span className="block min-[1081px]:ml-[200px]">{t("title.second")}</span>
            </h1>
            <div className={`mt-16 grid grid-cols-1 gap-y-8 ${DESKTOP_GRID}`}>
                <Eyebrow
                    wide
                    className="border-t border-foreground pt-3 font-medium max-[760px]:hidden min-[1081px]:col-start-1"
                >
                    {t("label")}
                </Eyebrow>
                <div className="min-w-0 min-[1081px]:col-start-2">
                    <p className="mt-1.5 mb-0 text-[21px] leading-[1.55] text-pretty text-foreground">
                        {t("lead")}
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        <a
                            href="#ch-1"
                            className="inline-flex h-[46px] items-center gap-2.5 rounded-[3px] bg-foreground pr-[18px] pl-4 text-[15px] font-semibold text-background transition-opacity hover:opacity-86"
                        >
                            <Pencil
                                aria-hidden="true"
                                size={16}
                                strokeWidth={2}
                                className="flex-none"
                            />
                            {t("start")}
                        </a>
                        <a
                            href="#part-2"
                            className="inline-flex h-[46px] items-center gap-2 rounded-[3px] border border-border-strong pr-[13px] pl-4 text-[15px] font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            {t("jump")}
                            <ChevronDown
                                aria-hidden="true"
                                size={16}
                                strokeWidth={2}
                                className="flex-none"
                            />
                        </a>
                    </div>
                </div>
                <div
                    role="note"
                    aria-label={t("noteLabel")}
                    className="min-w-0 border-t border-foreground pt-3 min-[1081px]:col-start-3"
                >
                    <p className="m-0 text-[13px] leading-[1.55] text-muted-foreground">
                        {t("note")}
                    </p>
                </div>
            </div>
        </section>
    );
}
