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

export default async function DashboardPage() {
  const session = await auth();
  const now = new Date();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white font-mono">
            Welcome back, <span className="neon-cyan">{session?.user?.name}</span>
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-0.5">
            {format(now, "EEEE, MMMM d, yyyy")} — System Online
          </p>
        </div>
        <FocusMode />
      </div>

      {/* XP Header */}
      <XPHeader />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left col — Quest Log */}
        <div className="lg:col-span-2 space-y-5">
          <QuestLog />
          <ProductivityChart />
          <QuickNotes />
        </div>

        {/* Right col */}
        <div className="space-y-5">
          <LifeRadar />
          <MoodTracker />
          <SystemFeed />
        </div>
      </div>
    </div>
  );
}
