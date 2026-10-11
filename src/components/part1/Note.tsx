import { type ReactNode } from "react";

export interface NoteProps {
    number: number;
    reserve?: ReactNode;
    children: ReactNode;
}

/**
 * Margin note: a numbered paragraph in small muted type. A note that changes with the live drawing
 * can carry a reserve, so the paragraph beside it keeps the same height.
 *
 * @param number - Note number, the one of the superscript that points to it
 * @param reserve - Longest text the note takes in its other states, laid out invisibly on top of
 *   the real text so the margin keeps the same height whichever one is shown
 * @param children - Text of the note, inline content only since it sits in a paragraph
 */
export function Note({ number, reserve, children }: NoteProps) {
    const lead = (
        <span className="mr-1.5 inline-block min-w-3.5 font-mono text-[11px] font-semibold text-foreground">
            {number}
        </span>
    );

    return (
        <p className="m-0 grid text-[13px] leading-[1.55] text-muted-foreground">
            <span className="col-start-1 row-start-1">
                {lead}
                {children}
            </span>
            {reserve ? (
                <span aria-hidden="true" className="invisible col-start-1 row-start-1">
                    {lead}
                    {reserve}
                </span>
            ) : null}
        </p>
    );
}
