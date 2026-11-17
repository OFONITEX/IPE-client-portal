"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Submission } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge, PaymentBadge } from "@/components/StatusBadge";
import {
  CheckCircle2,
  Printer,
  Search,
  Copy,
  Check,
  Shield,
  ArrowRight,
  Loader2,
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id") || "";

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (submissionId) {
      fetchSubmission();
    } else {
      setLoading(false);
    }
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      const res = await fetch(`/api/submissions/${submissionId}`);
      const data: any = await res.json();
      if (res.ok && data.success) {
        setSubmission(data.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingId = () => {
    if (!submission) return;
    navigator.clipboard.writeText(submission.trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500">Generating transaction receipt...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 max-w-md">
          <p className="text-slate-700">Submission not found.</p>
          <Link href="/" className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left print:hidden">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2 flex-1">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-white/20 text-white inline-block">
              Payment Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Application Successfully Submitted!
            </h1>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Your payment has been reconciled. Your submission is now officially queued in the Admin Portal for
              administrative acceptance and processing.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Application Tracking ID
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-slate-900 tracking-wider">
              {submission.trackingId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyTrackingId}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
            <Link
              href={`/track?q=${submission.trackingId}`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Search className="w-4 h-4" />
              <span>Track Live Status</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 sm:p-10 space-y-8 print:p-0 print:border-none print:shadow-none">
          <div className="flex items-center justify-between border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">IdentityHub Clearance Services</h2>
                <p className="text-xs text-slate-500">Official Electronic Payment & Submission Slip</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Date Issued</span>
              <span className="text-xs font-semibold text-slate-800">{formatDate(submission.createdAt)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Service & Identifier
              </h3>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Category:</span>
                  <span className="font-semibold text-slate-900">{submission.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    {submission.serviceType === "IPE" || submission.serviceType === "MOD_IPE"
                      ? "15-Char Code:"
                      : "11-Digit NIN:"}
                  </span>
                  <span className="font-mono font-bold text-slate-900">{submission.identifierCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Status:</span>
                  <StatusBadge status={submission.status} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Applicant Details
              </h3>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Full Name:</span>
                  <span className="font-semibold text-slate-900">{submission.applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-700">{submission.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="text-slate-700">{submission.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Payment Reference:</span>
              <span className="font-mono font-semibold text-slate-800">
                {submission.paymentReference || "N/A"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Payment Channel:</span>
              <span className="capitalize font-medium text-slate-800">
                {submission.paymentChannel?.replace("_", " ") || "Online Gateway"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Payment Status:</span>
              <PaymentBadge status={submission.paymentStatus} />
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-base font-bold text-slate-900">
              <span>Total Amount Paid:</span>
              <span className="text-xl text-emerald-600 font-extrabold">
                {formatCurrency(submission.amount)}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-500 leading-relaxed border-t border-slate-200 pt-4 space-y-1">
            <p className="font-bold text-slate-700">Next Steps & Processing Information:</p>
            <p>
              1. Your application is now visible to the clearance administrators in the verification console.
            </p>
            <p>
              2. An authorized officer will review your {submission.serviceType} submission and accept it into the
              synchronization queue.
            </p>
            <p>
              3. You can revisit this portal at any time and enter tracking ID <strong>{submission.trackingId}</strong> to
              download your clearance slip upon completion.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Receipt</span>
            </button>

            <Link
              href="/"
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <span>Return to Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

