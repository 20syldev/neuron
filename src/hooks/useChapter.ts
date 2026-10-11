import { useSyncExternalStore } from "react";

import { CHAPTERS } from "@/data/chapters";

export interface ChapterPosition {
    current: number;
    progress: number;
}

// Same reference line as the mockup: 35 percent of the viewport below the compact bar
const BAR_HEIGHT = 56;
const REFERENCE_RATIO = 0.35;

const INITIAL: ChapterPosition = { current: 0, progress: 0 };
const listeners = new Set<() => void>();

let position = INITIAL;
let frame = 0;
let stop: (() => void) | null = null;

/**
 * Reads the reading position from the layout: the last chapter whose content has crossed the
 * reference line, and how far that line is through it. Publishes a new snapshot only when the
 * chapter or the rounded progress changes, so subscribers re-render once per step, not per pixel.
 */
function measure() {
    frame = 0;

    const reference = BAR_HEIGHT + (window.innerHeight - BAR_HEIGHT) * REFERENCE_RATIO;
    let current = 0;
    let progress = 0;

    for (const chapter of CHAPTERS) {
        const element = document.getElementById(chapter.id);
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        const start = rect.top + (parseFloat(getComputedStyle(element).paddingTop) || 0);
        if (start > reference) break;

        current = chapter.number;
        progress = (reference - start) / Math.max(1, rect.bottom - start);
    }

    const rounded = current ? Math.min(1, Math.max(0.1, Math.round(progress * 10) / 10)) : 0;
    if (current === position.current && rounded === position.progress) return;

    position = { current, progress: rounded };
    listeners.forEach((listener) => listener());
}

/**
 * Schedules one measurement on the next animation frame, however many events ask for it.
 */
function schedule() {
    if (!frame) frame = requestAnimationFrame(measure);
}

/**
 * Attaches the scroll, resize, hash and layout listeners shared by every subscriber.
 *
 * @returns Function that detaches them
 */
function start() {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    window.addEventListener("load", schedule);

    // Late layout changes (fonts, figures) move the chapters without any scroll event
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);

    schedule();

    return () => {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        window.removeEventListener("hashchange", schedule);
        window.removeEventListener("load", schedule);
        observer.disconnect();

        if (frame) cancelAnimationFrame(frame);
        frame = 0;
    };
}

/**
 * Registers a listener on the shared scroll spy; the first one starts it, the last one stops it.
 *
 * @param listener - Called whenever the published position changes
 * @returns Function that removes the listener
 */
function subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) stop = start();

    return () => {
        listeners.delete(listener);

        if (listeners.size === 0 && stop) {
            stop();
            stop = null;
        }
    };
}

/**
 * Scroll spy of the essay, shared by the pill, the Sommaire sheet and the compact bar. One set of
 * listeners serves every component that calls it. The server and the first client render report
 * the prologue; the measured position follows right after hydration and on every hash navigation.
 *
 * @returns The chapter being read ("current", 0 while the reader is in the prologue) and the share
 *   of it already read ("progress", in steps of 0.1 from 0.1 to 1, and 0 in the prologue)
 */
export function useChapter() {
    return useSyncExternalStore(
        subscribe,
        () => position,
        () => INITIAL,
    );
}
