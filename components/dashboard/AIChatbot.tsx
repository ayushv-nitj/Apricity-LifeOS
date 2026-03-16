/**
 * components/dashboard/AIChatbot.tsx — Floating AI Advisor Chatbot
 *
 * "use client" — required because this component uses:
 *  - useState / useRef / useEffect (React hooks)
 *  - fetch() to call /api/chat
 *  - DOM refs (auto-scroll, input focus)
 *
 * UI structure:
 *  - A fixed floating button (FAB) in the bottom-right corner
 *  - Clicking it opens/closes an animated chat window
 *  - Messages are rendered with ReactMarkdown so the AI can use bold, lists, etc.
 *
 * Key design decisions:
 *  - The initial greeting is stored in React state but NOT sent to the API.
 *    It's purely cosmetic — Gemini doesn't need to know about it.
 *  - `bottomRef` is a div at the end of the message list. Scrolling it into
 *    view automatically keeps the latest message visible.
 *  - `inputRef` lets us programmatically focus the input when the chat opens.
 */
"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Sparkles, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

/* ── Types ────────────────────────────────────────────────────────────────── */
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Quick-start suggestion buttons shown before the first user message.
const SUGGESTIONS = [
  "How am I doing this week?",
  "What should I focus on today?",
  "Analyze my life balance",
  "Tips to improve my mood",
];

export default function AIChatbot() {
  /* ── State ──────────────────────────────────────────────────────────────── */
  const [open, setOpen] = useState(false);           // Is the chat window visible?
  const [messages, setMessages] = useState<Message[]>([
    // Initial greeting shown to the user — NOT sent to the AI API.
    { role: "assistant", content: "Hey operative 👋 I've loaded your life data. Ask me anything — task priorities, goal advice, mood analysis, or just a quick status report." },
  ]);
  const [input, setInput] = useState("");            // Current text in the input box
  const [loading, setLoading] = useState(false);     // True while waiting for AI response

  /* ── Refs ───────────────────────────────────────────────────────────────── */
  // `bottomRef` is attached to an invisible div at the bottom of the message list.
  // Calling scrollIntoView() on it scrolls the chat to the latest message.
  const bottomRef = useRef<HTMLDivElement>(null);
  // `inputRef` lets us focus the text input programmatically when the chat opens.
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Auto-scroll to bottom when messages change or chat opens ───────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  /* ── Auto-focus input when chat opens ──────────────────────────────────── */
  useEffect(() => {
    // Small delay ensures the animation has started before we focus.
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  /* ── send — Core function that sends a message to the AI ───────────────── */
  async function send(text?: string) {
    // `text` is provided when clicking a suggestion button.
    // Otherwise we use whatever is in the input box.
    const content = (text ?? input).trim();
    if (!content || loading) return;  // Don't send empty messages or while loading
    setInput("");  // Clear the input immediately for better UX

    // Add the user's message to the conversation display.
    const updated: Message[] = [...messages, { role: "user", content }];
    setMessages(updated);
    setLoading(true);

    try {
      // Filter out the initial greeting before sending to the API.
      // Gemini requires history to start with a "user" message, not "assistant".
      const apiMessages = updated.filter(m => !(m.role === "assistant" && m === messages[0]));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Show the actual error from the server (helpful for debugging).
        setMessages(m => [...m, { role: "assistant", content: `Error ${res.status}: ${data.error || "Unknown error"}` }]);
      } else {
        // Append the AI's reply to the conversation.
        setMessages(m => [...m, { role: "assistant", content: data.reply || "Sorry, I couldn't process that." }]);
      }
    } catch (err) {
      setMessages(m => [...m, { role: "assistant", content: `Failed: ${err instanceof Error ? err.message : "Unknown error"}` }]);
    } finally {
      setLoading(false);  // Always re-enable the input, even if there was an error
    }
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    // `fixed` positioning keeps this in the corner regardless of page scroll.
    // `z-50` ensures it renders above all other content.
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Chat window — AnimatePresence enables exit animations ─────────── */}
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

            {/* Message list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, i) => (
                // User messages align right, assistant messages align left.
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {/* Bot avatar — only shown for assistant messages */}
                  {m.role === "assistant" && (
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <Bot className="w-3 h-3 text-purple-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-xs font-mono leading-relaxed ${
                      m.role === "user" ? "bg-purple-500/20 border border-purple-500/30 text-purple-100" : "border"
                    }`}
                    style={m.role === "assistant" ? {
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "var(--text-secondary)",
                    } : {}}
                  >
                    {/* ReactMarkdown renders **bold**, - lists, `code` etc. from the AI response */}
                    {m.role === "assistant" ? (
                      <ReactMarkdown components={{
                        p:      ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                        ul:     ({ children }) => <ul className="list-disc list-inside space-y-0.5 mb-1">{children}</ul>,
                        li:     ({ children }) => <li>{children}</li>,
                        strong: ({ children }) => <strong className="text-purple-300 font-semibold">{children}</strong>,
                        code:   ({ children }) => <code className="bg-white/10 px-1 rounded text-cyan-300">{children}</code>,
                      }}>{m.content}</ReactMarkdown>
                    ) : m.content}
                  </div>
                </div>
              ))}

              {/* Loading indicator while waiting for AI response */}
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

              {/* Invisible div at the bottom — scrolled into view to show latest message */}
              <div ref={bottomRef} />
            </div>

            {/* Quick suggestion chips — only shown before the first user message */}
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

            {/* Text input area */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2"
                style={{ borderColor: "rgba(191,0,255,0.25)", background: "rgba(191,0,255,0.05)" }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  // Enter key sends the message (Shift+Enter would be a newline if we supported it)
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

      {/* ── FAB (Floating Action Button) — opens/closes the chat ─────────── */}
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
        {/* AnimatePresence with mode="wait" ensures the exit animation completes
            before the enter animation starts — prevents both icons showing at once. */}
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

        {/* Pulsing ring animation — draws attention to the button when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-2xl animate-ping opacity-20"
            style={{ background: "rgba(191,0,255,0.6)" }} />
        )}
      </motion.button>
    </div>
  );
}
