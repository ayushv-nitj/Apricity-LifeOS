"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Sparkles, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How am I doing this week?",
  "What should I focus on today?",
  "Analyze my life balance",
  "Tips to improve my mood",
];

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey operative 👋 I've loaded your life data. Ask me anything — task priorities, goal advice, mood analysis, or just a quick status report." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");

    const updated: Message[] = [...messages, { role: "user", content }];
    setMessages(updated);
    setLoading(true);

    try {
      // Only send actual conversation (exclude the initial greeting) to the API
      const apiMessages = updated.filter(m => !(m.role === "assistant" && m === messages[0]));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages(m => [...m, { role: "assistant", content: `Error ${res.status}: ${data.error || "Unknown error"}` }]);
      } else {
        setMessages(m => [...m, { role: "assistant", content: data.reply || "Sorry, I couldn't process that." }]);
      }
    } catch (err) {
      setMessages(m => [...m, { role: "assistant", content: `Failed: ${err instanceof Error ? err.message : "Unknown error"}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass-card rounded-2xl flex flex-col overflow-hidden"
            style={{ width: 360, height: 500, border: "1px solid rgba(191,0,255,0.25)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "rgba(191,0,255,0.2)", background: "rgba(191,0,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-mono font-semibold" style={{ color: "var(--text-primary)" }}>AI Advisor</p>
                  <p className="text-[10px] font-mono text-purple-400">Gemini · life data loaded</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                style={{ color: "var(--text-muted)" }}>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <Bot className="w-3 h-3 text-purple-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-xs font-mono leading-relaxed ${
                      m.role === "user"
                        ? "bg-purple-500/20 border border-purple-500/30 text-purple-100"
                        : "border"
                    }`}
                    style={m.role === "assistant" ? {
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "var(--text-secondary)",
                    } : {}}
                  >
                    {m.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 mb-1">{children}</ul>,
                          li: ({ children }) => <li>{children}</li>,
                          strong: ({ children }) => <strong className="text-purple-300 font-semibold">{children}</strong>,
                          code: ({ children }) => <code className="bg-white/10 px-1 rounded text-cyan-300">{children}</code>,
                        }}
                      >{m.content}</ReactMarkdown>
                    ) : m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    <Bot className="w-3 h-3 text-purple-400" />
                  </div>
                  <div className="px-3 py-2 rounded-xl border text-xs font-mono flex items-center gap-1.5"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
                    <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                    Analyzing your data...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick suggestions (only when just the greeting) */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg border transition-all hover:border-purple-400/40 hover:text-purple-300"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text-muted)", background: "rgba(255,255,255,0.03)" }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2"
                style={{ borderColor: "rgba(191,0,255,0.25)", background: "rgba(191,0,255,0.05)" }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Ask your AI advisor..."
                  className="flex-1 bg-transparent text-xs font-mono outline-none placeholder-slate-600"
                  style={{ color: "var(--text-primary)" }}
                  disabled={loading}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                  style={{ background: input.trim() ? "rgba(191,0,255,0.3)" : "transparent" }}
                >
                  <Send className="w-3 h-3 text-purple-400" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB toggle button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg relative"
        style={{
          background: "linear-gradient(135deg, rgba(191,0,255,0.8), rgba(0,128,255,0.8))",
          boxShadow: "0 0 20px rgba(191,0,255,0.4), 0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-2xl animate-ping opacity-20"
            style={{ background: "rgba(191,0,255,0.6)" }} />
        )}
      </motion.button>
    </div>
  );
}
