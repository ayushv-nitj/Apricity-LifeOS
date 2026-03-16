"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Briefcase, GraduationCap, Dumbbell, Apple,
  Heart, Users, Target, BarChart3, Settings, LogOut, Zap, Menu, X, BookOpen, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "Work / Tasks", icon: Briefcase },
  { href: "/dashboard/academics", label: "Academics", icon: GraduationCap },
  { href: "/dashboard/workout", label: "Workout", icon: Dumbbell },
  { href: "/dashboard/diet", label: "Diet", icon: Apple },
  { href: "/dashboard/relationships", label: "Relationships", icon: Heart },
  { href: "/dashboard/family", label: "Family", icon: Users },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/notes", label: "Notes", icon: BookOpen },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/social",    label: "Social Hub", icon: Globe },
  { href: "/dashboard/settings",  label: "Settings",   icon: Settings },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 glass-card border-b border-cyber-border/50 sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold neon-cyan font-mono text-sm tracking-wider">APRICITY</span>
        </Link>
        <button onClick={() => setOpen(true)} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-72 glass-card border-l border-cyber-border/50 z-50 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-cyber-border/50">
                <span className="font-bold neon-cyan font-mono tracking-wider">NAVIGATION</span>
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                      <div className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                        active ? "bg-cyan-400/10 border border-cyan-400/20 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-cyber-border/50">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
