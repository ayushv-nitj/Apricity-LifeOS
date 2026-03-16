/**
 * app/(dashboard)/dashboard/goals/page.tsx — Goals & Bucket List
 *
 * "use client" — all state, fetch calls, and interactions happen in the browser.
 *
 * Manages long-term goals organized by category (personal, career, health, etc.).
 * Each goal has a progress slider (0-100%) that auto-updates the status:
 *  - 0%   → "not-started"
 *  - 1-99% → "in-progress"
 *  - 100% → "completed" (shows "Quest Complete" badge + strikethrough title)
 *
 * Inline editing pattern:
 *  - `editing` state holds the _id of the goal being edited
 *  - The progress slider only appears when `editing === goal._id`
 *  - Clicking the Check button saves the progress and closes edit mode
 *  - Clicking the X button (same Edit2 button when editing) closes without saving
 *
 * Category filter:
 *  - `activeCategory` state filters the displayed goals
 *  - "all" shows every goal; other values filter by goal.category
 *
 * `catColors` and `catIcons` maps give each category a distinct visual identity.
 *
 * Data source: GET/POST /api/goals, PATCH/DELETE /api/goals/:id
 */
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  _id: string;
  title: string;
  description?: string;
  category: string;
  status: string;
  progress: number;
  xpReward: number;
}

const catColors: Record<string, string> = {
  personal: "text-slate-400 border-slate-400/30 bg-slate-400/10",
  career: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  health: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  travel: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  learning: "text-violet-400 border-violet-400/30 bg-violet-400/10",
  relationships: "text-pink-400 border-pink-400/30 bg-pink-400/10",
};

const catIcons: Record<string, string> = {
  personal: "🎯", career: "💼", health: "💪", travel: "✈️", learning: "📚", relationships: "❤️",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "personal", xpReward: 200 });
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/goals");
    setGoals(await res.json());
  }

  async function add() {
    if (!form.title.trim()) return;
    await fetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ title: "", description: "", category: "personal", xpReward: 200 });
    setAdding(false);
    load();
  }

  async function updateProgress(id: string, progress: number) {
    await fetch(`/api/goals/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ progress, status: progress === 100 ? "completed" : progress > 0 ? "in-progress" : "not-started" }) });
    load();
  }

  async function del(id: string) {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    load();
  }

  const categories = ["all", "personal", "career", "health", "travel", "learning", "relationships"];
  const filtered = activeCategory === "all" ? goals : goals.filter(g => g.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">Goals / Bucket List</h1>
            <p className="text-xs text-slate-500 font-mono">{goals.filter(g => g.status === "completed").length}/{goals.length} achieved</p>
          </div>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn-cyber px-4 py-2 rounded-lg text-sm font-mono flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Quest
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-mono transition-all capitalize flex items-center gap-1",
              activeCategory === c ? "bg-blue-400/20 text-blue-400 border border-blue-400/30" : "text-slate-500 hover:text-slate-300 border border-white/5"
            )}>
            {c !== "all" && catIcons[c]} {c}
          </button>
        ))}
      </div>

      {/* Add form */}
      {adding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="glass-card rounded-xl p-5 mb-5 border border-blue-400/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Goal title..." className="cyber-input px-3 py-2 rounded-lg text-sm md:col-span-2" autoFocus />
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description..." className="cyber-input px-3 py-2 rounded-lg text-sm md:col-span-2" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="cyber-input px-3 py-2 rounded-lg text-sm">
              {["personal","career","health","travel","learning","relationships"].map(c => <option key={c} value={c}>{catIcons[c]} {c}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <input type="number" value={form.xpReward} onChange={e => setForm({ ...form, xpReward: Number(e.target.value) })}
                className="cyber-input px-3 py-2 rounded-lg text-sm w-24" min={50} max={2000} />
              <span className="text-xs text-yellow-400 font-mono">XP reward</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="btn-cyber px-4 py-2 rounded-lg text-sm font-mono">Add Goal</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-white/10 transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Goals grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((goal, i) => (
          <motion.div key={goal._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass-card rounded-xl p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border", catColors[goal.category])}>{catIcons[goal.category]} {goal.category}</span>
                  <span className="text-xs font-mono text-yellow-400">+{goal.xpReward}xp</span>
                </div>
                <h3 className={cn("font-semibold text-sm", goal.status === "completed" && "line-through text-slate-500")}>{goal.title}</h3>
                {goal.description && <p className="text-xs text-slate-500 mt-1">{goal.description}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button onClick={() => setEditing(editing === goal._id ? null : goal._id)} className="p-1 text-slate-400 hover:text-cyan-400">
                  {editing === goal._id ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => del(goal._id)} className="p-1 text-slate-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-mono">Progress</span>
                <span className="text-xs font-mono text-white">{goal.progress}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 0.8 }}
                  className={cn("h-full rounded-full", goal.status === "completed" ? "bg-emerald-400" : "bg-gradient-to-r from-blue-400 to-cyan-400")}
                />
              </div>
              {editing === goal._id && (
                <div className="flex items-center gap-2 mt-2">
                  <input type="range" min={0} max={100} value={goal.progress}
                    onChange={e => setGoals(gs => gs.map(g => g._id === goal._id ? { ...g, progress: Number(e.target.value) } : g))}
                    className="flex-1 accent-cyan-400" />
                  <button onClick={() => { updateProgress(goal._id, goal.progress); setEditing(null); }}
                    className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {goal.status === "completed" && (
              <div className="mt-2 text-xs text-emerald-400 font-mono flex items-center gap-1">
                <Check className="w-3 h-3" /> Quest Complete
              </div>
            )}
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-600 font-mono">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No goals in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
