"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck,
  Settings,
  DollarSign,
  LogOut,
  ExternalLink,
  Shield,
  Layers,
  UserPlus,
  Users,
  FilePlus,
  KeyRound,
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
      name: "Submissions Queue",
      href: "/admin/submissions",
      icon: FileCheck,
      active: pathname === "/admin/submissions",
      badge: pendingAcceptanceCount > 0 ? pendingAcceptanceCount : undefined,
    },
    {
      name: "Direct Submission",
      href: "/admin/new-submission",
      icon: FilePlus,
      active: pathname === "/admin/new-submission",
    },
    {
      name: "Registered Users",
      href: "/admin/users",
      icon: Users,
      active: pathname === "/admin/users",
    },
    {
      name: "Settings & 2FA Setup",
      href: "/admin/settings",
      icon: Settings,
      active: pathname === "/admin/settings",
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

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  item.active
                    ? "bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
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
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            Public Citizen Portal
          </span>
          <span className="text-[10px] font-mono text-emerald-400">Live</span>
        </a>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/60 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Admin</span>
        </button>
      </div>
    </aside>
  );
}
