"use client";

import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Dialog } from "radix-ui";
import {
    createContext,
    type CSSProperties,
    type ReactNode,
    type RefObject,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";

import { GridIcon, StateDot, useChapterItems } from "@/components/header/dots";
import { type ChapterState, LAST_PART_ONE, SECTION_IDS } from "@/data/chapters";
import { useChapter } from "@/hooks/useChapter";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatPercent, pad2 } from "@/lib/format";
import { cn } from "@/lib/utils";

export type SommaireOrigin = "top" | "pill";

type SheetVariant = "top" | "pill" | "phone";

export interface SommaireState {
    open: SommaireOrigin | null;
    setOpen: (next: SommaireOrigin | null, opener?: HTMLElement | null) => void;
}

interface SommaireContextValue extends SommaireState {
    anchor: number;
    openerRef: RefObject<HTMLElement | null>;
}

export interface SommaireProviderProps {
    children: ReactNode;
}

export interface SommaireTriggerProps {
    origin: SommaireOrigin;
    className?: string;
}

interface SheetPanelProps {
    variant: SheetVariant;
    onNavigate: () => void;
}

interface SheetRowProps {
    href: string;
    state: ChapterState;
    progress: number;
    phone: boolean;
    number: string;
    title: string;
    tag: string;
    extra?: boolean;
    onNavigate: () => void;
}

const PHONE_QUERY = "(max-width: 760px)";

const OVERLAY_CLASS: Record<SheetVariant, string> = {
    top: "inset-x-0 top-(--sheet-top) bottom-0",
    pill: "inset-0",
    phone: "inset-0",
};

const CONTENT_CLASS: Record<SheetVariant, string> = {
    top: "inset-x-0 top-(--sheet-top) max-h-[calc(100dvh-var(--sheet-top))] overflow-y-auto border-b border-foreground bg-background fade-in-0 slide-in-from-top-2.5 duration-200",
    pill: "bottom-[132px] left-1/2 max-h-[calc(100dvh-140px)] w-[880px] max-w-[calc(100vw-32px)] -translate-x-1/2 overflow-y-auto rounded-[4px] border border-foreground bg-card fade-in-0 slide-in-from-bottom-3 duration-200",
    phone: "inset-x-0 bottom-0 max-h-[min(620px,calc(100dvh-72px))] overflow-y-auto rounded-t-[4px] border-t border-foreground bg-card pt-2 slide-in-from-bottom-full duration-[280ms]",
};

const LABEL_CLASS =
    "m-0 font-mono text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase";

const SQUARE_BUTTON_CLASS =
    "inline-flex flex-none cursor-pointer items-center justify-center rounded-[3px] border border-border bg-card p-0 text-foreground hover:border-border-strong hover:bg-muted";

const SommaireContext = createContext<SommaireContextValue>({
    open: null,
    setOpen: () => {},
    anchor: 0,
    openerRef: { current: null },
});

/**
 * Holds which Sommaire sheet is open, shared by the buttons that open it and by SommaireSheet.
 * Wrap the whole page once, and render a single SommaireSheet somewhere inside it. The context it
 * provides carries the open origin, the setter, the viewport y of the bottom of the compact bar
 * that opened the top sheet (0 otherwise) and a ref to the opener element that gets focus back.
 *
 * @param children - The whole page, so that every button and the sheet read the same state
 */
export function SommaireProvider({ children }: SommaireProviderProps) {
    const [state, setState] = useState<{ origin: SommaireOrigin; anchor: number } | null>(null);
    const openerRef = useRef<HTMLElement | null>(null);

    const setOpen = useCallback((next: SommaireOrigin | null, opener?: HTMLElement | null) => {
        if (!next) {
            setState(null);
            return;
        }

        const source =
            opener ??
            (document.activeElement instanceof HTMLElement ? document.activeElement : null);
        const bar = source?.closest("header") ?? source;

        openerRef.current = source;
        setState({
            origin: next,
            anchor: next === "top" && bar ? bar.getBoundingClientRect().bottom : 0,
        });
    }, []);

    const value = useMemo(
        () => ({ open: state?.origin ?? null, setOpen, anchor: state?.anchor ?? 0, openerRef }),
        [state, setOpen],
    );

    return <SommaireContext.Provider value={value}>{children}</SommaireContext.Provider>;
}

