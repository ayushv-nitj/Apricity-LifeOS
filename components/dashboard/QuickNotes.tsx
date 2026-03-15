"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Save, Trash2 } from "lucide-react";

interface Note {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export default function QuickNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [active, setActive] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadNotes(); }, []);

  async function loadNotes() {
    const res = await fetch("/api/notes");
    const data = await res.json();
    setNotes(data);
    if (data.length > 0 && !active) setActive(data[0]);
  }

  async function newNote() {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Note", content: "" }),
    });
    const note = await res.json();
    setNotes((n) => [note, ...n]);
    setActive(note);
  }

  const saveNote = useCallback(async (note: Note) => {
    setSaving(true);
    await fetch(`/api/notes/${note._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: note.title, content: note.content }),
    });
    setSaving(false);
  }, []);

  // Auto-save on change
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => saveNote(active), 1000);
    return () => clearTimeout(timer);
  }, [active, saveNote]);

  async function deleteNote(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes((n) => n.filter((note) => note._id !== id));
    setActive(null);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-mono text-slate-300 uppercase tracking-wider">Knowledge Vault</h3>
          {saving && <span className="text-[10px] text-slate-500 font-mono animate-pulse">saving...</span>}
        </div>
        <button onClick={newNote} className="btn-cyber px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
          <Plus className="w-3 h-3" /> Note
        </button>
      </div>

      <div className="flex gap-3 h-48">
        {/* Note list */}
        <div className="w-1/3 space-y-1 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note._id}
              onClick={() => setActive(note)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && setActive(note)}
              className={`w-full text-left px-2 py-2 rounded-lg text-xs transition-all group flex items-center justify-between cursor-pointer ${
                active?._id === note._id
                  ? "bg-teal-400/10 border border-teal-400/20 text-teal-400"
                  : "text-slate-400 hover:bg-white/5 border border-transparent"
              }`}
            >
              <span className="truncate">{note.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNote(note._id); }}
                className="opacity-0 group-hover:opacity-100 text-red-400 ml-1 flex-shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {notes.length === 0 && (
            <p className="text-xs text-slate-600 font-mono text-center pt-4">No notes yet</p>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col gap-2">
          {active ? (
            <>
              <input
                value={active.title}
                onChange={(e) => setActive({ ...active, title: e.target.value })}
                className="cyber-input px-3 py-1.5 rounded-lg text-xs font-mono"
                placeholder="Note title..."
              />
              <textarea
                value={active.content}
                onChange={(e) => setActive({ ...active, content: e.target.value })}
                className="cyber-input flex-1 px-3 py-2 rounded-lg text-xs resize-none font-mono leading-relaxed"
                placeholder="Write in markdown... # Heading, **bold**, - list"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Save className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-mono">Select or create a note</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
