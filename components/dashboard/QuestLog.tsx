/**
 * components/dashboard/QuestLog.tsx — Task Manager (RPG "Quest" theme)
 *
 * "use client" — all state and fetch calls happen in the browser.
 *
 * This is the main task management widget on the dashboard. It:
 *  1. Loads the user's tasks from GET /api/tasks on mount
 *  2. Lets the user add new tasks via an inline form
 *  3. Lets the user toggle tasks complete/incomplete via PATCH /api/tasks/:id
 *  4. Lets the user delete tasks via DELETE /api/tasks/:id
 *
 * When a task is marked complete, the API route also:
 *  - Awards XP to the user (stored in User.xp)
 *  - Creates an Activity log entry (shown in SystemFeed)
 *  - Levels up the user if XP crosses a threshold
 *
 * The `catColors` map gives each task category a unique color badge
 * so the user can visually scan tasks by type at a glance.
 */
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Task shape returned by the API
interface Task {
  _id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  xpReward: number;
}

// Tailwind class strings for each category badge — color-coded for quick scanning
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

  // Controls whether the "add task" form is visible
  const [adding, setAdding] = useState(false);

  // Controlled form state for the new task being created
  const [newTask, setNewTask] = useState({ title: "", category: "personal", priority: "medium" });

  // Load tasks when the component first mounts
  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    // Only show the 8 most recent tasks to keep the widget compact
    setTasks(data.slice(0, 8));
  }

  async function toggleTask(task: Task) {
    // Toggle between "completed" and "pending"
    const newStatus = task.status === "completed" ? "pending" : "completed";
    await fetch(`/api/tasks/${task._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    // Reload to reflect XP changes and updated status
    loadTasks();
  }

  async function addTask() {
    // Don't submit if the title is empty or just whitespace
    if (!newTask.title.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // xpReward defaults to 50 — could be made dynamic based on priority later
      body: JSON.stringify({ ...newTask, xpReward: 50 }),
    });
    // Reset form and close the add panel
    setNewTask({ title: "", category: "personal", priority: "medium" });
    setAdding(false);
    loadTasks();
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    // Optimistically remove from local state without a full reload
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
        {/* Toggle the add-task form */}
        <button
          onClick={() => setAdding(!adding)}
          className="btn-cyber px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> New Quest
        </button>
      </div>

      {/* Inline add-task form — animates open/closed */}
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
            // Allow pressing Enter to submit instead of clicking the Add button
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            autoFocus
          />
          <div className="flex gap-2">
            {/* Category selector — maps to catColors for badge styling */}
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
          // Each task animates in from the left with a staggered delay
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
            {/* Toggle complete button — circle becomes a checkmark when done */}
            <button onClick={() => toggleTask(task)} className="flex-shrink-0">
              {task.status === "completed"
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                : <Circle className="w-4 h-4 text-slate-500 hover:text-cyan-400 transition-colors" />
              }
            </button>

            <div className="flex-1 min-w-0">
              {/* Strike-through text when completed */}
              <p className={cn("text-sm truncate", task.status === "completed" && "line-through text-slate-500")}>
                {task.title}
              </p>
            </div>

            {/* Category badge — color from catColors map */}
            <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border flex-shrink-0", catColors[task.category] || catColors.personal)}>
              {task.category}
            </span>

            {/* XP reward label */}
            <span className="text-[10px] font-mono text-yellow-400 flex-shrink-0">+{task.xpReward}xp</span>

            {/* Delete button — only visible on hover via group-hover */}
            <button
              onClick={() => deleteTask(task._id)}
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all flex-shrink-0"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Completion counter at the bottom */}
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
