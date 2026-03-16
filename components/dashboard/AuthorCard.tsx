"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Github, Mail, Instagram, Linkedin, Zap, Code2, Terminal, Star, ExternalLink } from "lucide-react";

const SOCIAL_LINKS = [
  {
    icon: Instagram,
    label: "Instagram",
    handle: "@av_alanche._",
    href: "https://www.instagram.com/av_alanche._/?hl=en",
    color: "#e1306c",
    glow: "rgba(225,48,108,0.3)",
    bg: "rgba(225,48,108,0.08)",
    border: "rgba(225,48,108,0.25)",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    handle: "ayush-verma-jsr25",
    href: "https://www.linkedin.com/in/ayush-verma-jsr25/",
    color: "#0a66c2",
    glow: "rgba(10,102,194,0.3)",
    bg: "rgba(10,102,194,0.08)",
    border: "rgba(10,102,194,0.25)",
  },
  {
    icon: Github,
    label: "GitHub",
    handle: "ayushv-nitj",
    href: "https://github.com/ayushv-nitj",
    color: "#94a3b8",
    glow: "rgba(148,163,184,0.2)",
    bg: "rgba(148,163,184,0.06)",
    border: "rgba(148,163,184,0.2)",
  },
  {
    icon: Mail,
    label: "Email",
    handle: "ayushverma9d12@gmail.com",
    href: "mailto:ayushverma9d12@gmail.com",
    color: "#00f5ff",
    glow: "rgba(0,245,255,0.3)",
    bg: "rgba(0,245,255,0.06)",
    border: "rgba(0,245,255,0.2)",
  },
];

const SKILLS = ["Next.js", "React", "TypeScript", "MongoDB", "Node.js", "Tailwind"];

export function AuthorButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all group"
      style={{
        background: "rgba(0,245,255,0.04)",
        borderColor: "rgba(0,245,255,0.15)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(0,245,255,0.08)";
        e.currentTarget.style.borderColor = "rgba(0,245,255,0.3)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(0,245,255,0.04)";
        e.currentTarget.style.borderColor = "rgba(0,245,255,0.15)";
      }}
    >
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0">
        <Code2 className="w-3 h-3 text-white" />
      </div>
      <div className="text-left flex-1 min-w-0">
        <p className="text-xs font-mono font-semibold text-cyan-400 truncate">Built by Ayush Verma</p>
        <p className="text-[10px] font-mono" style={{ color: "var(--text-faint)" }}>View developer profile</p>
      </div>
      <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
    </button>
  );
}

export default function AuthorCard({ onClose }: { onClose: () => void }) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      >
        {/* Card — stop click propagation so clicking inside doesn't close */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: "rgba(5,10,20,0.95)",
            border: "1px solid rgba(0,245,255,0.2)",
            boxShadow: "0 0 60px rgba(0,245,255,0.1), 0 0 120px rgba(191,0,255,0.08), 0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          {/* Animated top border */}
          <div className="h-0.5 w-full" style={{
            background: "linear-gradient(90deg, transparent, #00f5ff, #bf00ff, #0080ff, transparent)"
          }} />

          {/* Grid background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(0,245,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,1) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }} />

          <div className="relative p-6">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
              style={{ color: "var(--text-muted)" }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header label */}
            <div className="flex items-center gap-2 mb-5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Developer Profile</span>
              <div className="flex-1 h-px" style={{ background: "rgba(0,245,255,0.15)" }} />
            </div>

            {/* Avatar + name */}
            <div className="flex items-center gap-4 mb-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden"
                  style={{ border: "2px solid rgba(0,245,255,0.3)", boxShadow: "0 0 20px rgba(0,245,255,0.2)" }}>
                  <div className="w-full h-full bg-gradient-to-br from-cyan-400/20 via-purple-500/20 to-blue-600/20 flex items-center justify-center">
                    <span className="text-3xl font-bold font-mono text-cyan-400">AV</span>
                  </div>
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 flex items-center justify-center"
                  style={{ borderColor: "#050a14" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                </div>
              </div>

              {/* Name + title */}
              <div>
                <h2 className="text-xl font-bold font-mono" style={{
                  background: "linear-gradient(135deg, #00f5ff, #bf00ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  Ayush Verma
                </h2>
                <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Full-Stack Developer
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-[10px] font-mono text-yellow-400">Creator of Apricity</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="rounded-xl p-3 mb-5 font-mono text-xs leading-relaxed"
              style={{ background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.1)", color: "var(--text-secondary)" }}>
              <span className="text-cyan-400">{">"}</span> Building tools that make life more organized and fun.
              Passionate about clean code, great UX, and turning ideas into reality.
              <span className="text-purple-400 animate-pulse ml-1">_</span>
            </div>

            {/* Skills */}
            <div className="mb-5">
              <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "var(--text-faint)" }}>
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SKILLS.map(skill => (
                  <span key={skill} className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                    style={{
                      background: "rgba(191,0,255,0.08)",
                      border: "1px solid rgba(191,0,255,0.2)",
                      color: "#bf00ff",
                    }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest mb-2.5" style={{ color: "var(--text-faint)" }}>
                Connect
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SOCIAL_LINKS.map(link => {
                  const Icon = link.icon;
                  const isHovered = hoveredLink === link.label;
                  return (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => setHoveredLink(link.label)}
                      onMouseLeave={() => setHoveredLink(null)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer"
                      style={{
                        background: isHovered ? link.bg : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isHovered ? link.border : "rgba(255,255,255,0.07)"}`,
                        boxShadow: isHovered ? `0 0 15px ${link.glow}` : "none",
                      }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ background: isHovered ? link.bg : "rgba(255,255,255,0.05)", border: `1px solid ${link.border}` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: link.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono font-semibold" style={{ color: link.color }}>{link.label}</p>
                        <p className="text-[9px] font-mono truncate" style={{ color: "var(--text-faint)" }}>{link.handle}</p>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 pt-4 flex items-center justify-between"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] font-mono" style={{ color: "var(--text-faint)" }}>
                  Apricity Life OS · 2025
                </span>
              </div>
              <span className="text-[10px] font-mono" style={{ color: "var(--text-faint)" }}>
                Made with <span className="text-red-400">♥</span> by AV
              </span>
            </div>
          </div>

          {/* Animated bottom border */}
          <div className="h-0.5 w-full" style={{
            background: "linear-gradient(90deg, transparent, #bf00ff, #00f5ff, transparent)"
          }} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
