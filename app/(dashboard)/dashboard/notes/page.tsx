/**
 * app/(dashboard)/dashboard/notes/page.tsx — Knowledge Vault (Notes Editor)
 *
 * "use client" — required because this page uses hooks, refs, and browser APIs.
 *
 * Features:
 *  - Two-panel layout: note list sidebar on the left, editor on the right
 *  - Auto-save: saves to MongoDB 1.2 seconds after the user stops typing
 *  - Manual save: Save button + Ctrl/Cmd+S keyboard shortcut
 *  - Formatting toolbar: 11 markdown formatting buttons
 *  - Live title update: the sidebar shows the title as you type
 *  - Search: filters the note list in real time
 *
 * The stale closure problem (and how we solved it):
 *  A common React bug is when a useEffect captures an old value of state
 *  in its closure. If we used `active` directly in a setTimeout callback,
 *  the callback would always save the version of `active` from when the
 *  timeout was created — not the latest version.
 *
 *  Solution: `activeRef` is a ref that always points to the latest `active`.
 *  Refs don't cause re-renders and are always up-to-date, making them
 *  perfect for use inside async callbacks and timers.
 */
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Plus, Trash2, Save,
  Bold, Italic, Heading1, Heading2, List, ListOrdered,
  Code, Quote, Minus, Link2, Terminal
} from "lucide-react";

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

