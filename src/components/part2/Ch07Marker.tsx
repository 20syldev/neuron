import { type ShapeKind } from "@/lib/figures";
import { cn } from "@/lib/utils";

const KIND_CLASS: Record<ShapeKind, { small: string; large: string }> = {
    circle: { small: "size-3 rounded-full bg-query", large: "size-5 rounded-full bg-query" },
    square: { small: "size-3 bg-key", large: "size-[18px] bg-key" },
    diamond: {
        small: "m-0.5 size-2 rotate-45 bg-value",
        large: "m-[3px] size-4 rotate-45 bg-value",
    },
};

export interface Ch07MarkerProps {
    kind: ShapeKind;
    large?: boolean;
}

/**
 * Small solid shape that names a kind of vector in the plate: it sits beside the title of a
 * vector row and in the legend. It is decorative, the text next to it carries the name.
 *
 * @param kind - Shape of the vector kind: circle for a query, square for a key, diamond for a value
 * @param large - Draws the legend size instead of the smaller size printed beside a vector title, false by default
 */
export function Ch07Marker({ kind, large = false }: Ch07MarkerProps) {
    return (
        <span
            aria-hidden="true"
            className={cn("inline-block flex-none", KIND_CLASS[kind][large ? "large" : "small"])}
        />
    );
}
