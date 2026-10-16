export type PartNumeral = "I" | "II";

export type ChapterState = "read" | "current" | "next";

export interface Chapter {
    id: string;
    number: number;
    part: PartNumeral;
}

export const CHAPTER_COUNT = 15;

export const LAST_PART_ONE = 4;

// DOM ids of the sections that are not numbered chapters
export const SECTION_IDS = {
    prologue: "prologue",
    interlude: "interlude",
    partTwo: "part-2",
    epilogue: "epilogue",
} as const;

// Chapters in reading order: "id" is the DOM id, "number" keys the title in header.chapters.
export const CHAPTERS: readonly Chapter[] = Array.from({ length: CHAPTER_COUNT }, (_, index) => ({
    id: `ch-${index + 1}`,
    number: index + 1,
    part: index + 1 <= LAST_PART_ONE ? "I" : "II",
}));

/**
 * Reading state of a chapter relative to the one being read.
 *
 * @param number - Chapter number from 1 to 15
 * @param current - Chapter being read, 0 while the reader is still in the prologue
 * @returns "read" before the current chapter, "current" on it, "next" after it or in the prologue
 */
export function chapterState(number: number, current: number): ChapterState {
    if (!current) return "next";
    if (number < current) return "read";
    return number === current ? "current" : "next";
}
