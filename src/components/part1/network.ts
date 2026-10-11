import { HIDDEN_SIZE, INPUT_SIZE, OUTPUT_SIZE } from "@/lib/mlp";

export const INPUT_SIDE = 28;

export const HIDDEN_SIDE = 16;

export const LAYER_PARAMS = {
    first: INPUT_SIZE * HIDDEN_SIZE + HIDDEN_SIZE,
    second: HIDDEN_SIZE * HIDDEN_SIZE + HIDDEN_SIZE,
    output: HIDDEN_SIZE * OUTPUT_SIZE + OUTPUT_SIZE,
};

export const TOTAL_PARAMS = LAYER_PARAMS.first + LAYER_PARAMS.second + LAYER_PARAMS.output;

export const DIGITS = Array.from({ length: OUTPUT_SIZE }, (_, digit) => digit);

export const CONFIDENCE_CAP = 0.999;
