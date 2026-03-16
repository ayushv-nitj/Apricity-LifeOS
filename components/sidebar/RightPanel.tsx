"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Star, Flame, TrendingUp, Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthorCard, { AuthorButton } from "@/components/dashboard/AuthorCard";

interface UserData {
  username: string;
  bio: string;
  level: number;
  xp: number;
  avatar?: string;
}

const XP_PER_LEVEL = 1000;

interface StreakData { label: string; streak: number; color: string }

function calcStreak(dates: string[]): number {
  const days = new Set(dates.map(d => new Date(d).toDateString()));
  let count = 0;
  const d = new Date();
  while (days.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); }
  return count;
}

export default function RightPanel() {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState("");
  const [todayTasks, setTodayTasks] = useState({ total: 0, done: 0 });
  const [streaks, setStreaks] = useState<StreakData[]>([]);
  const [showAuthor, setShowAuthor] = useState(false);
  const [stats, setStats] = useState([
    { label: "STR", color: "bg-red-400", value: 0 },
    { label: "INT", color: "bg-violet-400", value: 0 },
    { label: "CHA", color: "bg-pink-400", value: 0 },
    { label: "STM", color: "bg-emerald-400", value: 0 },
  ]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/user").then((r) => r.json()).then((d) => {
      setUser(d);
      setBio(d.bio || "");
    });
    fetch("/api/tasks").then((r) => r.json()).then((tasks: { status: string; createdAt: string; category: string; isHabit: boolean; completedAt?: string }[]) => {
      const today = new Date().toDateString();
      const todayList = tasks.filter((t) => new Date(t.createdAt).toDateString() === today);
      setTodayTasks({ total: todayList.length, done: todayList.filter((t) => t.status === "completed").length });

      // Compute stats from task completion counts
      const workDone = tasks.filter(t => t.category === "work" && t.status === "completed").length;
      const studyDone = tasks.filter(t => t.category === "academics" && t.status === "completed").length;
      const relDone = tasks.filter(t => (t.category === "relationships" || t.category === "family") && t.status === "completed").length;
      const totalDone = tasks.filter(t => t.status === "completed").length;
      setStats([
        { label: "STR", color: "bg-red-400", value: Math.min(30, Math.round(totalDone * 0.5)) },
        { label: "INT", color: "bg-violet-400", value: Math.min(30, studyDone * 2 + 5) },
        { label: "CHA", color: "bg-pink-400", value: Math.min(30, relDone * 3 + 5) },
        { label: "STM", color: "bg-emerald-400", value: Math.min(30, workDone + 5) },
      ]);

      // Streaks from habit tasks
      const habitDates = tasks.filter(t => t.isHabit && t.status === "completed" && t.completedAt).map(t => t.completedAt!);
      const studyDates = tasks.filter(t => t.category === "academics" && t.status === "completed" && t.completedAt).map(t => t.completedAt!);
      setStreaks([
        { label: "Tasks", streak: calcStreak(tasks.filter(t => t.status === "completed" && t.completedAt).map(t => t.completedAt!)), color: "text-cyan-400" },
        { label: "Habits", streak: calcStreak(habitDates), color: "text-emerald-400" },
        { label: "Study", streak: calcStreak(studyDates), color: "text-violet-400" },
      ]);
    });
  }, [session]);

  async function saveBio() {
    await fetch("/api/user", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bio }) });
    setUser((u) => u ? { ...u, bio } : u);
    setEditingBio(false);
  }

  if (!user) return null;

  const xpProgress = (user.xp % XP_PER_LEVEL) / XP_PER_LEVEL;
  const todayPct = todayTasks.total > 0 ? Math.round((todayTasks.done / todayTasks.total) * 100) : 0;

  return (
    <aside className="hidden xl:flex flex-col w-72 min-h-screen glass-card border-l border-cyber-border/50 p-5 gap-5">
      {/* Author button at the top */}
      <AuthorButton onClick={() => setShowAuthor(true)} />

      {/* Author modal */}
      {showAuthor && <AuthorCard onClose={() => setShowAuthor(false)} />}

      {/* Character Card */}
      <div className="glass-card-purple rounded-xl p-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-glow-purple opacity-30 pointer-events-none" />
        <div className="relative">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-gradient-to-br from-cyan-400/20 to-purple-600/20 border-2 border-cyan-400/30 flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-cyan-400" />
            )}
          </div>
          <h3 className="font-bold text-white font-mono">{user.username}</h3>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-mono">LVL {user.level} OPERATIVE</span>
          </div>

          {/* Bio */}
          <div className="mt-3">
            {editingBio ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="cyber-input w-full text-xs p-2 rounded-lg resize-none h-16"
                  maxLength={100}
                />
                <div className="flex gap-2 justify-center">
                  <button onClick={saveBio} className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded"><Check className="w-3 h-3" /></button>
                  <button onClick={() => setEditingBio(false)} className="p-1 text-red-400 hover:bg-red-400/10 rounded"><X className="w-3 h-3" /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-1 justify-center">
                <p className="text-xs text-slate-400 italic">{user.bio}</p>
                <button onClick={() => setEditingBio(true)} className="text-slate-500 hover:text-cyan-400 flex-shrink-0 mt-0.5">
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Experience</span>
          <span className="text-xs text-cyan-400 font-mono">{user.xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="xp-bar h-full rounded-full"
          />
        </div>
        <p className="text-xs text-slate-500 mt-1 font-mono">Total: {user.xp} XP</p>
      </div>

      {/* Stats */}
      <div className="glass-card rounded-xl p-4">
        <h4 className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-3">Operative Stats</h4>
        <div className="space-y-2.5">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 w-8">{s.label}</span>
              <div className="flex-1 stat-bar">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.value / 30) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className={cn("stat-bar-fill", s.color)}
                />
              </div>
              <span className="text-xs font-mono text-white w-6 text-right">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Progress */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs text-slate-400 font-mono uppercase tracking-wider">Today&apos;s Progress</h4>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Tasks</span>
          <span className="text-xs font-mono text-white">{todayTasks.done}/{todayTasks.total}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${todayPct}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
          />
        </div>
        <div className="text-center">
          <span className="text-2xl font-bold font-mono neon-cyan">{todayPct}%</span>
          <p className="text-xs text-slate-500">completion rate</p>
        </div>
      </div>

      {/* Streak */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <h4 className="text-xs text-slate-400 font-mono uppercase tracking-wider">Active Streaks</h4>
        </div>
        <div className="space-y-2">
          {streaks.length === 0 ? (
            <p className="text-xs text-slate-600 font-mono">Complete tasks to build streaks</p>
          ) : (
            streaks.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{s.label}</span>
                <span className={cn("text-xs font-mono font-bold", s.color)}>🔥 {s.streak}d</span>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
