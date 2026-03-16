/**
 * components/ThemeProvider.tsx — Global Theme System
 *
 * This component manages the app's dark/light theme and makes it available
 * to every component in the tree via React Context.
 *
 * "use client" is required because this component:
 *  - Uses React hooks (useState, useEffect)
 *  - Reads/writes localStorage (browser-only API)
 *  - Manipulates the DOM (document.documentElement)
 *
 * Theme persistence strategy (three layers):
 *  1. localStorage  — instant on page load, no network request needed
 *  2. Database      — synced across devices when the user logs in
 *  3. React state   — drives re-renders when the theme changes
 *
 * Data flow:
 *  Mount → read localStorage → apply theme immediately (no flash)
 *       → fetch /api/user    → sync DB theme (may override localStorage)
 *  User changes theme → update state → apply to DOM → save to localStorage + DB
 */

"use client";
import { createContext, useContext, useEffect, useState } from "react";

// The only two valid theme values in this app.
type Theme = "dark" | "light";

/* ── Context ──────────────────────────────────────────────────────────────────
 * createContext creates a "global store" for the theme.
 * The default value is used only if a component calls useTheme() outside
 * of a ThemeProvider — in practice this shouldn't happen.
 */
const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({ theme: "dark", setTheme: () => {} });

/**
 * useTheme — Custom hook for consuming the theme context.
 *
 * Any component can call `const { theme, setTheme } = useTheme()` to:
 *  - Read the current theme ("dark" | "light")
 *  - Change the theme (updates DOM, localStorage, and DB)
 */
export function useTheme() { return useContext(ThemeContext); }

/**
 * ThemeProvider — Wraps the app and provides theme state to all children.
 *
 * Rendered once in app/layout.tsx so it covers the entire application.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // React state for the current theme. Triggers re-renders when changed.
  const [theme, setThemeState] = useState<Theme>("dark");

  /* ── On mount: restore saved theme ─────────────────────────────────────────
   * This effect runs once after the component mounts (empty dependency array []).
   *
   * Step 1: Check localStorage for an instantly available theme preference.
   *         This prevents a flash of the wrong theme on page load.
   *
   * Step 2: Fetch the user's theme from the database. This handles the case
   *         where the user changed their theme on another device.
   *         If the DB theme differs from localStorage, the DB wins.
   */
  useEffect(() => {
    // Step 1: Apply localStorage theme immediately (synchronous).
    const stored = localStorage.getItem("apricity-theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      applyTheme(stored);
    }

    // Step 2: Fetch from DB asynchronously and sync if needed.
    fetch("/api/user")
      .then(r => r.json())
      .then(d => {
        if (d?.theme && (d.theme === "light" || d.theme === "dark")) {
          setThemeState(d.theme);
          applyTheme(d.theme);
          // Keep localStorage in sync with the DB value.
          localStorage.setItem("apricity-theme", d.theme);
        }
      })
      .catch(() => {}); // Silently ignore errors (e.g. not logged in yet).
  }, []);

  /**
   * applyTheme — Directly manipulates the <html> element's class list.
   *
   * Tailwind CSS uses the "dark" class on <html> to activate dark-mode styles.
   * We add/remove "dark" and "light" classes to switch between themes.
   * This is a DOM operation, so it only runs in the browser (not during SSR).
   */
  function applyTheme(t: Theme) {
    const html = document.documentElement;
    if (t === "light") {
      html.classList.add("light");
      html.classList.remove("dark");
    } else {
      html.classList.add("dark");
      html.classList.remove("light");
    }
  }

  /**
   * setTheme — Public function exposed via context.
   *
   * Called by any component that wants to change the theme (e.g. a toggle button).
   * Performs three actions in sequence:
   *  1. Updates React state → triggers re-render
   *  2. Updates the DOM    → visual change is immediate
   *  3. Persists to localStorage + DB → survives page refresh and device changes
   */
  function setTheme(t: Theme) {
    setThemeState(t);
    applyTheme(t);
    localStorage.setItem("apricity-theme", t);

    // Persist to DB so the theme syncs across devices.
    // .catch(() => {}) prevents unhandled promise rejection if the request fails.
    fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: t }),
    }).catch(() => {});
  }

  /* ── Render ───────────────────────────────────────────────────────────────
   * ThemeContext.Provider makes `theme` and `setTheme` available to all
   * descendant components that call useTheme().
   * `children` is everything nested inside <ThemeProvider> in layout.tsx.
   */
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
