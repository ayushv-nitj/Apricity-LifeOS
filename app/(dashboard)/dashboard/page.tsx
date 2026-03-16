/**
 * app/(dashboard)/dashboard/page.tsx — Main Dashboard Page
 *
 * This is a React Server Component (no "use client" directive).
 * Server Components can be async and run on the server, which means:
 *  - They can call `auth()` directly to get the session without a hook
 *  - They don't add to the client-side JavaScript bundle
 *  - They render the initial HTML on the server for fast page loads
 *
 * The actual interactive widgets (QuestLog, MoodTracker, etc.) are all
 * Client Components — they fetch their own data independently on the client.
 * This page just provides the layout shell and the welcome header.
 *
 * Layout structure:
 *  - Top bar: greeting + date + FocusMode button
 *  - XPHeader: level/XP progress bar (spans full width)
 *  - 3-column grid:
 *    - Left (2/3 width): QuestLog, ProductivityChart, QuickNotes
 *    - Right (1/3 width): LifeRadar, MoodTracker, SystemFeed
 */
import { auth } from "@/lib/auth";
import XPHeader from "@/components/dashboard/XPHeader";
import QuestLog from "@/components/dashboard/QuestLog";
import LifeRadar from "@/components/dashboard/LifeRadar";
import ProductivityChart from "@/components/dashboard/ProductivityChart";
import MoodTracker from "@/components/dashboard/MoodTracker";
import QuickNotes from "@/components/dashboard/QuickNotes";
import SystemFeed from "@/components/dashboard/SystemFeed";
import FocusMode from "@/components/dashboard/FocusMode";
import { format } from "date-fns";

// This is an async Server Component — `auth()` reads the session from cookies
export default async function DashboardPage() {
  const session = await auth();
  const now = new Date();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top bar: personalized greeting + current date + focus mode trigger */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white font-mono">
            Welcome back, <span className="neon-cyan">{session?.user?.name}</span>
          </h1>
          {/* date-fns `format` converts the Date object to a readable string */}
          <p className="text-sm text-slate-500 font-mono mt-0.5">
            {format(now, "EEEE, MMMM d, yyyy")} — System Online
          </p>
        </div>
        {/* FocusMode is a Client Component — renders a button that opens a modal */}
        <FocusMode />
      </div>

      {/* XP progress bar — spans the full width above the grid */}
      <XPHeader />

      {/* Responsive grid: 1 column on mobile, 3 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column — takes up 2/3 of the grid on large screens */}
        <div className="lg:col-span-2 space-y-5">
          <QuestLog />
          <ProductivityChart />
          <QuickNotes />
        </div>

        {/* Right column — takes up 1/3 of the grid */}
        <div className="space-y-5">
          <LifeRadar />
          <MoodTracker />
          <SystemFeed />
        </div>
      </div>
    </div>
  );
}
