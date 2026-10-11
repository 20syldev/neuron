export const DESKTOP_GRID =
    "min-[1081px]:grid-cols-[152px_minmax(0,680px)_minmax(200px,1fr)] min-[1081px]:gap-x-12";

export const SECTION = `mx-auto grid w-full max-w-[1280px] grid-cols-1 px-(--gutter) ${DESKTOP_GRID}`;

export const CHAPTER_SECTION = `${SECTION} pt-[152px] -scroll-mt-38 max-[760px]:pt-20 max-[760px]:-scroll-mt-20`;

export const BODY =
    "m-0 mt-8 min-w-0 text-[19px] leading-[1.65] text-pretty min-[1081px]:col-start-2 min-[1081px]:row-start-2";

export const ASIDE = "mt-[38px] min-w-0 min-[1081px]:col-start-3 min-[1081px]:row-start-2";

export const FIGURE =
    "m-0 mt-14 grid min-w-0 grid-cols-1 min-[1081px]:col-[1/-1] min-[1081px]:row-start-3 " +
    DESKTOP_GRID;

export const FIGURE_BODY = "min-w-0 min-[1081px]:col-[2/4]";

export const FIGURE_CAPTION = "min-[1081px]:col-start-2";

export const DISPLAY =
    "font-display [font-feature-settings:'liga'_0,'clig'_0,'calt'_0] [font-variant-ligatures:none]";
