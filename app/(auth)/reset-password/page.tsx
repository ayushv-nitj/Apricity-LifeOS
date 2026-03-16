/**
 * app/(auth)/reset-password/page.tsx — Reset Password Page
 *
 * Reached via the link in the reset email:
 *   /reset-password?token=<plainToken>&userId=<userId>
 *
 * Reads `token` and `userId` from the URL search params using
 * `useSearchParams()` (requires Suspense boundary in Next.js App Router).
 *
 * On submit, POSTs to /api/auth/reset-password. On success, redirects
 * to /login?reset=true so the login page can show a success message.
 */
"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, ShieldCheck } from "lucide-react";

function ResetForm() {
  const params   = useSearchParams();
  const router   = useRouter();
  const token    = params.get("token") ?? "";
  const userId   = params.get("userId") ?? "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!token || !userId) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
    } else {
      // Redirect to login with a success flag
      router.push("/login?reset=true");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs text-slate-400 font-mono uppercase tracking-wider mb-2">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="cyber-input w-full px-4 py-3 pr-10 rounded-lg text-sm"
            placeholder="Min 8 characters"
            minLength={8}
            required
            autoFocus
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 font-mono uppercase tracking-wider mb-2">
          Confirm Password
        </label>
        <input
          type={showPass ? "text" : "password"}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="cyber-input w-full px-4 py-3 rounded-lg text-sm"
          placeholder="Repeat password"
          required
        />
      </div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-red-400 text-xs font-mono bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          ⚠ {error}
        </motion.p>
      )}

      <button type="submit" disabled={loading}
        className="btn-cyber w-full py-3 rounded-lg text-sm font-mono font-semibold uppercase tracking-widest disabled:opacity-50">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            Updating...
          </span>
        ) : "Set New Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen cyber-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-neon-cyan">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold neon-cyan font-mono tracking-wider">APRICITY</span>
          </div>
          <p className="text-slate-400 text-sm">Set a new password</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">New Credentials</span>
          </div>

          {/* useSearchParams must be inside Suspense in Next.js App Router */}
          <Suspense fallback={<p className="text-slate-400 text-sm font-mono">Loading...</p>}>
            <ResetForm />
          </Suspense>

          <p className="text-center text-slate-500 text-sm mt-6">
            Remembered it?{" "}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Back to login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
