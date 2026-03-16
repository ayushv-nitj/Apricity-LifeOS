/**
 * components/dashboard/XPHeader.tsx — Level & XP Progress Bar
 *
 * "use client" — fetches user data on mount using useEffect.
 *
 * Displays the current user's level and XP progress as a horizontal bar
 * at the top of the dashboard. The bar animates from 0 to the current
 * percentage using Framer Motion on first render.
 *
 * How XP / Level math works:
 *  - XP_PER_LEVEL = 1000 — every 1000 XP earns a new level
 *  - xpInLevel = user.xp % 1000 — XP earned within the current level
 *  - pct = (xpInLevel / 1000) * 100 — percentage to fill the bar
 *
 * Data source: GET /api/user returns { username, level, xp }
 */
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Star } from "lucide-react";

// Each level requires exactly 1000 XP
const XP_PER_LEVEL = 1000;

export default function XPHeader() {
  // Null until the fetch resolves — we return null early to avoid a flash of empty UI
  const [user, setUser] = useState<{ username: string; level: number; xp: number } | null>(null);

  useEffect(() => {
    // Fetch the current user's profile from the API on component mount
    fetch("/api/user").then((r) => r.json()).then(setUser);
  }, []); // Empty dependency array = run once when the component first mounts

  // Don't render anything until we have user data
  if (!user) return null;

  // XP within the current level (resets every 1000 XP)
  const xpInLevel = user.xp % XP_PER_LEVEL;

  // Percentage of the current level completed (0-100)
  const pct = (xpInLevel / XP_PER_LEVEL) * 100;

  return (
    // Slide down from above on first render
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4 mb-6 relative overflow-hidden"
    >
      {/* Subtle gradient overlay — purely decorative */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-transparent to-purple-400/5 pointer-events-none" />

      <div className="flex items-center gap-4 relative">
        {/* Level badge */}
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-mono text-yellow-400 font-bold">OPERATIVE LEVEL {user.level}</span>
        </div>

        <span className="text-slate-600">|</span>

        {/* XP counter */}
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-mono text-cyan-400">
            XP: {xpInLevel.toLocaleString()} / {XP_PER_LEVEL.toLocaleString()}
          </span>
        </div>

        {/* XP progress bar — animates width from 0 to pct% over 1.2 seconds */}
        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden ml-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="xp-bar h-full rounded-full relative"
          >
            {/* Pulsing white sheen on top of the bar for a glowing effect */}
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse-slow" />
          </motion.div>
        </div>

        {/* Numeric percentage label */}
        <span className="text-xs font-mono text-slate-400">{Math.round(pct)}%</span>
      </div>
    </motion.div>
  );
}
