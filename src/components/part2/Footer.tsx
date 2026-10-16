import { useTranslations } from "next-intl";

import { EpilogueTail } from "@/components/part2/EpilogueTail";
import { type DotKind, MARK_FIELD, MARK_VIEW, round2, WM } from "@/lib/halftone";

const DOT_CLASS: Record<DotKind, string> = {
    ink: "fill-foreground",
    halo: "fill-foreground",
    grid: "fill-grid",
    sig: "fill-signal",
};

const LINK_TITLE = "group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4";

const LINKS = [
    { id: "source", href: "https://github.com/20syldev/neuron" },
    { id: "author", href: "https://sylvain.sh/projet/neuron" },
] as const;

/**
 * Static copy of the square halftone "n" of the compact bar, drawn from the same field: bold ink
 * dots, halos, faint grid dots and the orange dot in the middle of the arch, at 28 px and without
 * the lens or the breathing.
 */
function FooterMark() {
    return (
        <svg
            viewBox={`0 0 ${MARK_VIEW.width} ${MARK_VIEW.height}`}
            aria-hidden="true"
            className="block size-7 flex-none overflow-visible"
        >
            {MARK_FIELD.map((dot, index) => (
                <circle
                    key={index}
                    cx={round2(dot.x)}
                    cy={round2(dot.y)}
                    r={round2(dot.kind === "sig" ? dot.r * WM.sigSmall : dot.r)}
                    className={DOT_CLASS[dot.kind]}
                />
            ))}
        </svg>
    );
}

/**
 * Footer of the whole page: the divider of softmax-tail dots, the mark, the wordmark and the
 * tagline of the essay, the links to the source code and to the author, and the domain line. It
 * keeps 130 px under it so the floating pill never covers the last line.
 */
export function SiteFooter() {
    const t = useTranslations("footer");

    return (
        <footer className="mx-auto max-w-[1280px] px-(--gutter) pt-14 pb-[130px]">
            <EpilogueTail kind="footer" />
            <div className="mt-8 flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
                <div>
                    <a
                        href="#top"
                        aria-label={t("home")}
                        className="inline-flex min-h-10 items-center gap-2.5"
                    >
                        <FooterMark />
                        <span className="font-display text-xl leading-none font-semibold tracking-[-0.02em]">
                            neuron
                        </span>
                    </a>
                    <p className="mt-2.5 mb-0 text-sm leading-normal text-pretty text-muted-foreground">
                        {t("tagline")}
                    </p>
                </div>
                <nav
                    aria-label={t("navLabel")}
                    className="flex flex-wrap gap-x-7 gap-y-1 text-sm font-semibold"
                >
                    {LINKS.map((link) => (
                        <a
                            key={link.id}
                            href={link.href}
                            className="group inline-flex min-h-10 items-center"
                        >
                            <span className={LINK_TITLE}>{t(link.id)}</span>
                        </a>
                    ))}
                </nav>
            </div>
            <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-border pt-3.5 font-mono text-[11px] tracking-[0.06em] text-muted-foreground">
                <span>{t("domain")}</span>
                <span>{t("subtitle")}</span>
            </div>
        </footer>
    );
}
