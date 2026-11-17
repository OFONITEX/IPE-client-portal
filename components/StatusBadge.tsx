import React from "react";
import { SubmissionStatus, PaymentStatus } from "@/lib/types";
import { Clock, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, CreditCard } from "lucide-react";

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  switch (status) {
    case "PENDING_PAYMENT":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          Awaiting Payment
        </span>
      );
    case "PAID_PENDING_ACCEPTANCE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
          <CreditCard className="w-3.5 h-3.5" />
          Paid • Pending Acceptance
        </span>
      );
    case "ACCEPTED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          Accepted by Admin
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Clock className="w-3.5 h-3.5" />
          Processing
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed & Cleared
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {status}
        </span>
      );
  }
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "PAID":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3 h-3" /> Paid
        </span>
      );
    case "UNPAID":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3" /> Unpaid
        </span>
      );
    case "FAILED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800">
          <XCircle className="w-3 h-3" /> Failed
        </span>
      );
    case "REFUNDED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
          Refunded
        </span>
      );
    default:
      return null;
  }
}

