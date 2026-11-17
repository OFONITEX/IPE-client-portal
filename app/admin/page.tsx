"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Submission } from "@/lib/types";
import { StatusBadge, PaymentBadge } from "@/components/StatusBadge";
import { AdminSubmissionDrawer } from "@/components/AdminSubmissionDrawer";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  FileCheck,
  Clock,
  CheckCircle2,
  DollarSign,
  ShieldAlert,
  FileEdit,
  RefreshCw,
  Sliders,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissions(data.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (updated: Submission) => {
    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedSubmission(updated);
  };

  // Quick Accept action directly from dashboard
  const handleQuickAccept = async (e: React.MouseEvent, sub: Submission) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/submissions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ACCEPT",
          adminName: "Senior Clearance Officer",
          adminNotes: "Quick-accepted via overview dashboard.",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        handleUpdate(data.data);
      }
    } catch (err) {
      console.error("Accept error:", err);
    }
  };

  // Computed metrics
  const totalCount = submissions.length;
  const awaitingAcceptance = submissions.filter((s) => s.status === "PAID_PENDING_ACCEPTANCE");
  const acceptedOrProcessing = submissions.filter(
    (s) => s.status === "ACCEPTED" || s.status === "IN_PROGRESS"
  );
  const completedCount = submissions.filter((s) => s.status === "COMPLETED").length;
  const totalRevenue = submissions
    .filter((s) => s.paymentStatus === "PAID")
    .reduce((sum, s) => sum + s.amount, 0);

  const ipeCount = submissions.filter((s) => s.serviceType === "IPE").length;
  const modIpeCount = submissions.filter((s) => s.serviceType === "MOD_IPE").length;
  const valCount = submissions.filter((s) => s.serviceType === "VALIDATION").length;
  const modValCount = submissions.filter((s) => s.serviceType === "MOD_VALIDATION").length;
  const modCount = submissions.filter((s) => s.serviceType === "MODIFICATION").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Clearance & Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor real-time applicant submissions, accept paid identity requests, and track clearinghouse batches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSubmissions}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/submissions"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <span>View All Submissions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Submissions */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Submissions</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{totalCount}</span>
            <span className="text-xs text-slate-400">All 5 services</span>
          </div>
        </div>

        {/* Paid • Awaiting Acceptance (PRIORITY) */}
        <div className="bg-gradient-to-br from-blue-950 to-slate-900 border-2 border-blue-500/40 p-5 rounded-2xl space-y-3 shadow-lg shadow-blue-900/20">
          <div className="flex items-center justify-between text-blue-300">
            <span className="text-xs font-semibold uppercase tracking-wider">Awaiting Acceptance</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping"></span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-blue-400">{awaitingAcceptance.length}</span>
            <span className="text-xs font-semibold text-blue-300">Paid • Needs Action</span>
          </div>
        </div>

        {/* In Processing */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Accepted & Processing</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{acceptedOrProcessing.length}</span>
            <span className="text-xs text-indigo-400">Active Queue</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-400">{formatCurrency(totalRevenue)}</span>
            <span className="text-xs text-slate-400">{completedCount} cleared</span>
          </div>
        </div>
      </div>

      {/* Service Distribution Summary (5 Services) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-lg font-bold text-white">{ipeCount}</span>
          </div>
          <span className="text-xs font-bold text-slate-300 block">IPE Clearance</span>
          <span className="text-[10px] text-slate-500">15 Chars (Letters/Digits)</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-blue-400">
            <FileEdit className="w-4 h-4" />
            <span className="text-lg font-bold text-white">{modIpeCount}</span>
          </div>
          <span className="text-xs font-bold text-slate-300 block">Mod IPE</span>
          <span className="text-[10px] text-slate-500">15 Chars (Letters/Digits)</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-teal-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-lg font-bold text-white">{valCount}</span>
          </div>
          <span className="text-xs font-bold text-slate-300 block">NIN Validation</span>
          <span className="text-[10px] text-slate-500">11 Digits (NIN)</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-purple-400">
            <RefreshCw className="w-4 h-4" />
            <span className="text-lg font-bold text-white">{modValCount}</span>
          </div>
          <span className="text-xs font-bold text-slate-300 block">Mod Validation</span>
          <span className="text-[10px] text-slate-500">11 Digits (Post-Mod)</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-amber-400">
            <Sliders className="w-4 h-4" />
            <span className="text-lg font-bold text-white">{modCount}</span>
          </div>
          <span className="text-xs font-bold text-slate-300 block">NIN Modification</span>
          <span className="text-[10px] text-slate-500">11 Digits + Field</span>
        </div>
      </div>

      {/* Priority Section: Paid Submissions Awaiting Acceptance */}
      {awaitingAcceptance.length > 0 && (
        <div className="bg-slate-900 border-2 border-blue-500/30 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 bg-gradient-to-r from-blue-950/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
              <div>
                <h3 className="font-bold text-base text-white">Paid Submissions Awaiting Acceptance</h3>
                <p className="text-xs text-blue-200">
                  Review applicant details and code (15 chars or 11 digits), then accept into the active queue.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {awaitingAcceptance.length} Action Required
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Identifier Code</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Paid Amount</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {awaitingAcceptance.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => setSelectedSubmission(sub)}
                    className="hover:bg-slate-800/60 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{sub.trackingId}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-800 text-slate-200 border border-slate-700">
                        {sub.serviceType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {sub.identifierCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{sub.applicantName}</div>
                      <div className="text-[11px] text-slate-400">{sub.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {formatCurrency(sub.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => handleQuickAccept(e, sub)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition inline-flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Accept Submission</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white">Recent Submissions (All Statuses)</h3>
            <p className="text-xs text-slate-400">Click any row to open the administration & review drawer.</p>
          </div>
          <Link
            href="/admin/submissions"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            Open Full Queue →
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">No submissions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Identifier Code</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {submissions.slice(0, 8).map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => setSelectedSubmission(sub)}
                    className="hover:bg-slate-800/60 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{sub.trackingId}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-800 text-slate-200">
                        {sub.serviceType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">{sub.identifierCode}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">{sub.applicantName}</td>
                    <td className="py-3.5 px-4">
                      <PaymentBadge status={sub.paymentStatus} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(sub.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Action Drawer */}
      <AdminSubmissionDrawer
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
