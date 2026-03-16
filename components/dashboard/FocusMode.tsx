/**
 * components/dashboard/FocusMode.tsx — Pomodoro Timer (Focus Mode)
 *
 * "use client" — all timer logic runs in the browser using useState/useEffect.
 *
 * Implements the Pomodoro Technique:
 *  - 25-minute focus session (POMODORO constant)
 *  - 5-minute break (BREAK constant)
 *  - Automatically switches between focus and break when the timer hits 0
 *
 * The timer is rendered as an SVG circle with a stroke-dashoffset animation
 * that visually "drains" as time passes — a classic circular progress ring.
 *
 * How the SVG ring works:
 *  - circumference = 2 * π * r (r = 54) — total length of the circle's stroke
 *  - strokeDasharray = circumference — makes the stroke one continuous dash
 *  - strokeDashoffset = circumference * (1 - pct) — hides the portion not yet elapsed
 *  - As pct goes from 0 → 1, the offset goes from circumference → 0 (ring fills up)
 *
 * The modal uses AnimatePresence so it fades/scales in and out smoothly.
 * Clicking outside the modal card (on the backdrop) closes it.
 */
"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Focus, X, Play, Pause, RotateCcw } from "lucide-react";

// Timer durations in seconds
const POMODORO = 25 * 60; // 1500 seconds
const BREAK = 5 * 60;     // 300 seconds

export default function FocusMode() {
  // Controls whether the modal overlay is visible
  const [open, setOpen] = useState(false);

  // Current countdown value in seconds
  const [time, setTime] = useState(POMODORO);

  // Whether the timer is actively counting down
  const [running, setRunning] = useState(false);

  // Tracks whether we're in a break session or a focus session
  const [isBreak, setIsBreak] = useState(false);

  // Optional task label the user can type in to stay focused
  const [task, setTask] = useState("");

  // Reset timer to the start of the current session type
  // useCallback prevents this from being recreated on every render
  const reset = useCallback(() => {
    setRunning(false);
    setTime(isBreak ? BREAK : POMODORO);
  }, [isBreak]);

  useEffect(() => {
    // Don't start an interval if the timer isn't running
    if (!running) return;

    const interval = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          // Timer hit zero — stop and flip between focus/break
          setRunning(false);
          setIsBreak((b) => !b);
          // Return the duration for the NEXT session type
          return isBreak ? POMODORO : BREAK;
        }
        return t - 1; // Decrement by 1 second
      });
    }, 1000);

    // Cleanup: clear the interval when the component unmounts or running changes
    return () => clearInterval(interval);
  }, [running, isBreak]);

  // Format seconds into MM:SS display string
  const mins = String(Math.floor(time / 60)).padStart(2, "0");
  const secs = String(time % 60).padStart(2, "0");

  // Progress percentage (0 = start, 1 = complete)
  const pct = ((isBreak ? BREAK : POMODORO) - time) / (isBreak ? BREAK : POMODORO);

  // SVG circle math: circumference of a circle with radius 54
  const circumference = 2 * Math.PI * 54;

  return (
    <>
      {/* Trigger button — sits in the dashboard top bar */}
      <button
        onClick={() => setOpen(true)}
        className="btn-cyber-purple px-4 py-2 rounded-lg text-xs font-mono flex items-center gap-2"
      >
        <Focus className="w-3.5 h-3.5" /> Focus Mode
      </button>

      {/* AnimatePresence enables exit animations when `open` becomes false */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            // Close when clicking the backdrop (but not the card itself)
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

              {/* Optional focus task label */}
              <input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="What are you focusing on?"
                className="cyber-input w-full px-3 py-2 rounded-lg text-sm text-center mb-6"
              />

              {/* SVG circular progress ring */}
              <div className="relative w-36 h-36 mx-auto mb-6">
                {/* -rotate-90 starts the stroke at the top (12 o'clock) */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Background track circle */}
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(191,0,255,0.1)" strokeWidth="8" />
                  {/* Progress arc — strokeDashoffset controls how much is visible */}
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
                {/* Timer digits centered inside the ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-mono font-bold text-white">{mins}:{secs}</span>
                </div>
              </div>

              {/* Controls: reset and play/pause */}
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
