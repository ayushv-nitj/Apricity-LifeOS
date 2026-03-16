/**
 * app/(dashboard)/layout.tsx — Dashboard Layout with Auth Guard
 *
 * This layout wraps every page inside the (dashboard) route group.
 * Route groups (folders in parentheses) let you share a layout without
 * affecting the URL — e.g. /dashboard/tasks uses this layout but the
 * "(dashboard)" part never appears in the browser address bar.
 *
 * Key responsibilities:
 *  1. AUTH GUARD — Redirects unauthenticated users to /login before
 *     rendering anything. This is server-side, so there's no flash of
 *     protected content.
 *  2. LAYOUT SHELL — Renders the sidebar, main content area, right panel,
 *     mobile nav, and the floating AI chatbot.
 *  3. SESSION PROVIDER — Wraps children in NextAuth's SessionProvider so
 *     client components can call useSession() to access the logged-in user.
 *
 * This is an async Server Component (note: no "use client" directive).
 * Server Components can await data directly — no useEffect needed.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/sidebar/Sidebar";
import RightPanel from "@/components/sidebar/RightPanel";
import MobileNav from "@/components/sidebar/MobileNav";
import AIChatbot from "@/components/dashboard/AIChatbot";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  /* ── Auth Guard ─────────────────────────────────────────────────────────────
   * `auth()` reads the JWT session cookie on the server.
   * If there's no valid session, `session` will be null.
   * `redirect()` throws a special Next.js error that stops rendering and
   * sends the user to /login — no extra code needed.
   *
   * This runs on EVERY request to a dashboard page, so users can't bypass
   * it by navigating directly to a URL.
   */
  const session = await auth();
  if (!session) redirect("/login");

  return (
    /*
     * SessionProvider makes the session available to all Client Components
     * via the useSession() hook. We pass the server-fetched session as a prop
     * so the client doesn't need to make an extra network request to get it.
     */
    <SessionProvider session={session}>
      {/* Main flex container: sidebar on the left, content in the middle, right panel on the right */}
      <div className="flex min-h-screen">
        {/* Left navigation sidebar — hidden on mobile, visible on lg+ screens */}
        <Sidebar />

        {/* Center column: mobile nav bar on top, then the page content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* MobileNav shows a hamburger menu on small screens */}
          <MobileNav />
          {/* `children` is the actual page being visited (e.g. dashboard/page.tsx) */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
        </div>

        {/* Right panel — shows XP, quick stats, etc. on large screens */}
        <RightPanel />
      </div>

      {/* Floating AI chatbot button — rendered outside the flex layout so it
          stays fixed in the bottom-right corner regardless of scroll position */}
      <AIChatbot />
    </SessionProvider>
  );
}
