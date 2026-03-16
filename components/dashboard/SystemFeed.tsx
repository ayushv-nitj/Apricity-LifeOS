/**
 * components/dashboard/SystemFeed.tsx — Real-Time Activity Log
 *
 * "use client" — fetches activity data on mount.
 *
 * Displays a scrollable feed of recent user actions (completed tasks,
 * level-ups, XP gains, streaks, achievements). This is the "game log"
 * equivalent — every meaningful action the user takes gets recorded
 * as an Activity document in MongoDB and shows up here.
 *
 * Data source: GET /api/activity returns Activity[] sorted by newest first.
 *
 * The `typeConfig` map assigns an icon and color to each activity type,
 * so the feed is visually scannable at a glance.
 *
 * `formatDistanceToNow` from date-fns converts ISO timestamps to
 * human-readable relative times like "2 minutes ago".
 */
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Zap, Trophy, Flame, Star, Target } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Shape of each activity item returned by the API
interface ActivityItem {
  _id: string;
  type: string;
  message: string;
  xp: number;
  createdAt: string;
}

// Maps activity type strings to a Lucide icon and a Tailwind color class
// `typeof Zap` is used as the type for any Lucide icon component
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
    fetch("/api/activity")
      .then(r => r.json())
      .then(d => {
        // Guard against non-array responses (e.g. error objects)
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
        {/* Pulsing green dot — indicates the feed is "live" */}
        <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* max-h-48 + overflow-y-auto makes this scrollable without growing the card */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {feed.length === 0 && (
          <p className="text-xs text-slate-600 font-mono text-center py-4">
            No activity yet. Complete tasks to see your feed.
          </p>
        )}
        {feed.map((item, i) => {
          // Fall back to task_complete config if the type is unrecognized
          const cfg = typeConfig[item.type] || typeConfig.task_complete;
          const Icon = cfg.icon;
          return (
            // Staggered slide-in animation for each feed item
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-2.5 rounded-lg bg-white/2 border border-white/5 hover:border-cyan-400/10 transition-all"
            >
              {/* Activity type icon */}
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${cfg.color}`} />

              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 font-mono leading-relaxed">{item.message}</p>
              </div>

              {/* Relative timestamp — e.g. "3 minutes ago" */}
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
