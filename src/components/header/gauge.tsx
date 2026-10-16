"use client";

import { useEffect } from "react";

/**
 * Invisible component that measures the rendered masthead and writes its height, in px, to the
 * --mh custom property of the "top" wrapper. The scroll-driven cross-fade of the compact bar is
 * timed by --mh, whose CSS default is only an estimate that breaks when the tagline wraps on more
 * lines than expected on a narrow phone. It follows font loading and language changes through a
 * ResizeObserver.
 */
export function MastheadGauge() {
    useEffect(() => {
        const masthead = document.getElementById("masthead");
        const root = document.getElementById("top");
        if (!masthead || !root) return;

        const write = () => root.style.setProperty("--mh", `${masthead.offsetHeight}px`);
        const observer = new ResizeObserver(write);

        observer.observe(masthead);
        write();

        return () => {
            observer.disconnect();
            root.style.removeProperty("--mh");
        };
    }, []);

    return null;
}
