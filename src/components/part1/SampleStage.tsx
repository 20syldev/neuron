"use client";

import { type ReactNode } from "react";

import { useSampleTrigger } from "@/hooks/useSampleTrigger";

import { useDigit } from "./DigitProvider";

export interface SampleStageProps {
    children: ReactNode;
}

/**
 * Wrapper of the whole of Part I that makes the pad draw samples by itself while the reader
 * leaves it untouched: the drawing starts when the section appears, so the poster of the opener
 * and every live figure have something to show from the first screen.
 *
 * @param children - The opener and the chapters of Part I, inside the DigitProvider
 */
export function SampleStage({ children }: SampleStageProps) {
    const { armed, playSample } = useDigit();
    const stage = useSampleTrigger<HTMLDivElement>(armed, playSample);

    return <div ref={stage}>{children}</div>;
}
