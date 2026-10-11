import { type ReactNode } from "react";

export interface OpenerKickerProps {
    part: string;
    title: string;
    children: ReactNode;
}

/**
 * Mono kicker above the headline of the Part II opener: the part title, a short rule and the
 * chapter range. The part number and its rule only appear when the left rail, which normally
 * carries it, is not displayed.
 *
 * @param part - Part label such as "Partie II", printed before the title only under 1101 px
 * @param title - Part title such as "Lire", always printed
 * @param children - Range of chapters the part covers, printed after the title
 */
export function OpenerKicker({ part, title, children }: OpenerKickerProps) {
    return (
        <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11.5px] leading-4 font-medium tracking-[0.14em] text-muted-foreground uppercase max-[561px]:tracking-[0.1em]">
            <span className="font-semibold text-foreground min-[1101px]:hidden">{part}</span>
            <span
                aria-hidden="true"
                className="h-px w-6 flex-none bg-border-strong min-[1101px]:hidden"
            />
            <span>{title}</span>
            <span aria-hidden="true" className="h-px w-6 flex-none bg-border-strong" />
            <span>{children}</span>
        </p>
    );
}
