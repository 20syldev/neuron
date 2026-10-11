import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Tells whether the reader asked the system for reduced motion.
 *
 * @returns True under prefers-reduced-motion: reduce, false on the server and before hydration
 */
export function useReducedMotion() {
    return useMediaQuery("(prefers-reduced-motion: reduce)");
}
