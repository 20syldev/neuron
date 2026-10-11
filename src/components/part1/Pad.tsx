"use client";

import { Eraser, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
    type KeyboardEvent,
    memo,
    type PointerEvent,
    type ReactNode,
    useEffect,
    useId,
    useRef,
    useState,
} from "react";

import { type Point, type Stroke } from "@/lib/digit";
import { cn } from "@/lib/utils";

import { CropMarks } from "./CropMarks";
import { useDigit } from "./DigitProvider";
import {
    BRUSH,
    CELL,
    PAD_GRID_PATH,
    PAD_SIZE,
    padBox,
    type PadBox,
    padPoint,
    strokePath,
} from "./pad";

export interface PadButtonProps {
    onClick: () => void;
    disabled: boolean;
    children: ReactNode;
}

export interface StrokePathProps {
    stroke: Stroke;
}

const KEY_STEPS: Record<string, Point> = {
    ArrowLeft: { x: -CELL, y: 0 },
    ArrowRight: { x: CELL, y: 0 },
    ArrowUp: { x: 0, y: -CELL },
    ArrowDown: { x: 0, y: CELL },
};

/**
 * One stroke of the pad as a smooth round-capped path. Memoised on the stroke, whose array keeps
 * its identity once the pointer has moved on, so only the stroke being drawn is rebuilt.
 *
 * @param stroke - Points of the stroke, in pad coordinates of the 336 unit square
 */
const StrokePath = memo(function StrokePath({ stroke }: StrokePathProps) {
    return (
        <path
            d={strokePath(stroke)}
            fill="none"
            strokeWidth={BRUSH}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-foreground"
        />
    );
});

/**
 * Outlined action button of the pad card: 36 px high, 40 px on a phone, with an icon and a label.
 *
 * @param onClick - Click handler, with no argument
 * @param disabled - Disables the button, for an action with nothing to act on
 * @param children - Icon and label, the icon coming first
 */
function PadButton({ onClick, disabled, children }: PadButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[3px] border border-border-strong bg-transparent pr-3.5 pl-3 text-sm font-medium text-foreground transition-colors hover:border-border-strong hover:bg-muted disabled:cursor-default disabled:opacity-45 disabled:hover:bg-transparent max-[760px]:min-h-10"
        >
            {children}
        </button>
    );
}

/**
 * Drawing pad of chapter 1: a 336 unit SVG square with a 28 x 28 dot grid that records strokes from
 * mouse, touch or pen pointers (pointer capture, no scrolling gesture), draws them as smooth round
 * strokes and hands them to the DigitProvider. It is also drivable from the keyboard: Enter lifts
 * or puts down a pen that the arrow keys move one cell at a time. Two buttons clear the pad or
 * remove the last stroke.
 */
export function Pad() {
    const t = useTranslations("part1.pad");
    const { strokes, empty, begin, extend, end, undo, clear } = useDigit();
    const hintId = useId();
    const activePointer = useRef<number | null>(null);
    const box = useRef<PadBox | null>(null);
    const [pen, setPen] = useState<Point>({ x: PAD_SIZE / 2, y: PAD_SIZE / 2 });
    const [penDown, setPenDown] = useState(false);
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        const forget = () => {
            box.current = null;
        };

        window.addEventListener("scroll", forget, { capture: true, passive: true });
        window.addEventListener("resize", forget, { passive: true });

        return () => {
            window.removeEventListener("scroll", forget, { capture: true });
            window.removeEventListener("resize", forget);
        };
    }, []);

    const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
        if (
            activePointer.current !== null ||
            (event.pointerType === "mouse" && event.button !== 0)
        ) {
            return;
        }

        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        activePointer.current = event.pointerId;
        box.current = padBox(event.currentTarget);
        begin(padPoint(box.current, event.clientX, event.clientY));
    };

    const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
        if (event.pointerId !== activePointer.current) {
            return;
        }

        const samples = event.nativeEvent.getCoalescedEvents?.() ?? [];
        box.current ??= padBox(event.currentTarget);

        for (const sample of samples.length ? samples : [event.nativeEvent]) {
            extend(padPoint(box.current, sample.clientX, sample.clientY));
        }
    };

    const onPointerEnd = (event: PointerEvent<SVGSVGElement>) => {
        if (event.pointerId !== activePointer.current) {
            return;
        }

        activePointer.current = null;
        box.current = null;
        end();
    };

    const liftPen = () => {
        if (penDown) {
            setPenDown(false);
            end();
        }
    };

    const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
        const step = KEY_STEPS[event.key];

        if (step) {
            event.preventDefault();

            const next = {
                x: Math.min(PAD_SIZE, Math.max(0, pen.x + step.x)),
                y: Math.min(PAD_SIZE, Math.max(0, pen.y + step.y)),
            };

            setPen(next);

            if (penDown) {
                extend(next);
            }
        } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            if (penDown) {
                liftPen();
            } else {
                setPenDown(true);
                begin(pen);
            }
        } else if (event.key === "Escape") {
            liftPen();
        }
    };

    return (
        <div className="group/pad min-w-0 flex-[0_1_386px] rounded-lg border border-border bg-card px-6 pt-[18px] pb-6">
            <div className="mb-[26px] flex items-baseline justify-between gap-3 text-[13px] text-muted-foreground">
                <span>{t("tools")}</span>
                <span className="font-mono text-[11px]">{t("size")}</span>
            </div>
            <div className="relative mx-auto aspect-square w-[336px] max-w-full">
                <svg
                    viewBox={`0 0 ${PAD_SIZE} ${PAD_SIZE}`}
                    role="application"
                    aria-label={t("label")}
                    aria-describedby={hintId}
                    tabIndex={0}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerEnd}
                    onPointerCancel={onPointerEnd}
                    onKeyDown={onKeyDown}
                    onFocus={(event) => setFocused(event.currentTarget.matches(":focus-visible"))}
                    onBlur={() => {
                        setFocused(false);
                        liftPen();
                    }}
                    className="block h-auto w-full cursor-crosshair touch-none rounded-[1px] select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                    <path
                        d={PAD_GRID_PATH}
                        fill="none"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeDasharray="0 12"
                        className="stroke-grid"
                    />
                    {strokes.map((stroke, index) => (
                        <StrokePath key={index} stroke={stroke} />
                    ))}
                    {focused ? (
                        <circle
                            cx={pen.x}
                            cy={pen.y}
                            r={BRUSH / 2}
                            fill="none"
                            strokeWidth={2}
                            className={cn("stroke-signal", penDown && "fill-signal/25")}
                        />
                    ) : null}
                </svg>
                {empty ? (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                        {t("empty")}
                    </span>
                ) : null}
                <p
                    id={hintId}
                    className={cn(
                        "pointer-events-none absolute inset-x-0 top-[calc(100%+17px)] m-0 text-center text-[11px] leading-3 text-muted-foreground",
                        !focused && "opacity-0",
                    )}
                >
                    {t("hint")}
                </p>
                <CropMarks />
            </div>
            <div className="mt-[30px] flex flex-wrap gap-2">
                <PadButton onClick={clear} disabled={empty}>
                    <Eraser aria-hidden="true" size={16} strokeWidth={2} />
                    {t("clear")}
                </PadButton>
                <PadButton onClick={undo} disabled={empty}>
                    <Undo2 aria-hidden="true" size={16} strokeWidth={2} />
                    {t("undo")}
                </PadButton>
            </div>
        </div>
    );
}
