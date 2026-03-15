"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Plus, BookOpen, Clock, Star, Trash2 } from "lucide-react";

interface Subject {
  _id: string;
  name: string;
  progress: number;
  hoursStudied: number;
  grade: string;
  color: string;
}

const colors = ["bg-violet-400", "bg-cyan-400", "bg-blue-400", "bg-pink-400", "bg-emerald-400", "bg-yellow-400", "bg-orange-400", "bg-teal-400"];

export default function AcademicsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", grade: "A", hoursStudied: 0 });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/academics");
    const data = await res.json();
    setSubjects(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function add() {
    if (!form.name.trim()) return;
    const color = colors[subjects.length % colors.length];
    await fetch("/api/academics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, color }),
    });
    setForm({ name: "", grade: "A", hoursStudied: 0 });
    setAdding(false);
    load();
  }

  async function updateProgress(id: string, progress: number) {
    await fetch(`/api/academics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress }),
    });
    load();
  }

  async function updateHours(id: string, hoursStudied: number) {
    await fetch(`/api/academics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hoursStudied }),
    });
    load();
  }

  async function del(id: string) {
    await fetch(`/api/academics/${id}`, { method: "DELETE" });
    load();
  }

  const totalHours = subjects.reduce((s, sub) => s + sub.hoursStudied, 0);
  const avgProgress = subjects.length ? Math.round(subjects.reduce((s, sub) => s + sub.progress, 0) / subjects.length) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">Academics</h1>
            <p className="text-xs text-slate-500 font-mono">Knowledge XP System</p>
          </div>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn-cyber px-4 py-2 rounded-lg text-sm font-mono flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Study Hours", value: totalHours, icon: Clock, color: "text-violet-400" },
          { label: "Avg Mastery", value: `${avgProgress}%`, icon: Star, color: "text-yellow-400" },
          { label: "Subjects", value: subjects.length, icon: BookOpen, color: "text-cyan-400" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-4 text-center">
            <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
            <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {adding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="glass-card rounded-xl p-5 mb-5 border border-violet-400/20">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Subject name..." className="cyber-input px-3 py-2 rounded-lg text-sm col-span-2" autoFocus />
            <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} className="cyber-input px-3 py-2 rounded-lg text-sm">
              {["A+","A","B+","B","C+","C","D"].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="btn-cyber px-4 py-2 rounded-lg text-sm font-mono">Add</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-white/10 transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-600 font-mono">Loading subjects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.length === 0 && (
            <div className="col-span-2 text-center py-12 text-slate-600 font-mono">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No subjects yet. Add your first one above.</p>
            </div>
          )}
          {subjects.map((sub, i) => (
            <motion.div key={sub._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl p-5 group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${sub.color}`} />
                  <h3 className="font-semibold text-sm text-white">{sub.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-violet-400 border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 rounded">{sub.grade}</span>
                  <button onClick={() => setEditing(editing === sub._id ? null : sub._id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-cyan-400 transition-all text-xs font-mono">edit</button>
                  <button onClick={() => del(sub._id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 font-mono mb-1">
                    <span>Mastery</span><span>{sub.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${sub.progress}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                      className={`h-full rounded-full ${sub.color}`} />
                  </div>
                  {editing === sub._id && (
                    <input type="range" min={0} max={100} value={sub.progress}
                      onChange={e => setSubjects(ss => ss.map(s => s._id === sub._id ? { ...s, progress: Number(e.target.value) } : s))}
                      onMouseUp={() => updateProgress(sub._id, sub.progress)}
                      onTouchEnd={() => updateProgress(sub._id, sub.progress)}
                      className="w-full accent-violet-400 mt-2 cursor-pointer" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{sub.hoursStudied}h studied</span>
                  </div>
                  {editing === sub._id && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">Hours:</span>
                      <input type="number" value={sub.hoursStudied} min={0}
                        onChange={e => setSubjects(ss => ss.map(s => s._id === sub._id ? { ...s, hoursStudied: Number(e.target.value) } : s))}
                        onBlur={() => updateHours(sub._id, sub.hoursStudied)}
                        className="cyber-input w-16 px-2 py-1 rounded text-xs" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
