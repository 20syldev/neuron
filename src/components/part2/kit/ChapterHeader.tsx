import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { pad2 } from "@/lib/format";

import { Kicker } from "./Kicker";
import { WIDE_COLUMN } from "./layout";
import { Statement } from "./Statement";

export interface ChapterHeaderProps {
    number: number;
    title: string;
    children: ReactNode;
}

/**
 * Header of a numbered chapter: the mono kicker with the chapter title, then the statement
 * headline. It spans the main and margin columns.
 *
 * @param number - Chapter number, 5 to 15; also gives the heading id "ch<number>-t"
 * @param title - Chapter title shown in the kicker and read by screen readers before the headline
 * @param children - Statement headline content; wrap the key figures in Accent
 */
export function ChapterHeader({ number, title, children }: ChapterHeaderProps) {
    const t = useTranslations("part2.kit");

    return (
        <header className={`${WIDE_COLUMN} pb-[30px]`}>
            <Kicker number={pad2(number)}>{title}</Kicker>
            <Statement
                id={`ch${number}-t`}
                level={3}
                srPrefix={t("chapterTitle", { n: number, title })}
            >
                {children}
            </Statement>
        </header>
    );
}
