"use client";

import { useEffect, useState } from "react";

import { loadModel, type Model } from "@/lib/mlp";

export interface ModelState {
    model: Model | null;
    status: "loading" | "ready" | "error";
}

/**
 * Loads the digit network once and shares it between every component that asks.
 *
 * The download itself is cached in lib/mlp, so remounting or using the hook from several
 * components never fetches twice.
 *
 * @returns The model, null until the download has succeeded, with its status: "loading" until the
 *   weights arrive, then "ready", or "error" on failure
 */
export function useModel(): ModelState {
    const [state, setState] = useState<ModelState>({ model: null, status: "loading" });

    useEffect(() => {
        let active = true;

        loadModel().then(
            (model) => {
                if (active) {
                    setState({ model, status: "ready" });
                }
            },
            () => {
                if (active) {
                    setState({ model: null, status: "error" });
                }
            },
        );

        return () => {
            active = false;
        };
    }, []);

    return state;
}
