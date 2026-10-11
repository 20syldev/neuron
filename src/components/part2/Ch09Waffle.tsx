import { WAFFLE_DOTS } from "@/lib/attention";
import { cn } from "@/lib/utils";

export interface Ch09WaffleProps {
    first: number;
    second: number;
    label: string;
    scale: string;
}

/**
 * The recipe of chapter 9 as a 10 x 10 waffle: one dot per percent, filled in reading order with the
 * heaviest word first, the second next and every other word in the muted tone. A scale line
 * under it ties the hundred dots to 100 percent.
 *
 * @param first - Dots given to the heaviest word, drawn in the signal colour
 * @param second - Dots given to the second heaviest word, drawn in the foreground colour, the remaining dots being muted
 * @param label - Accessible description of how the dots are shared, read in place of the 100 dots
 * @param scale - Caption of the scale line printed under the waffle
 */
export function Ch09Waffle({ first, second, label, scale }: Ch09WaffleProps) {
    return (
        <div className="mx-auto min-w-[200px] flex-[0_1_300px]">
            <div className="relative w-full max-w-[300px]">
                <div
                    role="img"
                    aria-label={label}
                    className="grid aspect-square w-full grid-cols-10"
                >
                    {Array.from({ length: WAFFLE_DOTS }, (_, index) => (
                        <span
                            key={index}
                            className="flex aspect-square min-w-0 items-center justify-center"
                        >
                            <span
                                className={cn(
                                    "block aspect-square w-4/5 flex-none rounded-full",
                                    index < first
                                        ? "bg-signal"
                                        : index < first + second
                                          ? "bg-foreground"
                                          : "bg-muted-foreground",
                                )}
                            />
                        </span>
                    ))}
                </div>
            </div>
            <div aria-hidden="true" className="mt-4 flex max-w-[300px] items-center">
                <span className="h-[7px] w-px flex-none bg-border-strong" />
                <span className="h-px flex-[1_1_0] bg-border-strong" />
                <span className="px-2 font-mono text-[10.5px] leading-none whitespace-nowrap text-muted-foreground">
                    {scale}
                </span>
                <span className="h-px flex-[1_1_0] bg-border-strong" />
                <span className="h-[7px] w-px flex-none bg-border-strong" />
            </div>
        </div>
    );
}
