"use client";

import React, { useState, useEffect } from "react";
import { PortalSettings } from "@/lib/types";
import {
  DollarSign,
  CreditCard,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Key,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PortalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save settings");
      }

      setMessage({ type: "success", text: "Settings and pricing rates updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading system configuration...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          System & Gateway Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure processing charges for all 5 services, Paystack credentials, and support metadata.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 ${
            message.type === "success"
              ? "bg-emerald-950/60 border border-emerald-800 text-emerald-300"
              : "bg-rose-950/60 border border-rose-800 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Service Rates for all 5 services */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Service Application Pricing (NGN ₦)</h2>
              <p className="text-xs text-slate-400">
                Set customer processing charges for each of the 5 submission services.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. IPE Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                IPE Clearance (15 Chars)
              </label>
              <div className="relative">
                <span className="text-slate-500 absolute left-3.5 top-2.5 text-sm font-bold">₦</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  value={settings.rates.ipe}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rates: { ...settings.rates, ipe: Number(e.target.value) },
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-sm font-bold focus:ring-2 focus:ring-emerald-500/40 outline-none"
                />
              </div>
            </div>

            {/* 2. Mod IPE Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mod IPE (15 Chars)
              </label>
              <div className="relative">
                <span className="text-slate-500 absolute left-3.5 top-2.5 text-sm font-bold">₦</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={settings.rates.modIpe}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rates: { ...settings.rates, modIpe: Number(e.target.value) },
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-sm font-bold focus:ring-2 focus:ring-emerald-500/40 outline-none"
                />
              </div>
            </div>

            {/* 3. Validation Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                NIN Validation (11 Digits)
              </label>
              <div className="relative">
                <span className="text-slate-500 absolute left-3.5 top-2.5 text-sm font-bold">₦</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={settings.rates.validation}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rates: { ...settings.rates, validation: Number(e.target.value) },
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-sm font-bold focus:ring-2 focus:ring-emerald-500/40 outline-none"
                />
              </div>
            </div>

            {/* 4. Mod Validation Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mod Validation (11 Digits)
              </label>
              <div className="relative">
                <span className="text-slate-500 absolute left-3.5 top-2.5 text-sm font-bold">₦</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={settings.rates.modValidation}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rates: { ...settings.rates, modValidation: Number(e.target.value) },
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-sm font-bold focus:ring-2 focus:ring-emerald-500/40 outline-none"
                />
              </div>
            </div>

            {/* 5. Modification Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                NIN Modification (Name, Phone, DOB, DOB above 5 years)
              </label>
              <div className="relative">
                <span className="text-slate-500 absolute left-3.5 top-2.5 text-sm font-bold">₦</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={settings.rates.modification}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rates: { ...settings.rates, modification: Number(e.target.value) },
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-sm font-bold focus:ring-2 focus:ring-emerald-500/40 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Paystack Gateway Integration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Payment Gateway Integration (Paystack)</h2>
              <p className="text-xs text-slate-400">
                Connect your live or test Paystack developer keys to collect card, bank transfer, and USSD payments.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="text-sm font-bold text-white block">Test Mode Simulation</span>
                <span className="text-xs text-slate-400">
                  When enabled, allows instantaneous test checkouts alongside Paystack sandbox.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.paystack.testMode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    paystack: { ...settings.paystack, testMode: e.target.checked },
                  })
                }
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Paystack Public Key (pk_test_... or pk_live_...)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={settings.paystack.publicKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paystack: { ...settings.paystack, publicKey: e.target.value },
                    })
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500/40 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Paystack Secret Key (sk_test_... or sk_live_...)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={settings.paystack.secretKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paystack: { ...settings.paystack, secretKey: e.target.value },
                    })
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500/40 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Brand & Contact Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Portal Identity & Support Details</h2>
              <p className="text-xs text-slate-400">
                Display information for applicant notifications and printed verification slips.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Portal Name</label>
              <input
                type="text"
                value={settings.portalName}
                onChange={(e) => setSettings({ ...settings, portalName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/40 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Support Phone</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/40 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/40 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Google Authenticator (TOTP) 2FA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Google Authenticator Two-Factor Authentication (2FA)</h2>
              <p className="text-xs text-slate-400">
                Enforced for all administrative logins on admin.instantipesubmit.com.ng.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Scan this QR code with <strong>Google Authenticator</strong>, <strong>Authy</strong>, or{" "}
                <strong>Microsoft Authenticator</strong> on your smartphone.
              </p>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                  Manual 2FA Setup Key
                </span>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-700">
                  <code className="text-xs text-emerald-400 font-mono flex-1 select-all">
                    INSTANTIPE2026ADMINSECRET
                  </code>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-emerald-400">Master Emergency Recovery Code:</span>
                <p>
                  If you ever lose access to your device, enter code <strong className="text-white font-mono">202699</strong> to log in.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl max-w-[200px] mx-auto shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  "otpauth://totp/InstantIPESubmit:admin@instantipesubmit.com.ng?secret=INSTANTIPE2026ADMINSECRET&issuer=InstantIPESubmit&algorithm=SHA1&digits=6&period=30"
                )}`}
                alt="Google Authenticator QR Code"
                className="w-36 h-36 object-contain"
              />
              <span className="text-[10px] font-bold text-slate-800 mt-2 font-mono">Scan in Google Authenticator</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg transition flex items-center gap-2 disabled:opacity-75"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Save className="w-4 h-4" />}
            <span>Save All Configuration Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
