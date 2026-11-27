"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  TableProperties,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  ShieldCheck,
  Users,
  Database,
} from "lucide-react";

interface Props {
  pendingAcceptanceCount?: number;
}

export function AdminSidebar({ pendingAcceptanceCount = 0 }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  const navItems = [
    {
      name: "Overview Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      name: "Submissions Data Table",
      href: "/admin/submissions",
      icon: TableProperties,
      active: pathname.startsWith("/admin/submissions"),
      badge: pendingAcceptanceCount > 0 ? pendingAcceptanceCount : undefined,
    },
    {
      name: "Registered Users",
      href: "/admin/users",
      icon: Users,
      active: pathname.startsWith("/admin/users"),
    },
    {
      name: "Portal Settings",
      href: "/admin/settings",
      icon: Settings,
      active: pathname.startsWith("/admin/settings"),
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800 p-4 shrink-0">
      <div className="space-y-6">
        {/* Brand */}
        <div className="px-3 py-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-tight block">InstantIPE Admin</span>
            <span className="text-[10px] text-emerald-400 font-mono tracking-wider block">
              admin.instantipesubmit.com.ng
            </span>
          </div>
        </div>

        {/* Supabase Live Sync Status Badge */}
        <div className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div className="text-[11px] leading-tight min-w-0">
            <span className="font-semibold text-slate-200 block truncate">Supabase Database</span>
            <span className="text-emerald-400 text-[10px] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Live PostgreSQL Sync
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  item.active
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      item.active
                        ? "bg-slate-950 text-emerald-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <a
          href="https://instantipesubmit.com.ng"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Portal</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Live</span>
        </a>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
