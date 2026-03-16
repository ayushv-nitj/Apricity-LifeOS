/**
 * components/social/HabitsTab.tsx — Shared Habit Streak Comparison
 *
 * "use client" — uses hooks, session, and fetch.
 *
 * Lets users create shared habits and track daily completion alongside friends.
 * Each habit shows a leaderboard of all members with their current streak.
 *
 * Data loading:
 *  1. GET /api/shared-habits → list of habits the user is a member of
 *  2. For each habit, GET /api/shared-habits/:id/members → habit + member user info
 *  Both fetches happen in parallel via Promise.all for efficiency.
 *
 * Streak calculation (calcStreak):
 *  - Takes an array of ISO date strings (YYYY-MM-DD format)
 *  - Deduplicates and sorts descending (newest first)
 *  - Walks backwards from today, counting consecutive days
 *  - Stops at the first gap — this is the current streak
 *
 * Completion tracking:
 *  - `today` is the current date as YYYY-MM-DD
 *  - `doneToday` checks if today's date is in the user's completions array
 *  - The "Mark done" button is disabled once the user has completed today
 *  - POST /api/shared-habits/:id/complete adds today's date to the user's
 *    completions array (the API is idempotent — calling it twice is safe)
 *
 * Streak bar width:
 *  - `Math.min(100, streak * 5)` maps streak days to a percentage
 *  - A 20-day streak fills the bar 100%; longer streaks stay capped at 100%
 *
 * Data sources:
 *  - GET  /api/shared-habits                    → list user's shared habits
 *  - POST /api/shared-habits                    → create { title, memberEmails }
 *  - GET  /api/shared-habits/:id/members        → habit + member user info
 *  - POST /api/shared-habits/:id/complete       → mark today as completed
 */
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Flame, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Member { _id: string; username: string; avatar?: string }
interface Habit {
  _id: string;
  title: string;
  memberIds: string[];
  completions: Record<string, string[]>;
}
interface HabitWithMembers { habit: Habit; members: Member[] }

function calcStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const unique = [...new Set(dates)].sort((a, b) => b.localeCompare(a));
  let streak = 0;
  const cursor = new Date();
  for (const d of unique) {
    const day = new Date(d + "T00:00:00");
    const cur = new Date(cursor);
    cur.setHours(0, 0, 0, 0);
    day.setHours(0, 0, 0, 0);
    if (day.getTime() === cur.getTime()) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  return streak;
}

export default function HabitsTab() {
  const { data: session } = useSession();
  const [habits, setHabits]       = useState<HabitWithMembers[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]           = useState({ title: "", emails: "" });

  async function load() {
    const list: Habit[] = await fetch("/api/shared-habits").then((r) => r.json());
    if (!Array.isArray(list)) return;
    const detailed = await Promise.all(
      list.map((h) =>
        fetch(`/api/shared-habits/${h._id}/members`).then((r) => r.json())
      )
    );
    setHabits(detailed.filter((d) => d.habit));
  }

  useEffect(() => { load(); }, []);

  async function createHabit() {
    const memberEmails = form.emails.split(",").map((e) => e.trim()).filter(Boolean);
    const res = await fetch("/api/shared-habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title, memberEmails }),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ title: "", emails: "" });
      load();
    }
  }

  async function markComplete(habitId: string) {
    await fetch(`/api/shared-habits/${habitId}/complete`, { method: "POST" });
    load();
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowCreate(true)}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm font-mono transition-colors"
      >
        <Plus className="w-4 h-4" /> New Shared Habit
      </button>

      {habits.length === 0 && (
        <p className="text-xs text-slate-600 font-mono">No shared habits yet. Create one above.</p>
      )}

      {habits.map(({ habit, members }) => {
        const myDates = habit.completions?.[session?.user?.id ?? ""] ?? [];
        const doneToday = myDates.includes(today);

        return (
          <div key={habit._id} className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="font-mono text-white text-sm">{habit.title}</span>
              </div>
              <button
                onClick={() => markComplete(habit._id)}
                disabled={doneToday}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-mono transition-colors",
                  doneToday
                    ? "bg-emerald-500/10 text-emerald-400 cursor-default"
                    : "bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400"
                )}
              >
                <Check className="w-3 h-3" />
                {doneToday ? "Done today" : "Mark done"}
              </button>
            </div>

            {/* Streak leaderboard */}
            <div className="space-y-1.5">
              {members.map((m) => {
                const dates = habit.completions?.[m._id] ?? [];
                const streak = calcStreak(dates);
                const isMe = m._id === session?.user?.id;
                return (
                  <div key={m._id} className="flex items-center gap-3">
                    <span className={cn("text-xs font-mono w-24 truncate", isMe ? "text-cyan-400" : "text-slate-400")}>
                      {m.username}{isMe ? " (you)" : ""}
                    </span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all"
                        style={{ width: `${Math.min(100, streak * 5)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-orange-400 w-12 text-right">🔥 {streak}d</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 w-96 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-white">New Shared Habit</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Habit title (e.g. Morning run)"
              className="cyber-input w-full px-3 py-2 rounded-lg text-sm"
            />
            <div>
              <label className="text-xs text-slate-400 font-mono">Invite friends (comma-separated emails)</label>
              <input
                value={form.emails}
                onChange={(e) => setForm({ ...form, emails: e.target.value })}
                placeholder="a@x.com, b@x.com"
                className="cyber-input w-full px-3 py-2 rounded-lg text-sm mt-1"
              />
            </div>
            <button
              onClick={createHabit}
              disabled={!form.title.trim()}
              className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm font-mono transition-colors disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
