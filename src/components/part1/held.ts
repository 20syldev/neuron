import { useState } from "react";

/**
 * Keeps showing the last value received while a view is paused. Used with a visibility flag so a
 * figure far from the viewport stops following the drawing and catches up on the next frame once
 * it is close again.
 *
 * @param value - Latest value of the live data
 * @param active - Whether the view should follow the live data right now
 * @returns The latest value while active, the last value seen while active otherwise
 */
export function useHeld<T>(value: T, active: boolean): T {
    const [held, setHeld] = useState(value);

    if (active && held !== value) {
        setHeld(value);
    }

    return active ? value : held;
}
