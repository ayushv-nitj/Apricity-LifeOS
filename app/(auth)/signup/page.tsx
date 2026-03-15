"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, UserPlus } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error || "Registration failed");
    else router.push("/login?registered=true");
  }

  return (
    <div className="min-h-screen cyber-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-neon-cyan">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold neon-cyan font-mono tracking-wider">APRICITY</span>
          </div>
          <p className="text-slate-400 text-sm">Create your operative profile</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">New Operative</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-slate-400 font-mono uppercase tracking-wider mb-2">
                Operative Name
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="cyber-input w-full px-4 py-3 rounded-lg text-sm"
                placeholder="YourCallsign"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-mono uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="cyber-input w-full px-4 py-3 rounded-lg text-sm"
                placeholder="operative@apricity.io"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-mono uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="cyber-input w-full px-4 py-3 pr-10 rounded-lg text-sm"
                  placeholder="Min 8 characters"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs font-mono bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
              >
                ⚠ {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-cyber-purple w-full py-3 rounded-lg text-sm font-mono font-semibold uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                  Registering...
                </span>
              ) : (
                "Deploy Operative"
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already registered?{" "}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Access Terminal
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
