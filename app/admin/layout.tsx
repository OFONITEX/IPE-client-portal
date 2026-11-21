"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Bell, User, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!isLoginPage) {
      fetchQueueCount();
    }
  }, [pathname, isLoginPage]);

  const fetchQueueCount = async () => {
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      if (res.ok && data.success) {
        const waiting = data.data.filter((s: any) => s.status === "PAID_PENDING_ACCEPTANCE").length;
        setPendingCount(waiting);
      }
    } catch {}
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <AdminSidebar pendingAcceptanceCount={pendingCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              OPERATOR CONSOLE
            </span>
            <span className="text-xs text-emerald-400 hidden sm:inline font-mono font-semibold">
              admin.instantipesubmit.com.ng
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              <Shield className="w-3 h-3 text-emerald-400" />
              2FA Google Authenticator Active
            </span>
          </div>

          <div className="flex items-center gap-4">
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold animate-pulse">
                <Bell className="w-3.5 h-3.5" />
                <span>{pendingCount} Awaiting Acceptance</span>
              </div>
            )}

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800 text-xs">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <span className="font-medium text-slate-200 hidden sm:inline">Senior Clearance Officer</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

