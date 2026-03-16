/**
 * app/(auth)/forgot-password/page.tsx — Forgot Password Page
 *
 * User enters their email. On submit, POST /api/auth/forgot-password is called.
 * The API always returns the same success message regardless of whether the
 * email exists — this prevents user enumeration attacks.
 *
 * After submission the form is replaced with a confirmation message so the
 * user knows to check their inbox.
 */
"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong. Please try again.");
    }
  }

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
          <p className="text-slate-400 text-sm">Password Recovery</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {sent ? (
            // Confirmation state — shown after successful submission
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-white font-mono font-semibold">Check your inbox</h3>
              <p className="text-slate-400 text-sm">
                If <span className="text-cyan-400">{email}</span> is registered, a reset link has been sent. It expires in 1 hour.
              </p>
              <p className="text-slate-500 text-xs">Don&apos;t see it? Check your spam folder.</p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors mt-2">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to login
              </Link>
            </motion.div>
          ) : (
            // Form state
            <>
              <div className="flex items-center gap-2 mb-6">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">Recover Access</span>
              </div>

              <p className="text-slate-400 text-sm mb-6">
                Enter your registered email and we&apos;ll send you a password reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs text-slate-400 font-mono uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="cyber-input w-full px-4 py-3 rounded-lg text-sm"
                    placeholder="operative@apricity.io"
                    required
                    autoFocus
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
                      Sending...
                    </span>
                  ) : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-slate-500 text-sm mt-6">
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
