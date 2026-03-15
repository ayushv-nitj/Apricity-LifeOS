"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Focus, X, Play, Pause, RotateCcw } from "lucide-react";

const POMODORO = 25 * 60;
const BREAK = 5 * 60;

export default function FocusMode() {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(POMODORO);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [task, setTask] = useState("");

  const reset = useCallback(() => {
    setRunning(false);
    setTime(isBreak ? BREAK : POMODORO);
  }, [isBreak]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          setRunning(false);
          setIsBreak((b) => !b);
          return isBreak ? POMODORO : BREAK;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, isBreak]);

  const mins = String(Math.floor(time / 60)).padStart(2, "0");
  const secs = String(time % 60).padStart(2, "0");
  const pct = ((isBreak ? BREAK : POMODORO) - time) / (isBreak ? BREAK : POMODORO);
  const circumference = 2 * Math.PI * 54;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-cyber-purple px-4 py-2 rounded-lg text-xs font-mono flex items-center gap-2"
      >
        <Focus className="w-3.5 h-3.5" /> Focus Mode
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card-purple rounded-2xl p-8 w-full max-w-sm text-center relative"
            >
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-sm font-mono text-purple-400 uppercase tracking-widest mb-2">
                {isBreak ? "Break Time" : "Focus Mode"}
              </h2>

              <input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="What are you focusing on?"
                className="cyber-input w-full px-3 py-2 rounded-lg text-sm text-center mb-6"
              />

              {/* Timer ring */}
              <div className="relative w-36 h-36 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(191,0,255,0.1)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke={isBreak ? "#34d399" : "#bf00ff"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pct)}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-mono font-bold text-white">{mins}:{secs}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button onClick={reset} className="p-2 text-slate-400 hover:text-white transition-colors">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRunning(!running)}
                  className="btn-cyber-purple px-6 py-2.5 rounded-xl font-mono text-sm flex items-center gap-2"
                >
                  {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {running ? "Pause" : "Start"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
