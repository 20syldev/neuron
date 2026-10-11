"use client";

import { ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type KeyboardEvent, memo, type MouseEvent, type ReactNode, useMemo } from "react";

import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useDigit, useNeuron } from "./DigitProvider";
import { Dimension } from "./Dimension";
import { activeCount, normalize, SCALES } from "./halftone";
import { InkField } from "./InkField";
import { DIGITS, HIDDEN_SIDE, INPUT_SIDE, LAYER_PARAMS } from "./network";
import { Swatch } from "./Swatch";

export interface LayerProps {
    className: string;
    title: string;
    sub: string;
    foot: ReactNode;
    children: ReactNode;
}

export interface LinkProps {
    parameters: number;
    activation: string;
}

const EMPTY = new Float32Array(HIDDEN_SIDE * HIDDEN_SIDE);

const LAYER_STEPS: Record<string, [number, number]> = {
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
};

const MONO_NOTE = "text-center font-mono text-[10.5px] leading-[1.3] text-muted-foreground";

/**
 * Column of the network strip: a head with the name and the size of the layer, its figure and a
 * foot line.
 *
 * @param className - Classes that give the column its width
 * @param title - Name of the layer, in the bold line of the column head
 * @param sub - Mono line under the name, such as the number of neurons
 * @param foot - Row under the figure: its dimension, a tag or nothing
 * @param children - Figure of the layer, 176 px high so the columns line up with the links
 */
function Layer({ className, title, sub, foot, children }: LayerProps) {
    return (
        <div className={cn("flex flex-none flex-col gap-3", className)}>
            <div className="h-10">
                <p className="m-0 text-sm leading-5 font-semibold">{title}</p>
                <p className="m-0 font-mono text-[11px] leading-[18px] text-muted-foreground">
                    {sub}
                </p>
            </div>
            {children}
            {foot}
        </div>
    );
}

/**
 * Stretchy column between two layers: the number of parameters, an arrow and the activation.
 * Memoised, its props never change.
 *
 * @param parameters - Number of parameters between the two layers, written above the arrow with
 *   the locale grouping
 * @param activation - Activation applied after the layer, written under the arrow
 */
const Link = memo(function Link({ parameters, activation }: LinkProps) {
    const t = useTranslations("part1.ch3");
    const locale = useLocale();

    return (
        <div className="flex min-w-24 flex-[1_1_96px] flex-col gap-3">
            <div className="h-10" />
            <div className="flex h-44 flex-col justify-center gap-2">
                <span className={MONO_NOTE}>
                    {t("params", { count: formatNumber(locale, parameters) })}
                </span>
                <div aria-hidden="true" className="flex items-center text-border-strong">
                    <span className="h-px flex-[1_1_0] bg-border-strong" />
                    <ChevronRight size={14} strokeWidth={2} className="-ml-[5px] flex-none" />
                </div>
                <span className={MONO_NOTE}>{activation}</span>
            </div>
        </div>
    );
});

/**
 * Picks the neuron under a click on a 16 x 16 layer figure.
 *
 * @param event - Click event of the figure wrapper
 * @returns The row-major index of the cell under the pointer, 0 to 255
 */
function neuronAt(event: MouseEvent<HTMLElement>): number {
    const box = event.currentTarget.getBoundingClientRect();
    const col = Math.floor(((event.clientX - box.left) / box.width) * HIDDEN_SIDE);
    const row = Math.floor(((event.clientY - box.top) / box.height) * HIDDEN_SIDE);
    const clamp = (cell: number) => Math.min(HIDDEN_SIDE - 1, Math.max(0, cell));

    return clamp(row) * HIDDEN_SIDE + clamp(col);
}

/**
 * Moves the selected neuron of a 16 x 16 layer figure by one cell with an arrow key.
 *
 * @param neuron - Row-major index of the selected neuron, 0 to 255
 * @param key - Value of the key event
 * @returns The index of the neighbour cell, clamped to the figure, or null for any other key
 */
function neuronAfter(neuron: number, key: string): number | null {
    const step = LAYER_STEPS[key];

    if (!step) {
        return null;
    }

    const clamp = (cell: number) => Math.min(HIDDEN_SIDE - 1, Math.max(0, cell));
    const row = clamp(Math.floor(neuron / HIDDEN_SIDE) + step[0]);
    const col = clamp((neuron % HIDDEN_SIDE) + step[1]);

    return row * HIDDEN_SIDE + col;
}

/**
 * Input column: the drawing at 6 px per pixel.
 */
function InputColumn() {
    const t = useTranslations("part1.ch3.input");
    const { input } = useDigit();

    return (
        <Layer
            className="w-[168px]"
            title={t("title")}
            sub={t("sub")}
            foot={<Dimension label={t("size")} className="h-4" />}
        >
            <div className="flex h-44 items-center">
                <InkField values={input} side={INPUT_SIDE} scale={SCALES.mini} label={t("label")} />
            </div>
        </Layer>
    );
}

