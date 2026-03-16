/**
 * app/(dashboard)/dashboard/settings/page.tsx — User Settings
 *
 * "use client" — uses state, fetch, and the useTheme hook.
 *
 * Lets the user configure their profile and app preferences:
 *
 *  Profile section:
 *   - Operative Name (username) — display name shown throughout the app
 *   - Bio — short description shown on the character card in RightPanel
 *   - Avatar URL — link to a profile picture
 *
 *  Appearance section:
 *   - Dark / Light mode toggle — uses the useTheme() hook from ThemeProvider
 *   - Theme change is instant (applied to the <html> class immediately)
 *   - Theme is also saved to the DB via the PATCH /api/user call on save
 *
 *  Notifications section:
 *   - Toggle switches for daily reminders, streak alerts, weekly report
 *   - Currently UI-only (no backend persistence for notification prefs yet)
 *
 *  Security section:
 *   - Shows the user's email (read-only)
 *   - Password change placeholder (not yet implemented)
 *
 * The Save button PATCHes /api/user with the form data + current theme.
 * It briefly shows "✓ Saved" for 2 seconds as confirmation.
 *
 * Data source: GET /api/user (on mount), PATCH /api/user (on save)
 */
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Shield, Bell, Palette, Save } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface UserData {
  username: string;
  email: string;
  bio: string;
  avatar: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [form, setForm] = useState({ username: "", bio: "", avatar: "" });
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetch("/api/user").then(r => r.json()).then(d => {
      setUser(d);
      setForm({ username: d.username, bio: d.bio || "", avatar: d.avatar || "" });
    });
  }, []);

  async function save() {
    await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, theme }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-400/10 border border-slate-400/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>Settings</h1>
          <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>Operative Configuration</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Profile</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "var(--text-muted)" }}>Operative Name</label>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                className="cyber-input w-full px-3 py-2.5 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "var(--text-muted)" }}>Bio</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                className="cyber-input w-full px-3 py-2.5 rounded-lg text-sm resize-none h-20" maxLength={150} />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "var(--text-muted)" }}>Avatar URL</label>
              <input value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })}
                className="cyber-input w-full px-3 py-2.5 rounded-lg text-sm" placeholder="https://..." />
            </div>
          </div>
        </motion.div>

        {/* Theme */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-mono uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Appearance</h3>
          </div>
          <div className="flex gap-3">
            {(["dark", "light"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 py-3 rounded-lg text-sm font-mono capitalize transition-all border ${
                  theme === t
                    ? "bg-purple-400/20 text-purple-400 border-purple-400/30"
                    : "border-white/10 hover:border-white/20"
                }`}
                style={theme !== t ? { color: "var(--text-muted)" } : {}}
              >
                {t === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </button>
            ))}
          </div>
          <p className="text-xs font-mono mt-2" style={{ color: "var(--text-faint)" }}>
            Theme is applied instantly and saved to your profile.
          </p>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-mono uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Notifications</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Daily task reminders", desc: "Get reminded about pending tasks" },
              { label: "Habit streak alerts", desc: "Don't break your streaks" },
              { label: "Weekly life report", desc: "Sunday summary of your week" },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{n.label}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{n.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-400/60" />
                </label>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-mono uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Security</h3>
          </div>
          <div className="text-xs font-mono space-y-1" style={{ color: "var(--text-muted)" }}>
            <p>Email: <span style={{ color: "var(--text-primary)" }}>{user.email}</span></p>
            <p className="mt-2" style={{ color: "var(--text-faint)" }}>Password changes coming soon.</p>
          </div>
        </motion.div>

        <button onClick={save}
          className={`w-full py-3 rounded-xl font-mono text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            saved ? "bg-emerald-400/20 text-emerald-400 border border-emerald-400/30" : "btn-cyber"
          }`}>
          <Save className="w-4 h-4" />
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
