import { type CSSProperties } from "react";

export type RailState = "read" | "current" | "next";

export interface RailProps {
    label: string;
    value: string;
    state: RailState;
    progress?: number;
    percent?: string;
}

/**
 * Left rail of a chapter: a hairline running the height of the chapter, a progress line over it,
 * and a sticky label that stays in view while the chapter scrolls. Hidden under 1101 px.
 *
 * @param label - Small mono line at the top of the rail, such as "Partie II"
 * @param value - Large mono value under the label, such as the chapter number "05"
 * @param state - Reading state: a read chapter has a full ink line, the current one a signal line that grows with the progress and ends on a dot, an upcoming one a hairline only
 * @param progress - Share of the current chapter already read, between 0 and 1; 0 by default
 * @param percent - Progress as a formatted percentage shown under the value of the current chapter
 */
export function Rail({ label, value, state, progress = 0, percent }: RailProps) {
    return (
        <div
            aria-hidden="true"
            className="relative row-[1/span_60] hidden self-stretch min-[1101px]:col-start-1 min-[1101px]:block"
        >
            <span className="absolute top-0 bottom-0 left-0 w-px bg-border" />
            {state === "read" ? (
                <span className="absolute top-0 bottom-0 left-0 w-0.5 bg-foreground" />
            ) : null}
            {state === "current" ? (
                <>
                    <span
                        className="absolute top-0 left-0 h-(--progress) w-0.5 bg-signal"
                        style={{ "--progress": `${progress * 100}%` } as CSSProperties}
                    />
                    <span
                        className="absolute top-(--progress) -left-[3px] -mt-1 size-2 rounded-full bg-signal"
                        style={{ "--progress": `${progress * 100}%` } as CSSProperties}
                    />
                </>
            ) : null}
            <div className="sticky top-22 pt-1 pl-5">
                <p className="m-0 font-mono text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="mt-1.5 mb-0 font-mono text-[15px] leading-none font-semibold text-foreground">
                    {value}
                </p>
                {state === "current" && percent ? (
                    <p className="mt-[3px] mb-0 font-mono text-[11px] font-semibold text-signal-ink">
                        {percent}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
