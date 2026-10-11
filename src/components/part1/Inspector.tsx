"use client";

import { ChevronLeft, ChevronRight, Crosshair } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useMemo } from "react";

import { formatNumber } from "@/lib/format";
import { fieldOf } from "@/lib/mlp";
import { cn } from "@/lib/utils";

import { CropMarks } from "./CropMarks";
import { useDigit, useNeuron } from "./DigitProvider";
import { Eyebrow } from "./Eyebrow";
import { SCALES } from "./halftone";
import { DISPLAY } from "./layout";
import { INPUT_SIDE } from "./network";
import { Swatch } from "./Swatch";
import { WeightField } from "./WeightField";

export interface StepButtonProps {
    label: string;
    onClick: () => void;
    children: ReactNode;
}

const EMPTY = new Float32Array(INPUT_SIDE * INPUT_SIDE);

const SCALE_VALUES = [-1, -0.5, -0.25, 0, 0.25, 0.5, 1];

const NEURON_COUNT = 256;

/**
 * Number of decimals needed to write a tick of the weight scale: none for a whole number, one
 * for a half, two for a quarter.
 *
 * @param value - Tick of the scale, a multiple of a quarter
 * @returns 0, 1 or 2
 */
function tickDigits(value: number): number {
    if (Number.isInteger(value)) {
        return 0;
    }

    return Number.isInteger(value * 2) ? 1 : 2;
}

/**
 * Square outlined icon button of the inspector header, 32 px and 40 px on a phone.
 *
 * @param label - Accessible name of the button, since it only shows an icon
 * @param onClick - Called when the button is pressed
 * @param children - Icon of the button
 */
function StepButton({ label, onClick, children }: StepButtonProps) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-[3px] border border-border bg-transparent text-foreground transition-colors hover:border-border-strong hover:bg-muted max-[760px]:size-10"
        >
            {children}
        </button>
    );
}

/**
 * Title of the inspector with the previous and next buttons, the position counter and the button
 * that goes back to the most active neuron once another one has been picked.
 */
function InspectorHeader() {
    const t = useTranslations("part1.ch4");
    const { neuron, best, selectNeuron } = useNeuron();

    return (
        <div className="mb-9 flex flex-wrap items-start justify-between gap-4">
            <div>
                <Eyebrow className="mb-2.5">{t("eyebrow")}</Eyebrow>
                <h4
                    id="neuron-t"
                    className={`${DISPLAY} m-0 flex items-center gap-3 text-[28px] leading-[1.1] font-semibold tracking-[-0.02em]`}
                >
                    <span aria-hidden="true" className="size-3 flex-none rounded-full bg-signal" />
                    {t("title", { neuron })}
                </h4>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
                <StepButton label={t("previous")} onClick={() => selectNeuron(neuron - 1)}>
                    <ChevronLeft aria-hidden="true" size={16} strokeWidth={2} />
                </StepButton>
                <span
                    aria-live="polite"
                    className="min-w-[72px] text-center font-mono text-xs text-muted-foreground"
                >
                    {t("counter", { neuron, total: NEURON_COUNT })}
                </span>
                <StepButton label={t("next")} onClick={() => selectNeuron(neuron + 1)}>
                    <ChevronRight aria-hidden="true" size={16} strokeWidth={2} />
                </StepButton>
                {neuron === best ? null : (
                    <button
                        type="button"
                        onClick={() => selectNeuron(null)}
                        className="ml-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[3px] border border-border bg-transparent px-2.5 text-[13px] font-medium text-foreground transition-colors hover:border-border-strong hover:bg-muted max-[760px]:min-h-10"
                    >
                        <Crosshair aria-hidden="true" size={14} strokeWidth={2} />
                        {t("follow")}
                    </button>
                )}
            </div>
        </div>
    );
}

/**
 * The 784 weights of the selected neuron as a diverging halftone field. Redrawn only when the
 * neuron or the model changes.
 */
