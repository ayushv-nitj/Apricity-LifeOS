/**
 * components/sidebar/Sidebar.tsx — Left Navigation Sidebar
 *
 * "use client" is needed because this component uses:
 *  - `usePathname()` — reads the current URL to highlight the active nav item
 *  - `signOut()` — NextAuth client-side function
 *  - Framer Motion animations (browser-only)
 *
 * The sidebar is hidden on mobile (hidden lg:flex) — on small screens,
 * MobileNav.tsx takes over with a slide-out drawer.
 *
 * Active link detection:
 *  - For /dashboard exactly: pathname === item.href
 *  - For sub-pages (e.g. /dashboard/tasks): pathname.startsWith(item.href)
 *  - The /dashboard check is special-cased to avoid it matching all routes.
 */

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Briefcase, GraduationCap, Dumbbell, Apple,
  Heart, Users, Target, BarChart3, Settings, LogOut, Zap, BookOpen, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Navigation items config ──────────────────────────────────────────────────
 * Defining nav items as a data array (instead of hardcoded JSX) makes it easy
 * to add/remove/reorder items without touching the render logic.
 * Each item has: href (URL), label (text), icon (Lucide component), color (active icon color).
 */
const navItems = [
  { href: "/dashboard",               label: "Dashboard",      icon: LayoutDashboard, color: "text-cyan-400" },
  { href: "/dashboard/tasks",         label: "Work / Tasks",   icon: Briefcase,       color: "text-cyan-300" },
  { href: "/dashboard/academics",     label: "Academics",      icon: GraduationCap,   color: "text-violet-400" },
  { href: "/dashboard/workout",       label: "Workout",        icon: Dumbbell,        color: "text-emerald-400" },
  { href: "/dashboard/diet",          label: "Diet Tracker",   icon: Apple,           color: "text-orange-400" },
  { href: "/dashboard/relationships", label: "Relationships",  icon: Heart,           color: "text-pink-400" },
  { href: "/dashboard/family",        label: "Family",         icon: Users,           color: "text-yellow-400" },
  { href: "/dashboard/goals",         label: "Goals / Quests", icon: Target,          color: "text-blue-400" },
  { href: "/dashboard/notes",         label: "Knowledge Vault",icon: BookOpen,        color: "text-teal-400" },
  { href: "/dashboard/analytics",     label: "Analytics",      icon: BarChart3,       color: "text-purple-400" },
  { href: "/dashboard/social",        label: "Social Hub",     icon: Globe,           color: "text-rose-400" },
  { href: "/dashboard/settings",      label: "Settings",       icon: Settings,        color: "text-slate-400" },
];

export default function Sidebar() {
  // `usePathname()` returns the current URL path (e.g. "/dashboard/tasks").
  // Re-renders automatically when the user navigates to a new page.
  const pathname = usePathname();

  return (
    // `hidden lg:flex` — invisible on mobile, flex column on large screens (1024px+)
    <aside className="hidden lg:flex flex-col w-64 min-h-screen glass-card border-r border-cyber-border/50 relative">

      {/* ── Logo / Brand ──────────────────────────────────────────────────── */}
      <div className="p-6 border-b border-cyber-border/50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-neon-cyan">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold neon-cyan font-mono tracking-wider">APRICITY</span>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Life OS v1.0</p>
          </div>
        </Link>
      </div>

      {/* ── Navigation links ──────────────────────────────────────────────── */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          // Determine if this nav item matches the current page.
          const active = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              {/*
               * `whileHover={{ x: 4 }}` — slides the item 4px right on hover.
               * This is a Framer Motion prop that animates the element.
               * `layoutId="activeIndicator"` — the glowing dot animates smoothly
               * between nav items when you navigate (shared layout animation).
               */}
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                  active
                    ? "bg-cyan-400/10 border border-cyan-400/20 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                {/* Icon — uses the item's color when active */}
                <item.icon
                  className={cn("w-4 h-4 flex-shrink-0 transition-colors",
                    active ? item.color : "group-hover:" + item.color.replace("text-", "text-")
                  )}
                />
                <span className="font-medium">{item.label}</span>

                {/* Active indicator dot — only shown for the current page */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-neon-cyan"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* ── Logout button ─────────────────────────────────────────────────── */}
      <div className="p-4 border-t border-cyber-border/50">
        <button
          // `callbackUrl` tells NextAuth where to redirect after sign-out.
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all w-full group"
        >
          <LogOut className="w-4 h-4 group-hover:text-red-400" />
          <span>Disconnect</span>
        </button>
      </div>
    </aside>
  );
}
