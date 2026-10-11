import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class names and resolves Tailwind utility conflicts.
 * Combines clsx's conditional handling with tailwind-merge deduplication.
 *
 * @param inputs - Class values: strings, arrays or conditional objects
 * @returns A single className string with conflicting utilities resolved
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
