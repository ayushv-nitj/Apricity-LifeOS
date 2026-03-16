/**
 * components/dashboard/LifeRadar.tsx — Life Balance Radar Chart (Dashboard Widget)
 *
 * "use client" — fetches analytics data and renders a Recharts RadarChart.
 *
 * This is the compact dashboard version of the radar chart (also used in
 * the full Analytics page). It shows 6 life area scores on a hexagonal
 * radar chart, each axis ranging from 0-100.
 *
 * Life areas and how their scores are computed (in /api/analytics):
 *  - Health:        workout logs + diet tracking activity
 *  - Career:        work category task completions
 *  - Learning:      academics category task completions
 *  - Relationships: relationships + family task completions
 *  - Mental:        average mood score from Mood logs
 *  - Finance:       goals category completions (proxy for financial goals)
 *
 * FALLBACK data (all zeros) is shown while loading so the chart renders
 * immediately without a layout shift or empty state.
 *
 * `getScoreLabel` maps a 0-100 score to a human-readable label and color:
 *  - 80+: Excellent (green)
 *  - 60+: Good (cyan)
 *  - 40+: Fair (yellow)
 *  - <40: Needs work (red)
 *
 * `CustomTooltip` is a custom Recharts tooltip component that shows the
 * axis name, score, and label when hovering over a data point.
 *
 * The per-axis breakdown below the chart shows mini progress bars for
 * each life area so the user can see exact values without hovering.
 */
"use client";
import { useEffect, useState } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip,
} from "recharts";
import { motion } from "framer-motion";

interface RadarPoint {
  subject: string;
  value: number;
  color: string;
}

const FALLBACK: RadarPoint[] = [
  { subject: "Health",        value: 0, color: "#34d399" },
  { subject: "Career",        value: 0, color: "#00f5ff" },
  { subject: "Learning",      value: 0, color: "#a78bfa" },
  { subject: "Relationships", value: 0, color: "#f472b6" },
  { subject: "Mental",        value: 0, color: "#60a5fa" },
  { subject: "Finance",       value: 0, color: "#fbbf24" },
];

function getScoreLabel(v: number) {
  if (v >= 80) return { label: "Excellent", color: "#34d399" };
  if (v >= 60) return { label: "Good",      color: "#00f5ff" };
  if (v >= 40) return { label: "Fair",      color: "#fbbf24" };
  return              { label: "Needs work",color: "#f87171" };
}

// Custom tooltip
function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: RadarPoint }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const { label, color } = getScoreLabel(d.value);
  return (
    <div style={{ background: "#0a1628", border: "1px solid #1a2d4a", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <p style={{ color: d.color, fontFamily: "monospace", fontWeight: 600 }}>{d.subject}</p>
      <p style={{ color: "#e2e8f0", fontFamily: "monospace" }}>{d.value}<span style={{ color: "#64748b" }}>/100</span></p>
      <p style={{ color, fontFamily: "monospace", fontSize: 10 }}>{label}</p>
    </div>
  );
}

export default function LifeRadar() {
  const [data, setData] = useState<RadarPoint[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.radarData) && d.radarData.length > 0) {
          setData(d.radarData);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const avg = Math.round(data.reduce((s, d) => s + d.value, 0) / data.length);
  const { label: avgLabel, color: avgColor } = getScoreLabel(avg);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-mono uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
          Life Balance Radar
        </h3>
        <div className="text-right">
          <span className="text-2xl font-bold font-mono" style={{ color: avgColor }}>{avg}</span>
          <span className="text-xs font-mono ml-0.5" style={{ color: "var(--text-muted)" }}>/100</span>
          <p className="text-[10px] font-mono" style={{ color: avgColor }}>{avgLabel}</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="rgba(0,245,255,0.08)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "var(--text-muted, #64748b)", fontSize: 10, fontFamily: "monospace" }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#334155", fontSize: 9, fontFamily: "monospace" }}
            tickCount={4}
            axisLine={false}
          />
          <Radar
            name="Life Balance"
            dataKey="value"
            stroke="#00f5ff"
            fill="#00f5ff"
            fillOpacity={0.12}
            strokeWidth={2}
            dot={{ fill: "#00f5ff", r: 3, strokeWidth: 0 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Per-axis breakdown */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
        {data.map(d => (
          <div key={d.subject} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-[11px] font-mono flex-1 truncate" style={{ color: "var(--text-muted)" }}>
              {d.subject}
            </span>
            <div className="flex items-center gap-1">
              <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${d.value}%`, backgroundColor: d.color, opacity: 0.8 }}
                />
              </div>
              <span className="text-[10px] font-mono w-6 text-right" style={{ color: d.color }}>{d.value}</span>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <p className="text-[10px] font-mono text-center mt-2" style={{ color: "var(--text-faint)" }}>
          Computing life balance...
        </p>
      )}
    </motion.div>
  );
}
