/**
 * app/(dashboard)/dashboard/social/page.tsx — Social Hub
 *
 * "use client" — uses useState for tab switching.
 *
 * Container page for all social features, organized into three tabs:
 *
 *  Friends tab — add friends by email, accept/decline incoming requests,
 *    view your accepted friends list with their level.
 *
 *  Chat tab — create group/project/DM chat rooms, send and receive messages.
 *    Messages are polled every 3 seconds (no WebSocket needed).
 *
 *  Habits tab — create shared habits with friends, mark daily completion,
 *    and compare streaks on a leaderboard per habit.
 *
 * The TABS array drives both the tab bar rendering and the TypeScript union
 * type for `tab` state — `(typeof TABS)[number]["id"]` extracts "friends" |
 * "chat" | "habits" from the const array automatically.
 *
 * Each tab's content is a separate component (FriendsTab, ChatTab, HabitsTab)
 * that manages its own data fetching and state independently.
 */
"use client";
import { useState } from "react";
import { Users, MessageSquare, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import FriendsTab from "@/components/social/FriendsTab";
import ChatTab from "@/components/social/ChatTab";
import HabitsTab from "@/components/social/HabitsTab";

const TABS = [
  { id: "friends", label: "Friends", icon: Users },
  { id: "chat",    label: "Chat",    icon: MessageSquare },
  { id: "habits",  label: "Habits",  icon: Flame },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function SocialPage() {
  const [tab, setTab] = useState<Tab>("friends");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono neon-cyan">Social Hub</h1>
        <p className="text-slate-400 text-sm mt-1">Connect with friends, chat, and compare streaks.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-cyber-border/40 pb-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-mono border-b-2 transition-colors",
              tab === id
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "friends" && <FriendsTab />}
      {tab === "chat"    && <ChatTab />}
      {tab === "habits"  && <HabitsTab />}
    </div>
  );
}
