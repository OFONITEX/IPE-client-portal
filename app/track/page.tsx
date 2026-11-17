"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Submission, SubmissionStatus } from "@/lib/types";
import { StatusBadge, PaymentBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  XCircle,
  FileText,
  User,
  ArrowRight,
  Shield,
  Loader2,
  Calendar,
  Lock,
} from "lucide-react";

function TrackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    const clean = searchQuery.trim();
    if (!clean) return;

    setLoading(true);
    setErrorMsg("");
    setHasSearched(true);

    try {
      const res = await fetch(`/api/track?q=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "No application found matching your reference.");
      }
      setSubmission(data.data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to search for application.");
      setSubmission(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/track?q=${encodeURIComponent(query.trim())}`);
      performSearch(query);
    }
  };

  // Determine active step index: 0, 1, 2, 3
  const getStepIndex = (status: SubmissionStatus): number => {
    switch (status) {
      case "PENDING_PAYMENT":
        return 0;
      case "PAID_PENDING_ACCEPTANCE":
        return 1;
      case "ACCEPTED":
      case "IN_PROGRESS":
        return 2;
      case "COMPLETED":
        return 3;
      case "REJECTED":
        return 1;
      default:
        return 1;
    }
  };

  const activeStep = submission ? getStepIndex(submission.status) : 0;

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <Search className="w-3.5 h-3.5" />
            Live Status Tracker
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Track Application Status
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Enter your Tracking ID (e.g. TRK-IPE-...), 11-digit NIN, or 15-character clearance code to view live progress.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white p-2 rounded-2xl border border-slate-200 shadow-md flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Tracking ID (TRK-...) or 11-Digit NIN"
                className="w-full pl-12 pr-4 py-3 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Track Status</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Search Error */}
        {errorMsg && (
          <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Lookup Result</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Results Card */}
        {submission && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-8 p-6 sm:p-10 animate-in fade-in-50 duration-300">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider block">
                  {submission.serviceType} Service Application
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
                  {submission.trackingId}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={submission.status} />
                <PaymentBadge status={submission.paymentStatus} />
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Application Progress Timeline
              </h3>

              <div className="relative">
                {/* Horizontal progress bar background */}
                <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${(activeStep / 3) * 100}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative z-10">
                  {/* Step 1 */}
                  <div className="flex sm:flex-col items-center gap-3 text-left sm:text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition ${
                        activeStep >= 0
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Submitted & Paid</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Payment confirmed</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex sm:flex-col items-center gap-3 text-left sm:text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition ${
                        submission.adminAccepted
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                          : submission.status === "PAID_PENDING_ACCEPTANCE"
                          ? "bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {submission.adminAccepted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Admin Acceptance</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {submission.adminAccepted ? "Accepted by officer" : "Queued in admin portal"}
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex sm:flex-col items-center gap-3 text-left sm:text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition ${
                        activeStep >= 2
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Clearinghouse Sync</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Central database review</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex sm:flex-col items-center gap-3 text-left sm:text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition ${
                        submission.status === "COMPLETED"
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Slip Issued</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Final clearance confirmation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Status Explanatory Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Current Processing Status
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {submission.status === "PAID_PENDING_ACCEPTANCE" && (
                  <span>
                    Your payment of {formatCurrency(submission.amount)} is confirmed. Your submission is in the
                    operator inbox awaiting admin acceptance.
                  </span>
                )}
                {submission.status === "ACCEPTED" && (
                  <span>
                    Your submission was reviewed and accepted by <strong>{submission.adminAcceptedBy || "Admin"}</strong>
                    {submission.adminAcceptedAt ? ` on ${formatDate(submission.adminAcceptedAt)}` : ""}. Verification
                    and record clearance are actively in progress.
                  </span>
                )}
                {submission.status === "IN_PROGRESS" && (
                  <span>
                    Your identity record is currently being verified against the national database clearinghouse.
                  </span>
                )}
                {submission.status === "COMPLETED" && (
                  <span className="text-emerald-700 font-medium">
                    Clearance successfully completed! Verification approval reference:{" "}
                    <strong>{submission.certificateRef || "NIMC-APPROVED"}</strong>.
                  </span>
                )}
                {submission.status === "REJECTED" && (
                  <span className="text-rose-700 font-medium">
                    This submission was not approved. Reason: {submission.rejectionReason || "Code format mismatch"}.
                  </span>
                )}
              </p>
              {submission.adminNotes && (
                <div className="pt-2 text-xs text-slate-500 border-t border-slate-200/60 mt-2">
                  <span className="font-semibold text-slate-700">Official Remark: </span>
                  {submission.adminNotes}
                </div>
              )}
            </div>

            {/* Application Overview Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-200">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-semibold text-slate-900">{submission.applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered Code:</span>
                  <span className="font-mono font-bold text-slate-900">{submission.identifierCode}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Submission Date:</span>
                  <span className="text-slate-800">{formatDate(submission.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(submission.amount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">Loading tracker...</p>
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}

