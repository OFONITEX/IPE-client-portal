"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Loader2,
  QrCode,
  Smartphone,
  Copy,
  Check,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("Iniobongunyime34@gmail.com");
  const [password, setPassword] = useState("Admin@2026Password!");
  const [authenticatorCode, setAuthenticatorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Setup info
  const secretKey = "INSTANTIPE2026ADMINSECRET";
  const otpAuthUrl = `otpauth://totp/InstantIPESubmit:Iniobongunyime34@gmail.com?secret=${secretKey}&issuer=InstantIPESubmit&algorithm=SHA1&digits=6&period=30`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    otpAuthUrl
  )}`;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          authenticatorCode: authenticatorCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials or authenticator code");
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
        <div className="inline-block px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-[11px] font-mono font-semibold text-emerald-400">
          admin.instantipesubmit.com.ng
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Admin Portal Authentication
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Protected by Google Authenticator 2-Factor Authentication (TOTP).
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

          <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="admin@instantipesubmit.com.ng"
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

            {/* Google Authenticator 2FA Field */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 tracking-wide">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  Google Authenticator Code
                </label>
                <span className="text-[10px] text-slate-400 font-mono">6 Digits</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={authenticatorCode}
                  onChange={(e) => setAuthenticatorCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 123456"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-700/60 text-emerald-300 font-mono text-base tracking-widest font-bold placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none text-center"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Enter the rotating 6-digit code from your Google Authenticator app, or master emergency code{" "}
                <span className="font-mono text-emerald-400 font-semibold">202699</span>.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying 2FA Credentials...
                </>
              ) : (
                <>
                  Unlock Admin Portal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Collapsible Google Authenticator Setup Guide */}
          <div className="border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => setShowSetup(!showSetup)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-emerald-400 transition"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <QrCode className="w-3.5 h-3.5" />
                First Time? Set Up Google Authenticator
              </span>
              {showSetup ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showSetup && (
              <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Scan this QR code with <strong>Google Authenticator</strong>, <strong>Authy</strong>, or{" "}
                  <strong>Microsoft Authenticator</strong> on your phone:
                </p>

                <div className="flex justify-center p-2 bg-white rounded-lg w-40 h-40 mx-auto shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="Google Authenticator QR Code" className="w-full h-full object-contain" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Manual Secret Key:</span>
                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                    <code className="text-xs text-emerald-400 font-mono flex-1 break-all">{secretKey}</code>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="text-slate-400 hover:text-white transition"
                      title="Copy Key"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                  <p>1. Open Google Authenticator on your phone</p>
                  <p>2. Tap + and scan the QR code above (or paste the key)</p>
                  <p>3. Use the 6-digit code generated by the app to log in</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 transition flex items-center justify-center gap-1"
            >
              ← Back to Main Public Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
