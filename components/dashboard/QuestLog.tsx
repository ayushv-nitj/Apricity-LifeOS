"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  _id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  xpReward: number;
}

const catColors: Record<string, string> = {
  work: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  academics: "text-violet-400 border-violet-400/30 bg-violet-400/10",
  workout: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  diet: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  relationships: "text-pink-400 border-pink-400/30 bg-pink-400/10",
  family: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  goals: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  personal: "text-slate-400 border-slate-400/30 bg-slate-400/10",
};

export default function QuestLog() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", category: "personal", priority: "medium" });

  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data.slice(0, 8));
  }

  async function toggleTask(task: Task) {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    await fetch(`/api/tasks/${task._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadTasks();
  }

  async function addTask() {
    if (!newTask.title.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, xpReward: 50 }),
    });
    setNewTask({ title: "", category: "personal", priority: "medium" });
    setAdding(false);
    loadTasks();
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    loadTasks();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono text-slate-300 uppercase tracking-wider">Quest Log</h3>
        <button
          onClick={() => setAdding(!adding)}
          className="btn-cyber px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> New Quest
        </button>
      </div>

      {adding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 p-3 rounded-lg border border-cyan-400/20 bg-cyan-400/5 space-y-2"
        >
          <input
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Quest title..."
            className="cyber-input w-full px-3 py-2 rounded-lg text-sm"
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            autoFocus
          />
          <div className="flex gap-2">
            <select
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              className="cyber-input flex-1 px-3 py-1.5 rounded-lg text-xs"
            >
              {["work","academics","workout","diet","relationships","family","goals","personal"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="cyber-input flex-1 px-3 py-1.5 rounded-lg text-xs"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button onClick={addTask} className="btn-cyber px-3 py-1.5 rounded-lg text-xs font-mono">Add</button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {tasks.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4 font-mono">No active quests. Add one above.</p>
        )}
        {tasks.map((task, i) => (
          <motion.div
            key={task._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all group",
              task.status === "completed"
                ? "border-white/5 bg-white/2 opacity-60"
                : "border-white/5 bg-white/2 hover:border-cyan-400/20"
            )}
          >
            <button onClick={() => toggleTask(task)} className="flex-shrink-0">
              {task.status === "completed"
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                : <Circle className="w-4 h-4 text-slate-500 hover:text-cyan-400 transition-colors" />
              }
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm truncate", task.status === "completed" && "line-through text-slate-500")}>
                {task.title}
              </p>
            </div>
            <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border flex-shrink-0", catColors[task.category] || catColors.personal)}>
              {task.category}
            </span>
            <span className="text-[10px] font-mono text-yellow-400 flex-shrink-0">+{task.xpReward}xp</span>
            <button
              onClick={() => deleteTask(task._id)}
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all flex-shrink-0"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>

      {tasks.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <Clock className="w-3 h-3 text-slate-500" />
          <span className="text-xs text-slate-500 font-mono">
            {tasks.filter(t => t.status === "completed").length}/{tasks.length} completed
          </span>
        </div>
      )}
    </motion.div>
  );
}
