"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

interface WeeklyPoint {
  day: string;
  tasks: number;
  habits: number;
  xp: number;
}

const empty: WeeklyPoint[] = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => ({ day, tasks: 0, habits: 0, xp: 0 }));

export default function ProductivityChart() {
  const [view, setView] = useState<"tasks" | "xp">("tasks");
  const [data, setData] = useState<WeeklyPoint[]>(empty);

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(d => { if (d.weeklyData) setData(d.weeklyData); });
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
        <div className="flex gap-1">
          {(["tasks", "xp"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                view === v ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        {view === "tasks" ? (
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1a2d4a", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#00f5ff" }} />
            <Bar dataKey="tasks" fill="#00f5ff" fillOpacity={0.8} radius={[4, 4, 0, 0]} name="Tasks" />
            <Bar dataKey="habits" fill="#bf00ff" fillOpacity={0.8} radius={[4, 4, 0, 0]} name="Habits" />
          </BarChart>
        ) : (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1a2d4a", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#00f5ff" }} />
            <Area type="monotone" dataKey="xp" stroke="#00f5ff" strokeWidth={2} fill="url(#xpGrad)" name="XP Gained" />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
}
