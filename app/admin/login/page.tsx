"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@identityhub.ng");
  const [password, setPassword] = useState("Admin@2026Password!");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials");
      }

      router.push("/admin");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 font-bold">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Admin Portal Authentication
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Authorized personnel only. Access submissions, accept paid requests, and manage portal parameters.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@identityhub.ng"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Quick Demo Credentials Hint */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-emerald-400">Default Credentials Provided:</span>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-mono text-slate-300">admin@identityhub.ng</span>
              </div>
              <div className="flex justify-between">
                <span>Password:</span>
                <span className="font-mono text-slate-300">Admin@2026Password!</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-800">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">
              ← Return to Public Services Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

