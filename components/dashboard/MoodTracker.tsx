"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Smile, Zap } from "lucide-react";

const moods = ["😞", "😕", "😐", "🙂", "😊", "😄", "🤩", "⚡", "🔥", "💫"];
const energyLabels = ["Depleted", "Low", "Moderate", "Good", "Peak"];

export default function MoodTracker() {
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(3);
  const [saved, setSaved] = useState(false);

  async function save() {
    await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood, energy }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card rounded-xl p-5"
    >
      <h3 className="text-sm font-mono text-slate-300 uppercase tracking-wider mb-4">Mood & Energy</h3>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Smile className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs text-slate-400 font-mono">Mood: {moods[mood - 1]}</span>
          </div>
          <input
            type="range" min={1} max={10} value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full accent-yellow-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
            <span>Low</span><span>Peak</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-slate-400 font-mono">Energy: {energyLabels[Math.floor((energy - 1) / 2)]}</span>
          </div>
          <input
            type="range" min={1} max={10} value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <button
          onClick={save}
          className={`w-full py-2 rounded-lg text-xs font-mono transition-all ${
            saved ? "bg-emerald-400/20 text-emerald-400 border border-emerald-400/30" : "btn-cyber"
          }`}
        >
          {saved ? "✓ Logged" : "Log Status"}
        </button>
      </div>
    </motion.div>
  );
}
