"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Calendar, Heart, Trash2 } from "lucide-react";

interface FamilyMember {
  _id: string;
  name: string;
  relation: string;
  birthday?: string;
  notes: string;
  bondLevel: number;
  lastContact: string;
}

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", relation: "Parent", birthday: "", notes: "", bondLevel: 80, lastContact: "Today" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/contacts?type=family");
    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function add() {
    if (!form.name.trim()) return;
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, type: "family", affinity: form.bondLevel }),
    });
    setForm({ name: "", relation: "Parent", birthday: "", notes: "", bondLevel: 80, lastContact: "Today" });
    setAdding(false);
    load();
  }

  async function updateBond(id: string, bondLevel: number) {
    await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bondLevel, affinity: bondLevel }),
    });
    load();
  }

  async function del(id: string) {
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">Family</h1>
            <p className="text-xs text-slate-500 font-mono">Bond Level Tracker</p>
          </div>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn-cyber px-4 py-2 rounded-lg text-sm font-mono flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {adding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="glass-card rounded-xl p-5 mb-5 border border-yellow-400/20">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Name..." className="cyber-input px-3 py-2 rounded-lg text-sm" autoFocus />
            <select value={form.relation} onChange={e => setForm({ ...form, relation: e.target.value })} className="cyber-input px-3 py-2 rounded-lg text-sm">
              {["Parent","Sibling","Spouse","Child","Grandparent","Aunt/Uncle","Cousin"].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <input type="date" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })} className="cyber-input px-3 py-2 rounded-lg text-sm" />
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes..." className="cyber-input px-3 py-2 rounded-lg text-sm" />
            <input value={form.lastContact} onChange={e => setForm({ ...form, lastContact: e.target.value })} placeholder="Last contact (e.g. Today)" className="cyber-input px-3 py-2 rounded-lg text-sm" />
            <div>
              <label className="text-xs text-slate-400 font-mono mb-1 block">Bond Level: {form.bondLevel}%</label>
              <input type="range" min={0} max={100} value={form.bondLevel} onChange={e => setForm({ ...form, bondLevel: Number(e.target.value) })} className="w-full accent-yellow-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="btn-cyber px-4 py-2 rounded-lg text-sm font-mono">Add</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-white/10 transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-600 font-mono">Loading family members...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-600 font-mono">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No family members added yet.</p>
            </div>
          )}
          {members.map((m, i) => (
            <motion.div key={m._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl p-5 text-center group relative">
              <button onClick={() => del(m._id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-yellow-400">{m.name[0].toUpperCase()}</span>
              </div>
              <h3 className="font-bold text-white">{m.name}</h3>
              <span className="text-[10px] font-mono text-yellow-400 border border-yellow-400/30 bg-yellow-400/10 px-2 py-0.5 rounded">{m.relation}</span>

              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Bond Level</span>
                  <span className="text-yellow-400">{m.bondLevel}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${m.bondLevel}%` }} transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400" />
                </div>
                <input type="range" min={0} max={100} value={m.bondLevel}
                  onChange={e => setMembers(ms => ms.map(x => x._id === m._id ? { ...x, bondLevel: Number(e.target.value) } : x))}
                  onMouseUp={() => updateBond(m._id, m.bondLevel)}
                  onTouchEnd={() => updateBond(m._id, m.bondLevel)}
                  className="w-full accent-yellow-400 cursor-pointer" />
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-400 text-left">
                {m.birthday && <div className="flex items-center gap-2"><Calendar className="w-3 h-3 text-yellow-400" /><span>{m.birthday}</span></div>}
                <div className="flex items-center gap-2"><Heart className="w-3 h-3 text-pink-400" /><span>Last: {m.lastContact}</span></div>
                {m.notes && <p className="text-slate-500 italic text-[11px] mt-1">{m.notes}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
