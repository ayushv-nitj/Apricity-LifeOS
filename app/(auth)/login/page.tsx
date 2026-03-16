/**
 * app/(auth)/login/page.tsx — Login Page
 *
 * "use client" — uses useState for form state and useRouter for navigation.
 *
 * Authenticates the user using NextAuth's `signIn("credentials", ...)`.
 * The "credentials" provider is configured in lib/auth.ts — it looks up
 * the user by email and compares the password hash using bcrypt.
 *
 * Key behaviors:
 *  - `redirect: false` in signIn() prevents NextAuth from doing a hard
 *    redirect — instead we get back a result object we can inspect
 *  - If `res.error` is set, the credentials were wrong — show an error
 *  - If successful, we manually push to /dashboard using useRouter
 *
 * The password field has a show/hide toggle (Eye/EyeOff icons).
 * The submit button shows a spinner while the request is in flight.
 *
 * The (auth) folder is a Next.js Route Group — the parentheses mean
 * it doesn't affect the URL path, it just groups related pages together
 * and lets them share a layout (or in this case, have no shared layout).
 */
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  // Controlled form state — both fields in one object for simplicity
  const [form, setForm] = useState({ email: "", password: "" });

  // Toggles the password input between type="password" and type="text"
  const [showPass, setShowPass] = useState(false);

  // Error message shown below the form on failed login
  const [error, setError] = useState("");

  // Disables the submit button and shows a spinner while authenticating
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    // Prevent the default browser form submission (which would reload the page)
    e.preventDefault();
    setLoading(true);
    setError("");

    // Call NextAuth's signIn with the "credentials" provider
    // redirect: false means we handle navigation ourselves
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      // NextAuth returns an error string if credentials are invalid
      setError("Invalid credentials. Access denied.");
    } else {
      // Success — navigate to the dashboard
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen cyber-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background glow blobs — pointer-events-none so they don't block clicks */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl pointer-events-none" />

      {/* Fade + slide up animation on page load */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-neon-cyan">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold neon-cyan font-mono tracking-wider">APRICITY</span>
          </motion.div>
          <p className="text-slate-400 text-sm">Life OS — Operative Authentication</p>
        </div>

        {/* Login card */}
        <div className="glass-card rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">Secure Access</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
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

            {/* Password field with show/hide toggle */}
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
                  placeholder="••••••••"
                  required
                />
                {/* Toggle button — positioned absolutely inside the input wrapper */}
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message — only rendered when `error` is non-empty */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs font-mono bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
              >
                ⚠ {error}
              </motion.p>
            )}

            {/* Submit button — disabled while loading to prevent double-submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-cyber w-full py-3 rounded-lg text-sm font-mono font-semibold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  {/* CSS spinner using border trick */}
                  <span className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                "Initialize Session"
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            No account?{" "}
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Register Operative
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
