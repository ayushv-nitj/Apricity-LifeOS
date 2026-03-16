/**
 * components/dashboard/ProductivityChart.tsx — Weekly Productivity Visualization
 *
 * "use client" — uses useState, useEffect, and Recharts (browser-only).
 *
 * Renders a weekly chart with two view modes:
 *  - "tasks" view: BarChart showing tasks completed + habits per day
 *  - "xp" view: AreaChart showing XP earned per day
 *
 * Data source: GET /api/analytics returns { weeklyData: WeeklyPoint[] }
 * where each point has { day, tasks, habits, xp } for Mon-Sun.
 *
 * The `empty` array pre-fills all 7 days with zeros so the chart
 * always renders even before data loads (no layout shift).
 *
 * Recharts components used:
 *  - ResponsiveContainer: makes the chart fill its parent width
 *  - BarChart / AreaChart: the two chart types
 *  - CartesianGrid: subtle background grid lines
 *  - XAxis / YAxis: axis labels
 *  - Tooltip: hover popup with values
 *  - Bar / Area: the actual data series
 */
"use client";
import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";
import { motion } from "framer-motion";

// Shape of each data point in the weekly array
interface WeeklyPoint {
  day: string;   // "Mon", "Tue", etc.
  tasks: number; // tasks completed that day
  habits: number;// habits completed that day
  xp: number;    // XP earned that day
}

// Default empty data — all zeros for each day of the week
// This prevents the chart from being empty/broken before the API responds
const empty: WeeklyPoint[] = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(
  day => ({ day, tasks: 0, habits: 0, xp: 0 })
);

export default function ProductivityChart() {
  // Toggle between "tasks" bar chart and "xp" area chart
  const [view, setView] = useState<"tasks" | "xp">("tasks");
  const [data, setData] = useState<WeeklyPoint[]>(empty);

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(d => {
        // Only update if the API returned weeklyData (guard against errors)
        if (d.weeklyData) setData(d.weeklyData);
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono text-slate-300 uppercase tracking-wider">Weekly Productivity</h3>

        {/* View toggle buttons — "TASKS" and "XP" */}
        <div className="flex gap-1">
          {(["tasks", "xp"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                view === v
                  ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ResponsiveContainer makes the chart fill the card width automatically */}
      <ResponsiveContainer width="100%" height={180}>
        {view === "tasks" ? (
          // Bar chart: cyan bars for tasks, purple bars for habits
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#0a1628", border: "1px solid #1a2d4a", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#00f5ff" }}
            />
            <Bar dataKey="tasks" fill="#00f5ff" fillOpacity={0.8} radius={[4, 4, 0, 0]} name="Tasks" />
            <Bar dataKey="habits" fill="#bf00ff" fillOpacity={0.8} radius={[4, 4, 0, 0]} name="Habits" />
          </BarChart>
        ) : (
          // Area chart: filled gradient under the XP line
          <AreaChart data={data}>
            <defs>
              {/* SVG gradient — fades from 30% opacity at top to 0% at bottom */}
              <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#0a1628", border: "1px solid #1a2d4a", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#00f5ff" }}
            />
            {/* fill="url(#xpGrad)" references the SVG gradient defined above */}
            <Area type="monotone" dataKey="xp" stroke="#00f5ff" strokeWidth={2} fill="url(#xpGrad)" name="XP Gained" />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
}
