import { type RefObject, useEffect, useRef, useState } from "react";

export interface NearViewport<T extends Element> {
    ref: RefObject<T | null>;
    near: boolean;
}

/**
 * Tracks whether an element is on screen or close to it, so a figure that redraws on every frame
 * can pause while it is far away from the reader.
 *
 * @param margin - Distance around the viewport that still counts as near, as a CSS margin
 * @returns The ref to attach to the watched element and whether the element is near the viewport;
 *   "near" is true before the first measurement and without IntersectionObserver, so a live
 *   figure is never left stale
 */
export function useNearViewport<T extends Element>(margin = "150px 0px"): NearViewport<T> {
    const ref = useRef<T>(null);
    const [near, setNear] = useState(true);

    useEffect(() => {
        const element = ref.current;

        if (!element || typeof IntersectionObserver === "undefined") {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => setNear(entries[entries.length - 1].isIntersecting),
            { rootMargin: margin },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [margin]);

    return { ref, near };
}
