/**
 * app/(dashboard)/dashboard/workout/page.tsx — Workout Logger
 *
 * "use client" — all state, fetch calls, and interactions happen in the browser.
 *
 * Logs workout sessions with type, duration, calories, and optional notes.
 * Each session is stored as a Workout document in MongoDB.
 *
 * Stats computed client-side from the loaded logs:
 *  - weeklyMinutes: total duration across all logs
 *  - weeklyCalories: total calories across all logs
 *  - streak: consecutive days with at least one workout, counting backwards
 *    from today using a Set of unique date strings
 *
 * Streak algorithm:
 *  1. Build a Set of unique date strings from all log dates
 *  2. Start from today and walk backwards day by day
 *  3. Increment streak counter while each day exists in the Set
 *  4. Stop as soon as a day is missing
 *
 * Data source: GET/POST /api/workout, DELETE /api/workout/:id
 */
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Plus, Flame, TrendingUp, Trash2 } from "lucide-react";

const workoutTypes = ["Strength", "Cardio", "Yoga", "HIIT", "Swimming", "Cycling", "Running", "Other"];

interface WorkoutLog {
  _id: string;
  type: string;
  duration: number;
  calories: number;
  notes: string;
  date: string;
}

export default function WorkoutPage() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ type: "Strength", duration: 45, calories: 300, notes: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/workout");
    const data = await res.json();
    setLogs(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function add() {
    if (!form.type) return;
    await fetch("/api/workout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, date: new Date().toISOString() }),
    });
    setForm({ type: "Strength", duration: 45, calories: 300, notes: "" });
    setAdding(false);
    load();
  }

  async function del(id: string) {
    await fetch(`/api/workout/${id}`, { method: "DELETE" });
    load();
  }

  const weeklyMinutes = logs.reduce((s, l) => s + l.duration, 0);
  const weeklyCalories = logs.reduce((s, l) => s + l.calories, 0);

  // Compute streak: consecutive days with at least one workout
  const streak = (() => {
    const days = new Set(logs.map(l => new Date(l.date).toDateString()));
    let count = 0;
    const d = new Date();
    while (days.has(d.toDateString())) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">Workout Tracker</h1>
            <p className="text-xs text-slate-500 font-mono">Strength Skill Tree</p>
          </div>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn-cyber px-4 py-2 rounded-lg text-sm font-mono flex items-center gap-2">
          <Plus className="w-4 h-4" /> Log Workout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Weekly Minutes", value: weeklyMinutes, icon: TrendingUp, color: "text-emerald-400" },
          { label: "Calories Burned", value: weeklyCalories, icon: Flame, color: "text-orange-400" },
          { label: "Workout Streak", value: `${streak} day${streak !== 1 ? "s" : ""} 🔥`, icon: Dumbbell, color: "text-cyan-400" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-4 text-center">
            <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
            <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Add form */}
      {adding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="glass-card rounded-xl p-5 mb-5 border border-emerald-400/20">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="cyber-input px-3 py-2 rounded-lg text-sm col-span-2">
              {workoutTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div>
              <label className="text-xs text-slate-400 font-mono mb-1 block">Duration (min)</label>
              <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} className="cyber-input px-3 py-2 rounded-lg text-sm w-full" min={1} />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-mono mb-1 block">Calories</label>
              <input type="number" value={form.calories} onChange={e => setForm({ ...form, calories: Number(e.target.value) })} className="cyber-input px-3 py-2 rounded-lg text-sm w-full" min={0} />
            </div>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes (e.g. Chest + Triceps)..." className="cyber-input px-3 py-2 rounded-lg text-sm col-span-2" />
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="btn-cyber px-4 py-2 rounded-lg text-sm font-mono">Log It</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-white/10 transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Log */}
      {loading ? (
        <div className="text-center py-12 text-slate-600 font-mono">Loading workouts...</div>
      ) : (
        <div className="space-y-3">
          {logs.length === 0 && (
            <div className="text-center py-12 text-slate-600 font-mono">
              <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No workouts logged yet. Add your first session above.</p>
            </div>
          )}
          {logs.map((log, i) => (
            <motion.div key={log._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-4 flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center flex-shrink-0">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-white">{log.type}</p>
                {log.notes && <p className="text-xs text-slate-500">{log.notes}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-emerald-400">{log.duration} min</p>
                <p className="text-xs text-slate-500 font-mono">{log.calories} kcal</p>
              </div>
              <div className="text-xs text-slate-600 font-mono">{new Date(log.date).toLocaleDateString()}</div>
              <button onClick={() => del(log._id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