/**
 * Reads and drives the Sommaire sheet. "open" is where the open sheet comes from: the masthead row
 * ("top"), the floating pill ("pill"), or null when it is closed. "setOpen" opens the sheet from
 * an origin or closes it with null; the optional opener is the element that gets focus back on
 * close and the one the top sheet is anchored under, and defaults to the focused element.
 *
 * @returns The open origin (null when closed) and the setter
 */
export function useSommaire(): SommaireState {
    return useContext(SommaireContext);
}

/**
 * Text button of the masthead row that toggles the Sommaire sheet: grid glyph and label, filled
 * with the ink colour while the sheet is open. The sheet drops under the compact bar that contains
 * the button, so place it inside the header element.
 *
 * @param origin - Surface the button sits on, which decides where the sheet comes from
 * @param className - Extra classes merged onto the button, such as a visibility override per layout
 */
export function SommaireTrigger({ origin, className }: SommaireTriggerProps) {
    const t = useTranslations("header");
    const { open, setOpen } = useSommaire();
    const expanded = open === origin;

    return (
        <button
            type="button"
            aria-label={t("contents")}
            aria-expanded={expanded}
            aria-controls={expanded ? `som-${origin}` : undefined}
            onClick={(event) => setOpen(expanded ? null : origin, event.currentTarget)}
            className={cn(
                "inline-flex h-(--control) flex-none cursor-pointer items-center gap-2 rounded-[3px] border border-border bg-card pr-3 pl-2.5 text-sm leading-none font-semibold text-foreground hover:border-border-strong hover:bg-muted aria-expanded:border-foreground aria-expanded:bg-foreground aria-expanded:text-background",
                className,
            )}
        >
            <GridIcon />
            <span>{t("contents")}</span>
        </button>
    );
}

/**
 * One chapter, prologue, interlude or epilogue line of the sheet: state dot, number, title and a
 * read or progress tag. The link keeps the hash navigation and closes the sheet.
 *
 * @param href - Hash target of the row, the id of its section
 * @param state - Reading state of the chapter, drives the dot and the highlight of the row
 * @param progress - Reading progress of the chapter from 0 to 1, only used when it is current
 * @param phone - True in the bottom-sheet layout, which uses taller rows and smaller type
 * @param number - Two-digit chapter number, empty for the prologue, interlude and epilogue rows
 * @param title - Translated title of the chapter or section
 * @param tag - Short text at the end of the row: the percentage when current, "read" on a phone
 *   for finished chapters, empty otherwise
 * @param extra - True for the prologue, interlude and epilogue rows, shown muted until current
 * @param onNavigate - Called when the link is followed, so the sheet can close and skip refocusing
 */
function SheetRow({
    href,
    state,
    progress,
    phone,
    number,
    title,
    tag,
    extra,
    onNavigate,
}: SheetRowProps) {
    const current = state === "current";

    return (
        <li>
            <a
                href={href}
                aria-current={current ? "location" : undefined}
                onClick={onNavigate}
                className={cn(
                    "grid items-center gap-x-2 border-b border-border px-1 text-foreground hover:bg-muted",
                    phone
                        ? "h-10 grid-cols-[14px_22px_minmax(0,1fr)_auto]"
                        : "min-h-9 grid-cols-[16px_20px_minmax(0,1fr)_auto] py-[5px]",
                )}
            >
                <StateDot state={state} scale={phone ? "phone" : "sheet"} progress={progress} />
                <span
                    aria-hidden="true"
                    className={cn(
                        "font-mono text-[11.5px] leading-none",
                        current ? "font-semibold text-signal-ink" : "text-muted-foreground",
                    )}
                >
                    {number}
                </span>
                <span
                    className={cn(
                        "min-w-0 leading-[1.2]",
                        phone ? "truncate text-sm" : "font-display text-[15px] tracking-[-0.01em]",
                        current
                            ? cn("text-signal-ink", phone ? "font-bold" : "font-semibold")
                            : cn("font-medium", extra && "text-muted-foreground"),
                    )}
                >
                    {title}
                </span>
                <span
                    className={cn(
                        "font-mono text-[11px] leading-none whitespace-nowrap",
                        current ? "font-semibold text-signal-ink" : "text-muted-foreground",
                    )}
                >
                    {tag}
                </span>
            </a>
        </li>
    );
}

