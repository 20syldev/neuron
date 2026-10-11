import { type Ch06Arc, type Ch06Tone } from "./Ch06Layout";

const TONE_CLASS: Record<Ch06Tone, string> = {
    strong: "stroke-signal",
    medium: "stroke-muted-foreground",
    faint: "stroke-border-strong",
};

export interface Ch06ArcsProps {
    arcs: readonly Ch06Arc[];
}

/**
 * The arcs of an attention graph, one open path per word with its stroke width carrying the
 * weight; shared by the wide and the phone layouts.
 *
 * @param arcs - Arcs of the graph in drawing order, so the last ones lie on top
 */
export function Ch06Arcs({ arcs }: Ch06ArcsProps) {
    return (
        <>
            {arcs.map((arc, index) => (
                <path
                    key={index}
                    d={arc.path}
                    fill="none"
                    strokeWidth={arc.width}
                    strokeLinecap="round"
                    className={TONE_CLASS[arc.tone]}
                />
            ))}
        </>
    );
}