type SaveStatus = "saved" | "saving" | "unsaved";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [active, setActive] = useState<Note | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [search, setSearch] = useState("");
  const activeRef = useRef<Note | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync so auto-save always has latest value
  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/notes");
    const data = await res.json();
    setNotes(data);
    if (data.length > 0) {
      setActive(data[0]);
    }
  }

  const saveNote = useCallback(async (note: Note) => {
    setSaveStatus("saving");
    await fetch(`/api/notes/${note._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: note.title, content: note.content }),
    });
    setNotes(prev => prev.map(n => n._id === note._id ? { ...n, title: note.title, content: note.content, updatedAt: new Date().toISOString() } : n));
    setSaveStatus("saved");
  }, []);

  // Auto-save via ref (no stale closure)
  function scheduleAutoSave() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveStatus("unsaved");
    autoSaveTimer.current = setTimeout(() => {
      if (activeRef.current) saveNote(activeRef.current);
    }, 1200);
  }

  function handleTitleChange(val: string) {
    const updated = { ...activeRef.current!, title: val };
    setActive(updated);
    scheduleAutoSave();
  }

  function handleContentChange(val: string) {
    const updated = { ...activeRef.current!, content: val };
    setActive(updated);
    scheduleAutoSave();
  }

  async function manualSave() {
    if (activeRef.current) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      await saveNote(activeRef.current);
    }
  }

  async function newNote() {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled Note", content: "" }),
    });
    const note = await res.json();
    setNotes(n => [note, ...n]);
    setActive(note);
    setSaveStatus("saved");
  }

  async function del(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes(n => n.filter(note => note._id !== id));
    if (active?._id === id) setActive(null);
  }

  // ── Formatting helpers ──────────────────────────────────────────────────────
  function insertFormat(prefix: string, suffix = "", placeholder = "text") {
    const ta = textareaRef.current;
    if (!ta || !active) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.slice(start, end) || placeholder;
    const before = ta.value.slice(0, start);
    const after = ta.value.slice(end);
    const newContent = before + prefix + selected + suffix + after;
    handleContentChange(newContent);
    // Restore cursor after React re-render
    requestAnimationFrame(() => {
      ta.focus();
      const newCursor = start + prefix.length + selected.length + suffix.length;
      ta.setSelectionRange(newCursor, newCursor);
    });
  }

  function insertLinePrefix(prefix: string) {
    const ta = textareaRef.current;
    if (!ta || !active) return;
    const start = ta.selectionStart;
    const lineStart = ta.value.lastIndexOf("\n", start - 1) + 1;
    const before = ta.value.slice(0, lineStart);
    const after = ta.value.slice(lineStart);
    const newContent = before + prefix + after;
    handleContentChange(newContent);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }

  const toolbarButtons = [
    { icon: Bold,         label: "Bold",           action: () => insertFormat("**", "**", "bold text") },
    { icon: Italic,       label: "Italic",          action: () => insertFormat("*", "*", "italic text") },
    { icon: Heading1,     label: "Heading 1",       action: () => insertLinePrefix("# ") },
    { icon: Heading2,     label: "Heading 2",       action: () => insertLinePrefix("## ") },
    { icon: List,         label: "Bullet list",     action: () => insertLinePrefix("- ") },
    { icon: ListOrdered,  label: "Numbered list",   action: () => insertLinePrefix("1. ") },
    { icon: Code,         label: "Inline code",     action: () => insertFormat("`", "`", "code") },
    { icon: Terminal,     label: "Code block",      action: () => insertFormat("```\n", "\n```", "code here") },
    { icon: Quote,        label: "Blockquote",      action: () => insertLinePrefix("> ") },
    { icon: Minus,        label: "Divider",         action: () => handleContentChange((active?.content || "") + "\n---\n") },
    { icon: Link2,        label: "Link",            action: () => insertFormat("[", "](url)", "link text") },
  ];

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const statusLabel = saveStatus === "saving" ? "Saving..." : saveStatus === "unsaved" ? "Unsaved" : "Saved ✓";
  const statusColor = saveStatus === "saving" ? "text-yellow-400" : saveStatus === "unsaved" ? "text-orange-400" : "text-emerald-400";

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>Knowledge Vault</h1>
            <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{notes.length} notes</p>
          </div>
        </div>
        <button onClick={newNote} className="btn-cyber px-4 py-2 rounded-lg text-sm font-mono flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      <div className="flex gap-4 h-[calc(100%-4rem)]">
        {/* Sidebar */}
        <div className="w-64 flex flex-col gap-2 flex-shrink-0">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="cyber-input px-3 py-2 rounded-lg text-sm"
          />
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {filtered.map(note => (
              <motion.button
                key={note._id}
                onClick={() => { setActive(note); setSaveStatus("saved"); }}
                className={`w-full text-left p-3 rounded-lg transition-all group ${
                  active?._id === note._id
                    ? "bg-teal-400/10 border border-teal-400/20"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium truncate font-mono ${active?._id === note._id ? "text-teal-400" : ""}`}
                    style={active?._id !== note._id ? { color: "var(--text-secondary)" } : {}}>
                    {/* Show live title if this is the active note */}
                    {active?._id === note._id ? active.title : note.title}
                  </p>
                  <button
                    onClick={e => { e.stopPropagation(); del(note._id); }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 ml-1 flex-shrink-0 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs truncate mt-0.5 font-mono" style={{ color: "var(--text-muted)" }}>
                  {(active?._id === note._id ? active.content : note.content).slice(0, 50) || "Empty note"}
                </p>
                <p className="text-[10px] mt-1 font-mono" style={{ color: "var(--text-faint)" }}>
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </motion.button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs font-mono text-center pt-4" style={{ color: "var(--text-muted)" }}>No notes found</p>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 glass-card rounded-xl flex flex-col overflow-hidden">
          {active ? (
            <>
              {/* Title bar */}
              <div className="px-4 pt-4 pb-3 border-b flex items-center gap-3" style={{ borderColor: "var(--border-card)" }}>
                <input
                  value={active.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  className="flex-1 bg-transparent text-lg font-bold outline-none placeholder-slate-600 font-mono"
                  style={{ color: "var(--text-primary)" }}
                  placeholder="Note title..."
                />
                <span className={`text-xs font-mono ${statusColor}`}>{statusLabel}</span>
                <button
                  onClick={manualSave}
                  className="btn-cyber px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5"
                  title="Save (Ctrl+S)"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>

              {/* Formatting toolbar */}
              <div className="px-3 py-2 border-b flex items-center gap-0.5 flex-wrap" style={{ borderColor: "var(--border-card)", backgroundColor: "rgba(0,0,0,0.15)" }}>
                {toolbarButtons.map(({ icon: Icon, label, action }, i) => (
                  <button
                    key={i}
                    onClick={action}
                    title={label}
                    className="w-7 h-7 rounded flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
                <span className="ml-auto text-[10px] font-mono" style={{ color: "var(--text-faint)" }}>markdown</span>
              </div>

              {/* Content area */}
              <textarea
                ref={textareaRef}
                value={active.content}
                onChange={e => handleContentChange(e.target.value)}
                onKeyDown={e => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                    e.preventDefault();
                    manualSave();
                  }
                }}
                className="flex-1 bg-transparent text-sm p-4 resize-none outline-none font-mono leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
                placeholder={`# Start writing...\n\nUse the toolbar above or type markdown:\n- **bold**, *italic*, \`code\`\n- # Heading, ## Subheading\n- > Blockquote\n- [link text](url)`}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-faint)" }} />
                <p className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>Select a note or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
