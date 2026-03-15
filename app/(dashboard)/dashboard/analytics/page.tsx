"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";

const CAT_COLORS: Record<string, string> = {
  work: "#00f5ff", academics: "#a78bfa", workout: "#34d399",
  diet: "#fb923c", goals: "#60a5fa", personal: "#94a3b8",
  relationships: "#f472b6", family: "#fbbf24",
};

const tooltipStyle = { background: "#0a1628", border: "1px solid #1a2d4a", borderRadius: 8, fontSize: 12 };

interface AnalyticsData {
  weeklyData: { day: string; tasks: number; habits: number; xp: number }[];
  categoryData: { name: string; value: number }[];
  monthlyXP: { day: number; xp: number }[];
  radarData: { subject: string; value: number; color: string }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics").then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-600 font-mono">
      Loading analytics...
    </div>
  );

  if (!data) return null;

  const lifeScore = Math.round(data.radarData.reduce((s, d) => s + d.value, 0) / data.radarData.length);
  const weeklyXP = data.weeklyData.reduce((s, d) => s + d.xp, 0);
  const weeklyTasks = data.weeklyData.reduce((s, d) => s + d.tasks, 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white font-mono">Analytics</h1>
          <p className="text-xs text-slate-500 font-mono">Life performance overview</p>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Life Balance Score", value: `${lifeScore}/100`, color: "neon-cyan" },
          { label: "Weekly XP", value: weeklyXP.toLocaleString(), color: "text-yellow-400" },
          { label: "Tasks Done (7d)", value: weeklyTasks, color: "text-emerald-400" },
          { label: "Categories Active", value: data.categoryData.length, color: "text-orange-400" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Life Radar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-mono text-slate-300 uppercase tracking-wider mb-1">Life Balance Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={data.radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="rgba(0,245,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }} tickLine={false} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#334155", fontSize: 9 }} tickCount={4} axisLine={false} />
              <Radar name="Life Balance" dataKey="value" stroke="#00f5ff" fill="#00f5ff" fillOpacity={0.12} strokeWidth={2}
                dot={{ fill: "#00f5ff", r: 3, strokeWidth: 0 }} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#00f5ff" }}
                formatter={(v) => [`${v}/100`, "Score"]} />
            </RadarChart>
          </ResponsiveContainer>
          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
            {data.radarData.map((d) => (
              <div key={d.subject} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color || "#00f5ff" }} />
                <span className="text-[11px] font-mono flex-1 text-slate-500">{d.subject}</span>
                <div className="w-16 h-1 rounded-full overflow-hidden bg-white/5">
                  <div className="h-full rounded-full" style={{ width: `${d.value}%`, backgroundColor: d.color || "#00f5ff", opacity: 0.8 }} />
                </div>
                <span className="text-[10px] font-mono w-6 text-right" style={{ color: d.color || "#00f5ff" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category pie */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-mono text-slate-300 uppercase tracking-wider mb-4">Task Distribution</h3>
          {data.categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-600 font-mono text-sm">Complete tasks to see distribution</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {data.categoryData.map((entry, i) => (
                    <Cell key={i} fill={CAT_COLORS[entry.name] || "#94a3b8"} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Weekly bar chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card rounded-xl p-5 mb-5">
        <h3 className="text-sm font-mono text-slate-300 uppercase tracking-wider mb-4">Weekly Task & Habit Completion</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.weeklyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#00f5ff" }} />
            <Bar dataKey="tasks" fill="#00f5ff" fillOpacity={0.8} radius={[4, 4, 0, 0]} name="Tasks" />
            <Bar dataKey="habits" fill="#bf00ff" fillOpacity={0.8} radius={[4, 4, 0, 0]} name="Habits" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Monthly XP */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-mono text-slate-300 uppercase tracking-wider mb-4">30-Day XP Timeline</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data.monthlyXP}>
            <defs>
              <linearGradient id="xpGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#bf00ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#bf00ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#bf00ff" }} />
            <Area type="monotone" dataKey="xp" stroke="#bf00ff" strokeWidth={2} fill="url(#xpGrad2)" name="XP" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
