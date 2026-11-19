"use client";

import React, { useState } from "react";
import { Submission, SubmissionStatus } from "@/lib/types";
import { StatusBadge, PaymentBadge } from "./StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Copy,
  Check,
  CreditCard,
  FileText,
  Save,
  Loader2,
  ShieldCheck,
  Sliders,
  XCircle,
  Users,
} from "lucide-react";

interface Props {
  submission: Submission | null;
  onClose: () => void;
  onUpdate: (updated: Submission) => void;
}

export function AdminSubmissionDrawer({ submission, onClose, onUpdate }: Props) {
  if (!submission) return null;

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState(submission.adminNotes || "");
  const [certificateRef, setCertificateRef] = useState(submission.certificateRef || "");
  const [rejectionReason, setRejectionReason] = useState(submission.rejectionReason || "");
  const [status, setStatus] = useState<SubmissionStatus>(submission.status);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check for serialized DOB Modification form data
  let dobDetails: any = null;
  if (submission.additionalNotes && submission.additionalNotes.includes('"_type":"DOB_MODIFICATION_FORM"')) {
    try {
      dobDetails = JSON.parse(submission.additionalNotes);
    } catch (e) {
      // not JSON
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(submission.identifierCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Admin Accept Action
  const handleAccept = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ACCEPT",
          adminName: "Senior Verification Officer",
          adminNotes: adminNotes || "Accepted by admin for identity clearinghouse sync.",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to accept submission");
      }

      setMessage({ type: "success", text: "Submission successfully accepted into active processing queue!" });
      setStatus(data.data.status);
      onUpdate(data.data);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Status & Notes Update
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNotes,
          certificateRef,
          rejectionReason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update submission");
      }

      setMessage({ type: "success", text: "Submission details saved successfully!" });
      onUpdate(data.data);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const isPaid = submission.paymentStatus === "PAID";
  const canAccept = isPaid && !submission.adminAccepted;
  const is15Char = submission.serviceType === "IPE" || submission.serviceType === "MOD_IPE";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold">
                {submission.serviceType.replace("_", " ")} Submission
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-300 font-mono">{submission.trackingId}</span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">{submission.applicantName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {message && (
            <div
              className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <p>{message.text}</p>
            </div>
          )}

          {/* Accept Submission Action Banner */}
          {canAccept ? (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-5 text-white shadow-md space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-200" />
                    <span className="font-bold text-base">Payment Confirmed • Ready to Accept</span>
                  </div>
                  <p className="text-xs text-emerald-100">
                    Payment of {formatCurrency(submission.amount)} verified ({submission.paymentReference}).
                    Click below to accept this submission into the processing queue.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={handleAccept}
                className="w-full py-3 bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-lg shadow transition flex items-center justify-center gap-2 text-sm disabled:opacity-75"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Accept Submission</span>
              </button>
            </div>
          ) : submission.adminAccepted ? (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between text-indigo-900">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <div>
                  <span className="text-sm font-bold block">Submission Accepted</span>
                  <span className="text-xs text-indigo-700">
                    Accepted on {formatDate(submission.adminAcceptedAt || "")} by {submission.adminAcceptedBy || "Admin"}
                  </span>
                </div>
              </div>
              <StatusBadge status={submission.status} />
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-amber-900">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="text-sm font-bold block">Payment Pending</span>
                  <span className="text-xs text-amber-700">
                    This submission cannot be accepted until payment has been confirmed.
                  </span>
                </div>
              </div>
              <PaymentBadge status={submission.paymentStatus} />
            </div>
          )}

          {/* Identifier Code Card (15 Chars or 11 Digits) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {is15Char ? "15-Character Code" : "11-Digit NIN Number"}
              </span>
              <span className="text-xs font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                {submission.identifierCode.length} characters
              </span>
            </div>

            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3">
              <span className="font-mono text-lg font-bold tracking-widest text-slate-900">
                {submission.identifierCode}
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* If Modification, show modification type */}
            {submission.serviceType === "MODIFICATION" && submission.modificationType && (
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Target Modification Field:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {submission.modificationType}
                </span>
              </div>
            )}
          </div>

          {/* Applicant & Payment Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Applicant Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Applicant Information
              </h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{submission.applicantName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${submission.email}`} className="hover:underline text-emerald-700">
                    {submission.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href={`tel:${submission.phone}`} className="hover:underline">
                    {submission.phone}
                  </a>
                </div>
                {submission.state && (
                  <div className="text-xs text-slate-500 pt-1">
                    Location: {submission.lga ? `${submission.lga}, ` : ""}{submission.state} State
                  </div>
                )}
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Payment Breakdown
              </h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Amount:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(submission.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Payment Status:</span>
                  <PaymentBadge status={submission.paymentStatus} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Gateway Ref:</span>
                  <span className="font-mono text-xs text-slate-700 truncate max-w-[140px]">
                    {submission.paymentReference || "N/A"}
                  </span>
                </div>
                {submission.paidAt && (
                  <div className="text-xs text-slate-500 pt-1">
                    Paid on: {formatDate(submission.paidAt)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DOB Modification Extended Details Card */}
          {dobDetails && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      DOB Modification Record ({submission.modificationType})
                    </h4>
                    <p className="text-[10px] text-slate-500">Official applicant change request particulars</p>
                  </div>
                </div>

                {dobDetails.trackingId && (
                  <span className="text-[10px] font-mono font-bold bg-white px-2 py-1 rounded border border-amber-300 text-slate-800">
                    Track: {dobDetails.trackingId}
                  </span>
                )}
              </div>

              {/* Passport Photo Preview if uploaded */}
              {dobDetails.passportPhoto && (
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-amber-200">
                  <div className="w-16 h-20 rounded-md border border-slate-300 overflow-hidden shadow-sm shrink-0">
                    <img
                      src={dobDetails.passportPhoto}
                      alt="Uploaded Passport"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Passport Photo Attached
                    </span>
                    <p className="text-xs text-slate-600 mt-1">
                      Applicant passport photo submitted with modification request.
                    </p>
                  </div>
                </div>
              )}

              {/* Old vs New Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Old Details */}
                <div className="bg-white p-3 rounded-lg border border-rose-200 space-y-1.5">
                  <div className="font-bold text-rose-700 uppercase tracking-wider text-[10px] pb-1 border-b border-rose-100">
                    Old Details (On File)
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <span className="text-slate-500">Surname:</span>
                    <span className="font-medium text-slate-900">{dobDetails.oldSurname || "—"}</span>
                    <span className="text-slate-500">First Name:</span>
                    <span className="font-medium text-slate-900">{dobDetails.oldFirstName || "—"}</span>
                    <span className="text-slate-500">Middle Name:</span>
                    <span className="font-medium text-slate-900">{dobDetails.oldMiddleName || "—"}</span>
                    <span className="text-slate-500 font-bold text-rose-700">Date of Birth:</span>
                    <span className="font-bold text-rose-700">{dobDetails.oldDateOfBirth || "—"}</span>
                    <span className="text-slate-500">Town:</span>
                    <span className="font-medium text-slate-900">{dobDetails.oldTown || "—"}</span>
                    <span className="text-slate-500">State:</span>
                    <span className="font-medium text-slate-900">{dobDetails.oldState || "—"}</span>
                    <span className="text-slate-500">L.G.A:</span>
                    <span className="font-medium text-slate-900">{dobDetails.oldLGA || "—"}</span>
                    <span className="text-slate-500">Address:</span>
                    <span className="font-medium text-slate-900">{dobDetails.oldAddress || "—"}</span>
                    <span className="text-slate-500">State of Origin:</span>
                    <span className="font-medium text-slate-900">{dobDetails.oldStateOfOrigin || "—"}</span>
                    <span className="text-slate-500">L.G.A of Origin:</span>
                    <span className="font-medium text-slate-900">{dobDetails.oldLGAOfOrigin || "—"}</span>
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-medium text-slate-900">{dobDetails.oldPhoneNumber || "—"}</span>
                  </div>
                </div>

                {/* New Details */}
                <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1.5">
                  <div className="font-bold text-emerald-700 uppercase tracking-wider text-[10px] pb-1 border-b border-emerald-100">
                    New Details (Target)
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <span className="text-slate-500">Surname:</span>
                    <span className="font-medium text-slate-900">{dobDetails.newSurname || "—"}</span>
                    <span className="text-slate-500">First Name:</span>
                    <span className="font-medium text-slate-900">{dobDetails.newFirstName || "—"}</span>
                    <span className="text-slate-500">Middle Name:</span>
                    <span className="font-medium text-slate-900">{dobDetails.newMiddleName || "—"}</span>
                    <span className="text-slate-500 font-bold text-emerald-700">Date of Birth:</span>
                    <span className="font-bold text-emerald-700">{dobDetails.newDateOfBirth || "—"}</span>
                    <span className="text-slate-500">Town:</span>
                    <span className="font-medium text-slate-900">{dobDetails.newTown || "—"}</span>
                    <span className="text-slate-500">State:</span>
                    <span className="font-medium text-slate-900">{dobDetails.newState || "—"}</span>
                    <span className="text-slate-500">L.G.A:</span>
                    <span className="font-medium text-slate-900">{dobDetails.newLGA || "—"}</span>
                    <span className="text-slate-500">Address:</span>
                    <span className="font-medium text-slate-900">{dobDetails.newAddress || "—"}</span>
                    <span className="text-slate-500">State of Origin:</span>
                    <span className="font-medium text-slate-900">{dobDetails.newStateOfOrigin || "—"}</span>
                    <span className="text-slate-500">L.G.A of Origin:</span>
                    <span className="font-medium text-slate-900">{dobDetails.newLGAOfOrigin || "—"}</span>
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-medium text-slate-900">{dobDetails.newPhoneNumber || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Parents Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Father Info */}
                <div className="bg-white p-3 rounded-lg border border-blue-200 space-y-1">
                  <div className="font-bold text-blue-700 uppercase tracking-wider text-[10px] pb-1 border-b border-blue-100 flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    <span>Father Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                    <span className="text-slate-500">First Name:</span>
                    <span className="font-medium text-slate-900">{dobDetails.fatherFirstName || "—"}</span>
                    <span className="text-slate-500">Surname:</span>
                    <span className="font-medium text-slate-900">{dobDetails.fatherSurname || "—"}</span>
                    <span className="text-slate-500">Town:</span>
                    <span className="font-medium text-slate-900">{dobDetails.fatherTown || "—"}</span>
                    <span className="text-slate-500">State:</span>
                    <span className="font-medium text-slate-900">{dobDetails.fatherState || "—"}</span>
                    <span className="text-slate-500">L.G.A:</span>
                    <span className="font-medium text-slate-900">{dobDetails.fatherLGA || "—"}</span>
                  </div>
                </div>

                {/* Mother Info */}
                <div className="bg-white p-3 rounded-lg border border-purple-200 space-y-1">
                  <div className="font-bold text-purple-700 uppercase tracking-wider text-[10px] pb-1 border-b border-purple-100 flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    <span>Mother Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                    <span className="text-slate-500">First Name:</span>
                    <span className="font-medium text-slate-900">{dobDetails.motherFirstName || "—"}</span>
                    <span className="text-slate-500">Surname:</span>
                    <span className="font-medium text-slate-900">{dobDetails.motherSurname || "—"}</span>
                    <span className="text-slate-500">Middle Name:</span>
                    <span className="font-medium text-slate-900">{dobDetails.motherMiddleName || "—"}</span>
                    <span className="text-slate-500">Town:</span>
                    <span className="font-medium text-slate-900">{dobDetails.motherTown || "—"}</span>
                    <span className="text-slate-500">State:</span>
                    <span className="font-medium text-slate-900">{dobDetails.motherState || "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Workflow Management Form */}
          <form onSubmit={handleSaveDetails} className="space-y-4 pt-4 border-t border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">Status & Processing Notes</h4>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Workflow Lifecycle Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
              >
                <option value="PENDING_PAYMENT">Awaiting Payment</option>
                <option value="PAID_PENDING_ACCEPTANCE">Paid • Pending Admin Acceptance</option>
                <option value="ACCEPTED">Accepted by Admin</option>
                <option value="IN_PROGRESS">In Processing (Verification underway)</option>
                <option value="COMPLETED">Completed (Clearance Approved)</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Certificate / Slip Reference (for completed) */}
            {status === "COMPLETED" && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Clearance Certificate / NIMC Batch Approval Reference
                </label>
                <input
                  type="text"
                  value={certificateRef}
                  onChange={(e) => setCertificateRef(e.target.value)}
                  placeholder="e.g. CLEAR-BATCH-2026-NIMC-4892"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none font-mono"
                />
              </div>
            )}

            {/* Rejection Reason (for rejected) */}
            {status === "REJECTED" && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reason for Rejection (Visible to Applicant)
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this code or NIN could not be cleared..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-rose-300 text-sm focus:ring-2 focus:ring-rose-500/30 outline-none"
                ></textarea>
              </div>
            )}

            {/* Internal Admin Remarks */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Internal Remarks & Processing Audit Notes
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log internal details, operator comments, batch numbers, or sync notes..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
              ></textarea>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-sm shadow transition flex items-center gap-2 disabled:opacity-75"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Updates</span>
              </button>
            </div>
          </form>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Created: {formatDate(submission.createdAt)}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