/**
 * Content of the open sheet. Rendered only while the sheet is open, so the chapter list is built
 * on demand. Desktop shows three columns (Part I with prologue and interlude, the first six
 * chapters of Part II, then the rest with the epilogue) under a head with the status line; the
 * phone shows two lists under a grab handle and a count.
 *
 * @param variant - Layout of the sheet: "top" under the compact bar, "pill" above the floating
 *   pill, or "phone" for the bottom sheet
 * @param onNavigate - Called when a row link is followed, so the sheet can close without refocusing
 */
function SheetPanel({ variant, onNavigate }: SheetPanelProps) {
    const t = useTranslations("header");
    const locale = useLocale();
    const items = useChapterItems();
    const { current, progress } = useChapter();
    const phone = variant === "phone";
    const read = Math.max(0, current - 1);

    const extra = (id: string, state: ChapterState, title: string) => (
        <SheetRow
            key={id}
            href={`#${id}`}
            state={state}
            progress={0}
            phone={phone}
            number=""
            title={title}
            tag={state === "current" ? t("tags.current") : ""}
            extra
            onNavigate={onNavigate}
        />
    );

    const rows = (from: number, to: number) =>
        items
            .slice(from - 1, to)
            .map((item) => (
                <SheetRow
                    key={item.chapter.id}
                    href={`#${item.chapter.id}`}
                    state={item.state}
                    progress={item.progress}
                    phone={phone}
                    number={pad2(item.chapter.number)}
                    title={item.title}
                    tag={
                        item.state === "current"
                            ? item.percent
                            : phone && item.state === "read"
                              ? t("tags.read")
                              : ""
                    }
                    onNavigate={onNavigate}
                />
            ));

    const close = (
        <Dialog.Close
            aria-label={t("close")}
            className={cn(SQUARE_BUTTON_CLASS, phone ? "size-10" : "size-8")}
        >
            <X className="size-4" aria-hidden="true" />
        </Dialog.Close>
    );

    if (phone) {
        return (
            <>
                <span
                    aria-hidden="true"
                    className="mx-auto mb-1.5 block h-1 w-9 rounded-[2px] bg-border-strong"
                />
                <div className="flex items-center gap-2.5 border-b border-foreground pt-2 pr-2.5 pb-2.5 pl-4">
                    <Dialog.Title className={cn(LABEL_CLASS, "flex-1")}>
                        {t("contents")}
                    </Dialog.Title>
                    <span className="font-mono text-[11px] whitespace-nowrap text-muted-foreground">
                        {t("status.count", { count: read })}
                    </span>
                    {close}
                </div>
                <nav aria-label={t("contents")} className="px-3 pt-0.5 pb-[22px]">
                    {[1, 2].map((part) => (
                        <div key={part}>
                            <p className="m-0 flex h-[30px] items-baseline gap-2 pt-[9px] font-display text-[15px] leading-[1.2] font-semibold tracking-[-0.01em]">
                                <span aria-hidden="true" className="text-[17px] tracking-[-0.02em]">
                                    {part === 1 ? "I" : "II"}
                                </span>
                                {t(`parts.${part}`)}
                            </p>
                            <ol>
                                {part === 1 ? rows(1, LAST_PART_ONE) : rows(LAST_PART_ONE + 1, 15)}
                            </ol>
                        </div>
                    ))}
                </nav>
            </>
        );
    }

    const heading =
        "m-0 mb-1 flex h-[46px] items-end gap-3 border-b border-foreground pb-[9px] font-display text-[17px] leading-[1.1] font-semibold tracking-[-0.02em]";
    const numeral = "text-[30px] leading-[0.8] tracking-[-0.015em]";
    const columns = (
        <div
            className={cn(
                "grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))]",
                variant === "top" ? "gap-x-12 pt-3.5 pb-6" : "gap-x-7 px-5 pt-3.5 pb-5",
            )}
        >
            <div>
                <p className={heading}>
                    <span aria-hidden="true" className={numeral}>
                        I
                    </span>
                    {t("parts.1")}
                </p>
                <ol>
                    {extra(
                        SECTION_IDS.prologue,
                        current ? "read" : "current",
                        t("extras.prologue"),
                    )}
                    {rows(1, LAST_PART_ONE)}
                    {extra(
                        SECTION_IDS.interlude,
                        current > LAST_PART_ONE ? "read" : "next",
                        t("extras.interlude"),
                    )}
                </ol>
            </div>
            <div>
                <p className={heading}>
                    <span aria-hidden="true" className={numeral}>
                        II
                    </span>
                    {t("parts.2")}
                </p>
                <ol>{rows(LAST_PART_ONE + 1, 10)}</ol>
            </div>
            <div>
                <p className={heading}>
                    <span className="font-mono text-[11px] leading-[1.3] font-medium tracking-[0.1em] text-muted-foreground uppercase">
                        {t("parts.2more")}
                    </span>
                </p>
                <ol>
                    {rows(11, 15)}
                    {extra(SECTION_IDS.epilogue, "next", t("extras.epilogue"))}
                </ol>
            </div>
        </div>
    );

    return (
        <div className={cn(variant === "top" && "mx-auto max-w-[1280px] px-(--gutter)")}>
            <div
                className={cn(
                    "flex flex-wrap items-end gap-x-8 gap-y-3 border-b border-border pt-[18px] pb-3.5",
                    variant === "pill" && "px-6",
                )}
            >
                <div className="min-w-0 flex-[1_1_260px]">
                    <Dialog.Title className={LABEL_CLASS}>{t("contents")}</Dialog.Title>
                    <p className="mt-1.5 mb-0 font-display text-[26px] leading-none font-semibold tracking-[-0.015em]">
                        {t("title")}
                    </p>
                </div>
                <p className="m-0 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted-foreground">
                    <span>{t("status.read", { count: read })}</span>
                    <span className="font-semibold text-signal-ink">
                        {current
                            ? t("status.current", {
                                  number: pad2(current),
                                  percent: formatPercent(locale, progress, 0),
                              })
                            : t("status.prologue")}
                    </span>
                </p>
                {close}
            </div>
            <nav aria-label={t("contents")}>{columns}</nav>
        </div>
    );
}