/**
 * First hidden layer column: the 16 x 16 activations with the neuron under inspection ringed in
 * orange. A click on the figure selects the neuron under the pointer.
 */
function FirstColumn() {
    const t = useTranslations("part1.ch3");
    const { inference } = useDigit();
    const { neuron, best, selectNeuron } = useNeuron();
    const values = useMemo(() => (inference ? normalize(inference.hidden1) : EMPTY), [inference]);

    return (
        <Layer
            className="w-44"
            title={t("hidden1.title")}
            sub={t("hidden1.sub", { active: inference ? activeCount(inference.hidden1) : 0 })}
            foot={
                <div className="flex h-4 items-center justify-between font-mono text-[10.5px] leading-none">
                    <span className="text-muted-foreground">{t("layerSize")}</span>
                    <span className="inline-flex items-center gap-1.5 text-signal-ink">
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-signal" />
                        {t("neuron", { neuron })}
                    </span>
                </div>
            }
        >
            <div
                role="application"
                aria-label={t("hidden1.pick")}
                tabIndex={0}
                onClick={(event) => selectNeuron(neuronAt(event))}
                onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                    const next = neuronAfter(neuron, event.key);

                    if (next !== null) {
                        event.preventDefault();
                        selectNeuron(next);
                    }
                }}
                className="h-44 cursor-pointer"
            >
                <InkField
                    values={values}
                    side={HIDDEN_SIDE}
                    scale={SCALES.layer}
                    highlight={neuron}
                    label={t(neuron === best ? "hidden1.labelBest" : "hidden1.labelPicked", {
                        neuron,
                    })}
                />
            </div>
        </Layer>
    );
}

/**
 * Second hidden layer column: the 16 x 16 activations.
 */
function SecondColumn() {
    const t = useTranslations("part1.ch3");
    const { inference } = useDigit();
    const values = useMemo(() => (inference ? normalize(inference.hidden2) : EMPTY), [inference]);

    return (
        <Layer
            className="w-44"
            title={t("hidden2.title")}
            sub={t("hidden2.sub", { active: inference ? activeCount(inference.hidden2) : 0 })}
            foot={
                <div className="flex h-4 items-center font-mono text-[10.5px] leading-none text-muted-foreground">
                    {t("layerSize")}
                </div>
            }
        >
            <div className="h-44">
                <InkField
                    values={values}
                    side={HIDDEN_SIDE}
                    scale={SCALES.layer}
                    label={t("hidden2.label")}
                />
            </div>
        </Layer>
    );
}

/**
 * Output column: one dot per digit, orange for the predicted one, its area following the
 * probability.
 */
function OutputColumn() {
    const t = useTranslations("part1.ch3.output");
    const { inference, digit, confidence } = useDigit();
    const probs = inference ? inference.probs : null;

    return (
        <Layer className="w-21" title={t("title")} sub={t("sub")} foot={<div className="h-4" />}>
            <div
                role="img"
                aria-label={
                    digit === null
                        ? t("labelNone")
                        : t(confidence > 0.9 ? "labelSure" : "label", { digit })
                }
                className="grid h-44 grid-rows-10"
            >
                {DIGITS.map((index) => {
                    const probability = probs ? probs[index] : 0;
                    const top = digit === index;
                    const faint = probability < 0.02;

                    return (
                        <div key={index} className="flex items-center gap-2.5">
                            <span
                                className={cn(
                                    "w-2.5 font-mono text-[11px] leading-none",
                                    top ? "font-semibold text-signal-ink" : "text-muted-foreground",
                                )}
                            >
                                {index}
                            </span>
                            <Swatch
                                box={16}
                                diameter={faint ? 1.5 : Math.max(3, 13 * Math.sqrt(probability))}
                                tone={top ? "signal" : faint ? "faint" : "ink"}
                            />
                        </div>
                    );
                })}
            </div>
        </Layer>
    );
}

/**
 * Body of figure 3: the network as a strip of five columns, the 28 x 28 input, the two 16 x 16
 * hidden layers and the ten outputs, joined by the parameter counts. Every column reads the live
 * inference itself, so the strip does not re-render as a whole while the reader draws.
 */
export function Strip() {
    const t = useTranslations("part1.ch3");

    return (
        <div className="flex flex-wrap items-start gap-x-4 gap-y-6">
            <InputColumn />
            <Link parameters={LAYER_PARAMS.first} activation={t("relu")} />
            <FirstColumn />
            <Link parameters={LAYER_PARAMS.second} activation={t("relu")} />
            <SecondColumn />
            <Link parameters={LAYER_PARAMS.output} activation={t("softmax")} />
            <OutputColumn />
        </div>
    );
}
