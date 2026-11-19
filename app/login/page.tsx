"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.push(redirect);
    }
  }, [user, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!res.success) {
        throw new Error(res.message || "Invalid email or password.");
      }

      router.push(redirect);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition">
            <Shield className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="font-black text-xl text-slate-900 tracking-tight">
              InstantIPE<span className="text-emerald-600">Submit</span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded ml-1.5">
              .com.ng
            </span>
          </div>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Log in with your registered email and password to manage your submissions.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-9 shadow-xl rounded-2xl border border-slate-200/80 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <span>Email Address</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="applicant@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>Password</span>
                  <span className="text-rose-500">*</span>
                </span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to sign up */}
          <div className="pt-4 border-t border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-600">
              Don&apos;t have an account yet?{" "}
              <Link
                href={`/signup${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
                className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Create an account
              </Link>
            </p>

            <div className="pt-2">
              <Link
                href="/admin/login"
                className="text-[11px] text-slate-400 hover:text-slate-600 font-medium inline-flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3 text-amber-500" />
                <span>Portal Administrator Access</span>
              </Link>
            </div>
          </div>

          {/* Security note */}
          <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Session • Standardized Identity Desk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