/**
 * The Sommaire sheet, a Radix modal dialog so that focus is trapped, Escape closes it and focus
 * returns to the opener. On desktop it drops from under the compact bar (opened from the
 * masthead row) or rises above the pill, tied to it by a dimension line; on a phone it rises from
 * the bottom edge whatever the origin. Render it once inside SommaireProvider; its id is
 * "som-top" or "som-pill", matching aria-controls on the buttons.
 */
export function SommaireSheet() {
    const { open, setOpen, anchor, openerRef } = useContext(SommaireContext);
    const phone = useMediaQuery(PHONE_QUERY);
    const navigated = useRef(false);

    const variant: SheetVariant = phone ? "phone" : open === "top" ? "top" : "pill";
    const anchored = { "--sheet-top": `${anchor}px` } as CSSProperties;

    return (
        <Dialog.Root open={open !== null} onOpenChange={(next) => !next && setOpen(null)}>
            <Dialog.Portal>
                <Dialog.Overlay
                    style={anchored}
                    className={cn(
                        "fixed z-40 animate-in bg-veil fade-in-0 duration-[180ms] motion-reduce:animate-none",
                        OVERLAY_CLASS[variant],
                    )}
                />
                {variant === "pill" && (
                    <span
                        aria-hidden="true"
                        className="fixed bottom-[76px] left-1/2 z-40 -ml-[3px] flex h-14 w-[7px] flex-col items-center"
                    >
                        <span className="h-px w-[7px] flex-none bg-foreground" />
                        <span className="w-px flex-1 bg-foreground" />
                        <span className="h-px w-[7px] flex-none bg-foreground" />
                    </span>
                )}
                <Dialog.Content
                    id={`som-${open ?? "pill"}`}
                    aria-describedby={undefined}
                    style={anchored}
                    onCloseAutoFocus={(event) => {
                        event.preventDefault();

                        if (navigated.current) navigated.current = false;
                        else openerRef.current?.focus({ preventScroll: true });
                    }}
                    className={cn(
                        "fixed z-40 animate-in ease-[cubic-bezier(.2,.8,.2,1)] outline-none motion-reduce:animate-none",
                        CONTENT_CLASS[variant],
                    )}
                >
                    <SheetPanel
                        variant={variant}
                        onNavigate={() => {
                            navigated.current = true;
                            setOpen(null);
                        }}
                    />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
