"use client";

import { useLocale, useTranslations } from "next-intl";
import { type KeyboardEvent, memo, type PointerEvent, useMemo, useState } from "react";

import { useNearViewport } from "@/hooks/useNearViewport";
import { formatNumber } from "@/lib/format";

import { CropMarks } from "./CropMarks";
import { useDigit } from "./DigitProvider";
import { SCALES } from "./halftone";
import { useHeld } from "./held";
import { InkField } from "./InkField";
import {
    bestWindow,
    clampWindow,
    frameOrigin,
    type LoupeWindow,
    WINDOW_SIZE,
    windowAround,
} from "./loupe";
import { INPUT_SIDE } from "./network";
import { Swatch } from "./Swatch";

export interface LoupeCellProps {
    value: number;
}

const PITCH = SCALES.grid.pitch;

const GRID_LEFT = 16;

const DETAIL_LEFT = 404;

const DETAIL_TOP = 22;

const DETAIL_BOTTOM = 286;

const BOX = WINDOW_SIZE * PITCH;

const KEY_STEPS: Record<string, [number, number]> = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
};

/**
 * One pixel of the enlarged detail: its dot at 24 px scale and its value as a number, "0" for the
 * background and "1" for full ink.
 *
 * @param value - Value of the pixel, 0 for the background to 1 for full ink
 */
const LoupeCell = memo(function LoupeCell({ value }: LoupeCellProps) {
    const locale = useLocale();
    const faint = value < 0.02;
    const label = value === 0 || value === 1 ? String(value) : formatNumber(locale, value, 2);

    return (
        <div className="flex flex-col items-center justify-center gap-[3px] bg-card">
            <Swatch
                box={24}
                diameter={faint ? 2.5 : Math.max(4, 24 * Math.sqrt(value))}
                tone={faint ? "faint" : "ink"}
            />
            <span className="font-mono text-[10px] leading-none text-muted-foreground">
                {label}
            </span>
        </div>
    );
});

/**
 * Figure 2: the 28 x 28 input as a halftone grid with the dashed 20 x 20 frame, and a 6 x 6
 * window of it enlarged to the right with the value of every pixel. The window sits on the most
 * telling pixels of the drawing until the reader moves it, by hovering or tapping the image or
 * with the arrow keys. The leader lines between the window and its enlargement hide on a phone.
 */
export function Loupe() {
    const t = useTranslations("part1.ch2");
    const { input: live } = useDigit();
    const { ref, near } = useNearViewport<HTMLDivElement>();
    const input = useHeld(live, near);
    const best = useMemo(() => bestWindow(input), [input]);
    const frame = useMemo(() => frameOrigin(input), [input]);
    const [picked, setPicked] = useState<LoupeWindow | null>(null);
    const origin = picked ?? best;
    const cells = useMemo(() => {
        const values: number[] = [];

        for (let row = origin.row; row < origin.row + WINDOW_SIZE; row++) {
            for (let col = origin.col; col < origin.col + WINDOW_SIZE; col++) {
                values.push(input[row * INPUT_SIDE + col]);
            }
        }

        return values;
    }, [input, origin.row, origin.col]);

    const pick = (next: LoupeWindow) => {
        setPicked((previous) =>
            previous && previous.row === next.row && previous.col === next.col ? previous : next,
        );
    };

    const onPointer = (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType !== "mouse" && event.type === "pointermove") {
            return;
        }

        const box = event.currentTarget.getBoundingClientRect();
        const col = Math.floor(((event.clientX - box.left) / box.width) * INPUT_SIDE);
        const row = Math.floor(((event.clientY - box.top) / box.height) * INPUT_SIDE);

        pick(windowAround(row, col));
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const step = KEY_STEPS[event.key];

        if (step) {
            event.preventDefault();
            pick(clampWindow({ row: origin.row + step[0], col: origin.col + step[1] }));
        }
    };

    const left = GRID_LEFT + origin.col * PITCH;
    const top = origin.row * PITCH;

    return (
        <div
            ref={ref}
            className="relative h-[min(308px,calc(100vw-48px))] w-[668px] max-w-full min-[761px]:h-[308px]"
        >
            <div className="absolute top-0 left-4 aspect-square w-[min(308px,calc(100%-16px))]">
                <div
                    role="application"
                    aria-label={`${t("gridLabel")} ${t("gridHint")}`}
                    tabIndex={0}
                    onPointerMove={onPointer}
                    onPointerDown={onPointer}
                    onKeyDown={onKeyDown}
                    className="size-full cursor-crosshair"
                >
                    <InkField
                        values={input}
                        side={INPUT_SIDE}
                        scale={SCALES.grid}
                        className="size-full"
                    />
                </div>
                <div
                    aria-hidden="true"
                    style={{
                        top: `${(frame.row / INPUT_SIDE) * 100}%`,
                        left: `${(frame.col / INPUT_SIDE) * 100}%`,
                    }}
                    className="pointer-events-none absolute size-[calc(100%*20/28)] border border-dashed border-border-strong"
                >
                    <span className="absolute -top-2 left-[5px] bg-background px-1 font-mono text-[10px] leading-[14px] text-muted-foreground">
                        {t("frame")}
                    </span>
                </div>
                <CropMarks />
            </div>
            <svg
                width={668}
                height={308}
                viewBox="0 0 668 308"
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 hidden overflow-visible min-[761px]:block"
            >
                <path
                    d={`M${left + BOX} ${top}L${DETAIL_LEFT} ${DETAIL_TOP}M${left + BOX} ${top + BOX}L${DETAIL_LEFT} ${DETAIL_BOTTOM}`}
                    fill="none"
                    strokeWidth={1}
                    className="stroke-border-strong"
                />
                <rect
                    x={left}
                    y={top}
                    width={BOX}
                    height={BOX}
                    fill="none"
                    strokeWidth={1.25}
                    className="stroke-foreground"
                />
            </svg>
            <span className="absolute top-0 left-[404px] hidden font-mono text-[10.5px] leading-[14px] text-muted-foreground min-[761px]:block">
                {t("detail", {
                    rowFrom: origin.row + 1,
                    rowTo: origin.row + WINDOW_SIZE,
                    colFrom: origin.col + 1,
                    colTo: origin.col + WINDOW_SIZE,
                })}
            </span>
            <div
                role="img"
                aria-label={t("detailLabel")}
                className="absolute top-[22px] left-[404px] hidden size-[264px] grid-cols-6 grid-rows-6 gap-px border border-foreground bg-border min-[761px]:grid"
            >
                {cells.map((value, index) => (
                    <LoupeCell key={index} value={value} />
                ))}
            </div>
        </div>
    );
}
