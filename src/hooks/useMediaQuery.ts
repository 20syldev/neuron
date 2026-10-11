import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query. The server snapshot is false, so the first client render matches the
 * server markup and the real value arrives right after hydration.
 *
 * @param query - Media query text, such as "(max-width: 760px)"
 * @returns Whether the query currently matches
 */
export function useMediaQuery(query: string) {
    const subscribe = useCallback(
        (notify: () => void) => {
            const list = window.matchMedia(query);
            list.addEventListener("change", notify);

            return () => list.removeEventListener("change", notify);
        },
        [query],
    );

    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(query).matches,
        () => false,
    );
}
