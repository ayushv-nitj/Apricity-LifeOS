/**
 * app/(dashboard)/dashboard/diet/page.tsx — Daily Nutrition Tracker
 *
 * "use client" — all state, fetch calls, and interactions happen in the browser.
 *
 * Tracks today's meals and macronutrients. Only loads meals for today
 * (filtered by date in the API query string).
 *
 * Macro goals (hardcoded constants):
 *  - CAL_GOAL = 2200 kcal
 *  - PROTEIN_GOAL = 150g
 *  - Carbs reference: 250g (used for the progress bar only)
 *  - Fat reference: 70g (used for the progress bar only)
 *
 * Water tracker:
 *  - 8 glass buttons rendered with Array.from({ length: 8 })
 *  - Clicking a glass that's already filled (i < water) resets to that level
 *  - Clicking an unfilled glass (i >= water) fills up to that glass
 *  - Water count is local state only — not persisted to the DB
 *
 * Macro progress bars:
 *  - Each bar shows current / goal as a filled percentage
 *  - Math.min(..., 100) caps the bar at 100% so it doesn't overflow
 *
 * Data source: GET /api/meals?date=YYYY-MM-DD, POST /api/meals,
 *              DELETE /api/meals/:id
 */
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Apple, Plus, Droplets, Flame, Trash2 } from "lucide-react";

interface Meal {
  _id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  date: string;
}

const CAL_GOAL = 2200;
const PROTEIN_GOAL = 150;

export default function DietPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [water, setWater] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", calories: 0, protein: 0, carbs: 0, fat: 0, time: new Date().toTimeString().slice(0, 5) });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const res = await fetch(`/api/meals?date=${today}`);
    const data = await res.json();
    setMeals(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function add() {
    if (!form.name.trim()) return;
    await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, date: new Date().toISOString() }),
    });
    setForm({ name: "", calories: 0, protein: 0, carbs: 0, fat: 0, time: new Date().toTimeString().slice(0, 5) });
    setAdding(false);
    load();
  }

  async function del(id: string) {
    await fetch(`/api/meals/${id}`, { method: "DELETE" });
    load();
  }

  const totalCals = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = meals.reduce((s, m) => s + m.fat, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center">
            <Apple className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">Diet Tracker</h1>
            <p className="text-xs text-slate-500 font-mono">Today&apos;s Energy Meter</p>
          </div>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn-cyber px-4 py-2 rounded-lg text-sm font-mono flex items-center gap-2">
          <Plus className="w-4 h-4" /> Log Meal
        </button>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Calories", value: `${totalCals}/${CAL_GOAL}`, pct: (totalCals / CAL_GOAL) * 100, color: "bg-orange-400", text: "text-orange-400" },
          { label: "Protein", value: `${totalProtein}g/${PROTEIN_GOAL}g`, pct: (totalProtein / PROTEIN_GOAL) * 100, color: "bg-red-400", text: "text-red-400" },
          { label: "Carbs", value: `${totalCarbs}g`, pct: Math.min((totalCarbs / 250) * 100, 100), color: "bg-yellow-400", text: "text-yellow-400" },
          { label: "Fat", value: `${totalFat}g`, pct: Math.min((totalFat / 70) * 100, 100), color: "bg-blue-400", text: "text-blue-400" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-4">
            <p className={`text-lg font-bold font-mono ${s.text}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mb-2">{s.label}</p>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(s.pct, 100)}%` }} transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${s.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Water tracker */}
      <div className="glass-card rounded-xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-mono text-slate-300 uppercase tracking-wider">Water Intake</h3>
          <span className="text-xs text-blue-400 font-mono ml-auto">{water}/8 glasses</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 8 }, (_, i) => (
            <button key={i} onClick={() => setWater(i < water ? i : i + 1)}
              className={`w-10 h-10 rounded-lg border transition-all text-lg ${i < water ? "bg-blue-400/20 border-blue-400/40" : "border-white/10 text-slate-600 hover:border-blue-400/20"}`}>
              💧
            </button>
          ))}
        </div>
      </div>

      {adding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="glass-card rounded-xl p-5 mb-5 border border-orange-400/20">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Meal name..." className="cyber-input px-3 py-2 rounded-lg text-sm col-span-2" autoFocus />
            {(["calories", "protein", "carbs", "fat"] as const).map((k) => (
              <div key={k}>
                <label className="text-xs text-slate-400 font-mono mb-1 block capitalize">{k}{k !== "calories" ? " (g)" : " (kcal)"}</label>
                <input type="number" value={form[k]}
                  onChange={e => setForm({ ...form, [k]: Number(e.target.value) })}
                  className="cyber-input px-3 py-2 rounded-lg text-sm w-full" min={0} />
              </div>
            ))}
            <div>
              <label className="text-xs text-slate-400 font-mono mb-1 block">Time</label>
              <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="cyber-input px-3 py-2 rounded-lg text-sm w-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="btn-cyber px-4 py-2 rounded-lg text-sm font-mono">Log Meal</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-white/10 transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-8 text-slate-600 font-mono">Loading meals...</div>
      ) : (
        <div className="space-y-3">
          {meals.length === 0 && (
            <div className="text-center py-12 text-slate-600 font-mono">
              <Apple className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No meals logged today. Add your first meal above.</p>
            </div>
          )}
          {meals.map((meal, i) => (
            <motion.div key={meal._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-4 flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-lg bg-orange-400/10 border border-orange-400/20 flex items-center justify-center flex-shrink-0">
                <Apple className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-white">{meal.name}</p>
                <div className="flex gap-3 mt-1">
                  {[["P", meal.protein, "text-red-400"], ["C", meal.carbs, "text-yellow-400"], ["F", meal.fat, "text-blue-400"]].map(([l, v, c]) => (
                    <span key={l as string} className={`text-[10px] font-mono ${c}`}>{l}: {v}g</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-orange-400 flex items-center gap-1"><Flame className="w-3 h-3" />{meal.calories}</p>
                <p className="text-xs text-slate-500 font-mono">{meal.time}</p>
              </div>
              <button onClick={() => del(meal._id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
