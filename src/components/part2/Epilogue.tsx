import { useTranslations } from "next-intl";

import { RICH } from "@/components/part2/Ch11Rich";
import { EpilogueLinks } from "@/components/part2/EpilogueLinks";
import { EpilogueTail } from "@/components/part2/EpilogueTail";
import { Kicker, MarginNote, Prose, Statement } from "@/components/part2/kit";
import { MAIN_COLUMN, WIDE_COLUMN } from "@/components/part2/kit/layout";

/**
 * Epilogue of the essay: a softmax tail that ends on the signal dot of "il", the headline "What
 * il learned", one paragraph that retells the path of the word, a pointer to chapters 7 to 10
 * and the three references to read next. It sits on the rail grid but its rail stops after 120 px.
 */
export function Epilogue() {
    const t = useTranslations("epilogue");
    const kit = useTranslations("part2.kit");

    return (
        <section
            id="epilogue"
            aria-labelledby="ep-t"
            className="relative mx-auto w-full max-w-[1280px] px-(--gutter) pt-19 pb-10 max-[761px]:pt-16"
        >
            <span aria-hidden="true" className="absolute inset-x-(--gutter) top-0 h-px bg-border" />
            <div className="grid grid-cols-1 items-start min-[1101px]:grid-cols-[96px_minmax(0,1fr)_232px] min-[1101px]:gap-x-12">
                <div
                    aria-hidden="true"
                    className="relative row-[1/span_60] hidden self-stretch min-[1101px]:col-start-1 min-[1101px]:block"
                >
                    <span className="absolute top-0 left-0 h-[120px] w-px bg-border" />
                    <div className="sticky top-22 pt-1 pl-5">
                        <p className="m-0 font-mono text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                            {kit("part")}
                        </p>
                    </div>
                </div>
                <EpilogueTail kind="epilogue" className={`${WIDE_COLUMN} mb-14`} />
                <header className={`${WIDE_COLUMN} pb-[30px]`}>
                    <Kicker>{t("kicker")}</Kicker>
                    <Statement id="ep-t">{t("headline")}</Statement>
                </header>
                <Prose>{t("text")}</Prose>
                <MarginNote label={t("summaryLabel")}>{t.rich("summary", RICH)}</MarginNote>
                <div className={`${MAIN_COLUMN} mt-5`}>
                    <h3 className="m-0 font-mono text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                        {t("further")}
                    </h3>
                    <EpilogueLinks />
                </div>
            </div>
        </section>
    );
}
