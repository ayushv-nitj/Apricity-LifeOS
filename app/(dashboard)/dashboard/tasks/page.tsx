"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Plus, CheckCircle2, Circle, Trash2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  _id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  xpReward: number;
  dueDate?: string;
  isHabit: boolean;
  streak: number;
}

const priorities = { high: "text-red-400 border-red-400/30 bg-red-400/10", medium: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10", low: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("all");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "work", priority: "medium", isHabit: false, xpReward: 50 });

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/tasks");
    setTasks(await res.json());
  }

  async function add() {
    if (!form.title.trim()) return;
    await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ title: "", description: "", category: "work", priority: "medium", isHabit: false, xpReward: 50 });
    setAdding(false);
    load();
  }

  async function toggle(task: Task) {
    await fetch(`/api/tasks/${task._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: task.status === "completed" ? "pending" : "completed" }) });
    load();
  }

  async function del(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = filter === "all" ? tasks : filter === "habits" ? tasks.filter(t => t.isHabit) : tasks.filter(t => t.status === filter);
  const done = tasks.filter(t => t.status === "completed").length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">Work / Tasks</h1>
            <p className="text-xs text-slate-500 font-mono">{done}/{tasks.length} completed</p>
          </div>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn-cyber px-4 py-2 rounded-lg text-sm font-mono flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {["all", "pending", "completed", "habits"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-mono transition-all capitalize", filter === f ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30" : "text-slate-500 hover:text-slate-300 border border-white/5")}
          >{f}</button>
        ))}
        <div className="ml-auto flex items-center gap-1 text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">{filtered.length} items</span>
        </div>
      </div>

      {/* Add form */}
      {adding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="glass-card rounded-xl p-5 mb-5 border border-cyan-400/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Task title..." className="cyber-input px-3 py-2 rounded-lg text-sm md:col-span-2" autoFocus />
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description (optional)" className="cyber-input px-3 py-2 rounded-lg text-sm md:col-span-2" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="cyber-input px-3 py-2 rounded-lg text-sm">
              {["work","academics","workout","diet","relationships","family","goals","personal"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="cyber-input px-3 py-2 rounded-lg text-sm">
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <div className="flex items-center gap-2">
              <input type="number" value={form.xpReward} onChange={e => setForm({ ...form, xpReward: Number(e.target.value) })}
                className="cyber-input px-3 py-2 rounded-lg text-sm w-24" min={10} max={500} />
              <span className="text-xs text-yellow-400 font-mono">XP reward</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isHabit} onChange={e => setForm({ ...form, isHabit: e.target.checked })} className="accent-cyan-400" />
              <span className="text-sm text-slate-400">Daily Habit</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="btn-cyber px-4 py-2 rounded-lg text-sm font-mono">Create Task</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-white/10 transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {filtered.map((task, i) => (
          <motion.div key={task._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={cn("glass-card rounded-xl p-4 flex items-center gap-4 group transition-all hover:border-cyan-400/20", task.status === "completed" && "opacity-60")}>
            <button onClick={() => toggle(task)}>
              {task.status === "completed" ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 text-slate-500 hover:text-cyan-400 transition-colors" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn("font-medium text-sm", task.status === "completed" && "line-through text-slate-500")}>{task.title}</p>
              {task.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>}
            </div>
            {task.isHabit && <span className="text-[10px] font-mono text-orange-400 border border-orange-400/30 bg-orange-400/10 px-2 py-0.5 rounded">🔥 {task.streak}d</span>}
            <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border", priorities[task.priority as keyof typeof priorities])}>{task.priority}</span>
            <span className="text-xs font-mono text-yellow-400">+{task.xpReward}xp</span>
            <button onClick={() => del(task._id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-600 font-mono">
            <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
}