function NeuronField() {
    const t = useTranslations("part1.ch4");
    const { model, neuron } = useNeuron();
    const field = useMemo(() => (model ? fieldOf(model, neuron) : EMPTY), [model, neuron]);

    return (
        <div className="relative ml-3.5 size-[280px] max-w-full flex-none">
            <WeightField
                values={field}
                side={INPUT_SIDE}
                scale={SCALES.weights}
                label={t("fieldLabel", { neuron })}
            />
            <CropMarks />
        </div>
    );
}

/**
 * Activation of the selected neuron for the current drawing, scaled to the most active neuron of
 * the layer, with a short reading of what the value means. The reading also carries the loading
 * and error states of the weights, so the inspector keeps its height while they download.
 */
function Activation() {
    const t = useTranslations("part1.ch4");
    const locale = useLocale();
    const { inference } = useDigit();
    const { neuron, best, status } = useNeuron();
    const peak = useMemo(() => (inference ? Math.max(...inference.hidden1) : 0), [inference]);
    const value = inference && peak > 0 ? inference.hidden1[neuron] / peak : 0;

    let reading = t("activation.none");

    if (status !== "ready") {
        reading = t(`status.${status}`);
    } else if (inference) {
        reading = t(`activation.${neuron === best ? "best" : value > 0 ? "some" : "off"}`);
    }

    return (
        <div className="border-t border-border pt-[18px]">
            <Eyebrow className="leading-normal">{t("activation.label")}</Eyebrow>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
                <span className="font-mono text-[44px] leading-none font-medium tracking-[-0.04em]">
                    {formatNumber(locale, value, 2)}
                </span>
                <span
                    role={status === "error" ? "alert" : undefined}
                    className={cn(
                        "text-[13px]",
                        status === "error" ? "text-destructive" : "text-muted-foreground",
                    )}
                >
                    {reading}
                </span>
            </div>
        </div>
    );
}

/**
 * Neuron inspector of chapter 4: the 784 weights of one first layer neuron redrawn on the 28 x 28
 * grid of the image (filled dots excite, rings inhibit), the legend of that scale, and the
 * activation of the neuron for the current drawing. Previous and next buttons walk through the
 * 256 neurons; the neuron follows the most active one until the reader picks another. The static
 * frame is not rendered again while the reader draws, only the activation reading is.
 */
export function Inspector() {
    const t = useTranslations("part1.ch4");
    const locale = useLocale();

    return (
        <article
            aria-labelledby="neuron-t"
            className="min-w-0 rounded-lg border border-border bg-card px-7 pt-6 pb-8 min-[1081px]:col-[2/4]"
        >
            <InspectorHeader />
            <div className="flex flex-wrap items-start gap-x-14 gap-y-10">
                <NeuronField />
                <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-6">
                    <div>
                        <p className="m-0 mb-1.5 text-base font-semibold">{t("seeks")}</p>
                        <p className="m-0 text-sm leading-[1.55] text-muted-foreground">
                            {t("seeksText")}
                        </p>
                    </div>
                    <div>
                        <div
                            role="img"
                            aria-label={t("scaleLabel")}
                            className="grid grid-cols-7 border-b border-border pb-2.5"
                        >
                            {SCALE_VALUES.map((value) => (
                                <div key={value} className="flex flex-col items-center gap-2">
                                    <Swatch
                                        box={24}
                                        diameter={
                                            value === 0 ? 1.5 : 22 * Math.sqrt(Math.abs(value))
                                        }
                                        tone={value === 0 ? "faint" : "ink"}
                                        ring={value < 0 ? 1.25 : undefined}
                                    />
                                    <span className="font-mono text-[10.5px] leading-[14px] text-muted-foreground">
                                        {formatNumber(locale, value, tickDigits(value))}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 flex justify-between gap-3 text-[13px]">
                            <span>{t("inhibitory")}</span>
                            <span>{t("excitatory")}</span>
                        </div>
                    </div>
                    <Activation />
                </div>
            </div>
        </article>
    );
}
