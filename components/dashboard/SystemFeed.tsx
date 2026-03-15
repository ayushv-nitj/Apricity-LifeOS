"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Zap, Trophy, Flame, Star, Target } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  _id: string;
  type: string;
  message: string;
  xp: number;
  createdAt: string;
}

const typeConfig: Record<string, { icon: typeof Zap; color: string }> = {
  task_complete: { icon: Zap, color: "text-cyan-400" },
  goal_complete: { icon: Target, color: "text-blue-400" },
  level_up: { icon: Star, color: "text-yellow-400" },
  streak: { icon: Flame, color: "text-orange-400" },
  xp_gain: { icon: Zap, color: "text-emerald-400" },
  achievement: { icon: Trophy, color: "text-purple-400" },
};

export default function SystemFeed() {
  const [feed, setFeed] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetch("/api/activity").then(r => r.json()).then(d => {
      setFeed(Array.isArray(d) ? d : []);
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass-card rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-mono text-slate-300 uppercase tracking-wider">System Feed</h3>
        <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {feed.length === 0 && (
          <p className="text-xs text-slate-600 font-mono text-center py-4">
            No activity yet. Complete tasks to see your feed.
          </p>
        )}
        {feed.map((item, i) => {
          const cfg = typeConfig[item.type] || typeConfig.task_complete;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-2.5 rounded-lg bg-white/2 border border-white/5 hover:border-cyan-400/10 transition-all"
            >
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 font-mono leading-relaxed">{item.message}</p>
              </div>
              <span className="text-[10px] text-slate-600 font-mono flex-shrink-0 whitespace-nowrap">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
