/**
 * app/(dashboard)/dashboard/relationships/page.tsx — Relationships Tracker
 *
 * "use client" — all state, fetch calls, and interactions happen in the browser.
 *
 * Manages a contact list for important relationships (friends, partners, mentors).
 * Each contact has an "affinity" score (0-100) visualized as a gradient bar.
 *
 * Affinity slider:
 *  - The slider updates local state on every move (instant visual feedback)
 *  - The PATCH request only fires on `onMouseUp` / `onTouchEnd` (when released)
 *  - This avoids spamming the API with a request on every pixel of movement
 *
 * The contacts API uses a `type` query param to separate relationship contacts
 * from family contacts — both use the same /api/contacts endpoint and Contact model.
 *
 * Data source: GET /api/contacts?type=relationship, POST /api/contacts,
 *              PATCH /api/contacts/:id, DELETE /api/contacts/:id
 */
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Plus, Phone, Calendar, MessageCircle, Trash2 } from "lucide-react";

interface Contact {
  _id: string;
  name: string;
  relation: string;
  lastContact: string;
  birthday?: string;
  notes: string;
  affinity: number;
}

export default function RelationshipsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", relation: "Friend", lastContact: "Today", birthday: "", notes: "", affinity: 70 });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/contacts?type=relationship");
    const data = await res.json();
    setContacts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function add() {
    if (!form.name.trim()) return;
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, type: "relationship" }),
    });
    setForm({ name: "", relation: "Friend", lastContact: "Today", birthday: "", notes: "", affinity: 70 });
    setAdding(false);
    load();
  }

  async function updateAffinity(id: string, affinity: number) {
    await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ affinity }),
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
          <div className="w-10 h-10 rounded-xl bg-pink-400/10 border border-pink-400/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">Relationships</h1>
            <p className="text-xs text-slate-500 font-mono">Social Affinity Meter</p>
          </div>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn-cyber px-4 py-2 rounded-lg text-sm font-mono flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      {adding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="glass-card rounded-xl p-5 mb-5 border border-pink-400/20">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Name..." className="cyber-input px-3 py-2 rounded-lg text-sm" autoFocus />
            <select value={form.relation} onChange={e => setForm({ ...form, relation: e.target.value })} className="cyber-input px-3 py-2 rounded-lg text-sm">
              {["Partner","Best Friend","Friend","Colleague","Mentor","Acquaintance"].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <input type="date" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })} className="cyber-input px-3 py-2 rounded-lg text-sm" />
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes / reminders..." className="cyber-input px-3 py-2 rounded-lg text-sm" />
            <div className="col-span-2">
              <label className="text-xs text-slate-400 font-mono mb-1 block">Affinity: {form.affinity}%</label>
              <input type="range" min={0} max={100} value={form.affinity} onChange={e => setForm({ ...form, affinity: Number(e.target.value) })} className="w-full accent-pink-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="btn-cyber px-4 py-2 rounded-lg text-sm font-mono">Add</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-white/10 transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-600 font-mono">Loading contacts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.length === 0 && (
            <div className="col-span-2 text-center py-12 text-slate-600 font-mono">
              <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No contacts yet. Add someone important to you.</p>
            </div>
          )}
          {contacts.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400/20 to-purple-400/20 border border-pink-400/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-pink-400">{c.name[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">{c.name}</h3>
                    <span className="text-[10px] font-mono text-pink-400 border border-pink-400/30 bg-pink-400/10 px-2 py-0.5 rounded">{c.relation}</span>
                  </div>
                </div>
                <button onClick={() => del(c._id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Affinity</span>
                  <span className="text-pink-400">{c.affinity}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${c.affinity}%` }} transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400" />
                </div>
                <input type="range" min={0} max={100} value={c.affinity}
                  onChange={e => setContacts(cs => cs.map(x => x._id === c._id ? { ...x, affinity: Number(e.target.value) } : x))}
                  onMouseUp={() => updateAffinity(c._id, c.affinity)}
                  onTouchEnd={() => updateAffinity(c._id, c.affinity)}
                  className="w-full accent-pink-400 cursor-pointer" />
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2"><Phone className="w-3 h-3" /><span>Last contact: {c.lastContact}</span></div>
                {c.birthday && <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /><span>Birthday: {c.birthday}</span></div>}
                {c.notes && <div className="flex items-center gap-2"><MessageCircle className="w-3 h-3" /><span className="text-slate-500 italic">{c.notes}</span></div>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
