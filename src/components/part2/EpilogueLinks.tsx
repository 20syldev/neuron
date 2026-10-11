import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { pad2 } from "@/lib/format";

const REFERENCES = [
    { id: "attention", href: "https://arxiv.org/abs/1706.03762" },
    { id: "illustrated", href: "https://jalammar.github.io/illustrated-transformer/" },
    { id: "video", href: "https://www.youtube.com/watch?v=eMlx5fFNoYc" },
] as const;

/**
 * Numbered list of the three references of the epilogue, each a full-width link to an external
 * page with its author and year and an arrow that marks it as leaving the essay. The titles are
 * English works and are marked with their own language.
 */
export function EpilogueLinks() {
    const t = useTranslations("epilogue");

    return (
        <ol className="m-0 mt-3.5 max-w-[690px] list-none border-t border-foreground p-0">
            {REFERENCES.map((reference, index) => (
                <li key={reference.id} className="border-b border-border">
                    <a
                        href={reference.href}
                        className="group grid min-h-14 grid-cols-[36px_minmax(0,1fr)_16px] items-baseline gap-3 py-3.5"
                    >
                        <span className="font-mono text-[11px] text-muted-foreground">
                            {pad2(index + 1)}
                        </span>
                        <span className="min-w-0">
                            <span
                                lang="en"
                                className="text-[17px] font-semibold group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4"
                            >
                                {t(`references.${reference.id}.title`)}
                            </span>
                            <span className="mt-[3px] block font-mono text-xs leading-normal text-muted-foreground">
                                {t(`references.${reference.id}.author`)}
                            </span>
                        </span>
                        <ArrowUpRight
                            aria-hidden="true"
                            size={16}
                            strokeWidth={2}
                            className="text-muted-foreground"
                        />
                    </a>
                </li>
            ))}
        </ol>
    );
}
