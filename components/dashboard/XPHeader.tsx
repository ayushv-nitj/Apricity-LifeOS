"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Star } from "lucide-react";

const XP_PER_LEVEL = 1000;

export default function XPHeader() {
  const [user, setUser] = useState<{ username: string; level: number; xp: number } | null>(null);

  useEffect(() => {
    fetch("/api/user").then((r) => r.json()).then(setUser);
  }, []);

  if (!user) return null;

  const xpInLevel = user.xp % XP_PER_LEVEL;
  const pct = (xpInLevel / XP_PER_LEVEL) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4 mb-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-transparent to-purple-400/5 pointer-events-none" />
      <div className="flex items-center gap-4 relative">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-mono text-yellow-400 font-bold">OPERATIVE LEVEL {user.level}</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-mono text-cyan-400">XP: {xpInLevel.toLocaleString()} / {XP_PER_LEVEL.toLocaleString()}</span>
        </div>
        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden ml-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="xp-bar h-full rounded-full relative"
          >
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse-slow" />
          </motion.div>
        </div>
        <span className="text-xs font-mono text-slate-400">{Math.round(pct)}%</span>
      </div>
    </motion.div>
  );
}
