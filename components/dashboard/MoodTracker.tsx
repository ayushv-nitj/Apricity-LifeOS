/**
 * components/dashboard/MoodTracker.tsx — Daily Mood & Energy Logger
 *
 * "use client" — uses useState and fetch (browser-only).
 *
 * Lets the user log their current mood (1-10) and energy level (1-10)
 * using two range sliders. On submit, a POST is made to /api/mood which
 * saves a Mood document to MongoDB.
 *
 * This data feeds into:
 *  - The Life Radar "Mental" and "Health" axes (via /api/analytics)
 *  - The AI Advisor context (avgMood and avgEnergy over last 7 days)
 *
 * The `moods` array maps a 1-10 number to an emoji for visual feedback.
 * The `energyLabels` array maps ranges to human-readable labels.
 *
 * UX pattern: after saving, the button briefly shows "✓ Logged" then
 * resets — this gives the user clear confirmation without a page reload.
 */
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Smile, Zap } from "lucide-react";

// Each index corresponds to a mood value 1-10 (index 0 = mood 1)
const moods = ["😞", "😕", "😐", "🙂", "😊", "😄", "🤩", "⚡", "🔥", "💫"];

// Energy is 1-10 but we bucket it into 5 labels using Math.floor((energy-1)/2)
const energyLabels = ["Depleted", "Low", "Moderate", "Good", "Peak"];

export default function MoodTracker() {
  // mood and energy are 1-10 integers controlled by range sliders
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(3);

  // `saved` briefly flips to true after a successful POST to show confirmation
  const [saved, setSaved] = useState(false);

  async function save() {
    // POST to /api/mood — the route creates a Mood document in MongoDB
    // with the current userId (from the session), mood, and energy values
    await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood, energy }),
    });

    // Show "✓ Logged" for 2 seconds, then reset the button label
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    // Framer Motion fade-in with a slight upward slide, delayed 0.4s
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card rounded-xl p-5"
    >
      <h3 className="text-sm font-mono text-slate-300 uppercase tracking-wider mb-4">Mood & Energy</h3>

      <div className="space-y-4">
        {/* Mood slider — accent-yellow-400 tints the native range thumb */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Smile className="w-3.5 h-3.5 text-yellow-400" />
            {/* moods[mood - 1] converts the 1-based slider value to a 0-based array index */}
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

        {/* Energy slider — accent-cyan-400 tints the native range thumb */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            {/* Math.floor((energy - 1) / 2) maps 1-10 → 0-4 for the 5 energyLabels */}
            <span className="text-xs text-slate-400 font-mono">Energy: {energyLabels[Math.floor((energy - 1) / 2)]}</span>
          </div>
          <input
            type="range" min={1} max={10} value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Submit button — changes style and label after a successful save */}
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
