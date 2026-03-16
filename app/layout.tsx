/**
 * app/layout.tsx — Root Layout
 *
 * This is the outermost layout that wraps EVERY page in the app.
 * In Next.js App Router, every folder can have a layout.tsx.
 * The root layout is special: it must render <html> and <body>.
 *
 * What it does:
 *  - Sets the page <title> and meta description (used by search engines & browser tabs)
 *  - Applies global CSS (globals.css)
 *  - Wraps all pages in ThemeProvider so any component can read/set the theme
 *  - Sets the default dark theme via the "dark" class on <html>
 */

import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

/* ── Metadata ─────────────────────────────────────────────────────────────────
 * Next.js reads this exported object and injects the appropriate <meta> tags
 * into the <head> automatically. No need to write <Head> components manually.
 */
export const metadata: Metadata = {
  title: "Apricity — Life OS",
  description: "Your personal life management command center",
  icons: { icon: "/favicon.ico" },
};

/*
  RootLayout — The shell that every page renders inside.
 
  `children` is whatever page (or nested layout) is currently active.
  Next.js passes this automatically — you never call RootLayout directly.
 
  The "dark" class on <html> sets the default theme before JavaScript loads,
  preventing a flash of unstyled/light content on first paint.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang="en" helps screen readers and search engines understand the language.
    // "dark" class activates Tailwind's dark-mode variant styles by default.
    <html lang="en" className="dark">
      {/*
       * cyber-bg    — custom CSS class from globals.css for the dark background
       * min-h-screen — ensures the background fills the full viewport height
       * antialiased  — smooths font rendering on most screens
       */}
      <body className="cyber-bg min-h-screen antialiased">
        {/*
         * ThemeProvider wraps everything so any child component can call
         * useTheme() to read or change the current theme (dark/light).
         * It also syncs the theme with localStorage and the database.
         */}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
