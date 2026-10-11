import { Bricolage_Grotesque, Geist_Mono, Manrope } from "next/font/google";
import { type AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";

import { type AppLocale } from "@/i18n/routing";

import "@/app/globals.css";

const bricolage = Bricolage_Grotesque({
    subsets: ["latin"],
    axes: ["opsz"],
    variable: "--font-bricolage",
    display: "swap",
});

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope",
    display: "swap",
});

const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
    display: "swap",
});

export interface ShellProps {
    locale: AppLocale;
    messages: AbstractIntlMessages;
    prelude?: ReactNode;
    children: ReactNode;
}

/**
 * Shared root document of every locale: html lang, the three font variables, the theme provider
 * and the intl provider. Each locale route group renders it with its own messages, which is what
 * lets the default locale live at "/" and the others under a prefix. The font variables are
 * named after the families because Tailwind already owns --font-sans and --font-mono.
 *
 * @param locale - Active locale, written to the html lang attribute
 * @param messages - Translated messages of that locale, handed to the client intl provider
 * @param prelude - Elements rendered first in the body, ahead of the page, such as the first-visit
 *   language script
 * @param children - Page tree rendered for this locale
 */
export function Shell({ locale, messages, prelude, children }: ShellProps) {
    return (
        <html lang={locale} suppressHydrationWarning>
            <body
                className={`${bricolage.variable} ${manrope.variable} ${geistMono.variable}`}
                suppressHydrationWarning
            >
                {prelude}
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        {children}
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
