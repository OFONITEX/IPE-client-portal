"use client";

import React, { useState, useEffect } from "react";
import { Submission, ServiceType, SubmissionStatus } from "@/lib/types";
import { StatusBadge, PaymentBadge } from "@/components/StatusBadge";
import { AdminSubmissionDrawer } from "@/components/AdminSubmissionDrawer";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  Download,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
} from "lucide-react";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleQuickAccept = async (e: React.MouseEvent, sub: Submission) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/submissions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ACCEPT",
          adminName: "Senior Clearance Officer",
          adminNotes: "Quick-accepted via submissions queue table.",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        handleUpdate(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Filtered dataset
  const filteredSubmissions = submissions.filter((sub) => {
    if (serviceFilter !== "ALL" && sub.serviceType !== serviceFilter) {
      return false;
    }
    if (statusFilter !== "ALL" && sub.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const match =
        sub.trackingId.toLowerCase().includes(q) ||
        sub.identifierCode.toLowerCase().includes(q) ||
        sub.applicantName.toLowerCase().includes(q) ||
        sub.email.toLowerCase().includes(q) ||
        sub.phone.includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) return;

    const headers = [
      "Tracking ID",
      "Service",
      "Identifier Code",
      "Applicant Name",
      "Email",
      "Phone",
      "State",
      "LGA",
      "Modification Type",
      "Amount",
      "Payment Status",
      "Payment Ref",
      "Lifecycle Status",
      "Admin Accepted",
      "Admin Accepted At",
      "Certificate Ref",
      "Created At",
    ];

    const rows = filteredSubmissions.map((s) => [
      `"${s.trackingId}"`,
      `"${s.serviceType}"`,
      `"${s.identifierCode}"`,
      `"${s.applicantName.replace(/"/g, '""')}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      `"${s.state || ""}"`,
      `"${s.lga || ""}"`,
      `"${s.modificationType || ""}"`,
      s.amount,
      `"${s.paymentStatus}"`,
      `"${s.paymentReference || ""}"`,
      `"${s.status}"`,
      s.adminAccepted ? "YES" : "NO",
      `"${s.adminAcceptedAt || ""}"`,
      `"${s.certificateRef || ""}"`,
      `"${s.createdAt}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `identity_submissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getServiceBadge = (type: ServiceType) => {
    switch (type) {
      case "IPE":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "MOD_IPE":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "VALIDATION":
        return "bg-teal-500/20 text-teal-300 border-teal-500/30";
      case "MOD_VALIDATION":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "MODIFICATION":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Identity Submissions Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review, verify, and accept applications for IPE, Mod IPE, Validation, Mod Validation, and Modifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchSubmissions}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Quick status tabs */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {[
            { id: "ALL", label: "All Submissions" },
            { id: "PAID_PENDING_ACCEPTANCE", label: "Awaiting Acceptance", badge: submissions.filter((s) => s.status === "PAID_PENDING_ACCEPTANCE").length },
            { id: "ACCEPTED", label: "Accepted by Admin" },
            { id: "IN_PROGRESS", label: "In Processing" },
            { id: "COMPLETED", label: "Completed" },
            { id: "PENDING_PAYMENT", label: "Awaiting Payment" },
            { id: "REJECTED", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? "bg-emerald-600 text-white font-bold shadow-sm"
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-emerald-950 font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          {/* Search */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Tracking ID, 15-char code, 11-digit NIN, applicant name, phone..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Service Dropdown (All 5 Services) */}
          <div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="ALL">All Services (5)</option>
              <option value="IPE">IPE Clearances (15 Chars)</option>
              <option value="MOD_IPE">Mod IPE (15 Chars)</option>
              <option value="VALIDATION">NIN Validation (11 Digits)</option>
              <option value="MOD_VALIDATION">Mod Validation (11 Digits)</option>
              <option value="MODIFICATION">NIN Modification (11 Digits)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Tracking ID & Date</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Identifier Code</th>
                <th className="py-3.5 px-4">Applicant Info</th>
                <th className="py-3.5 px-4">Amount & Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No submissions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const canAccept = sub.paymentStatus === "PAID" && !sub.adminAccepted;

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSubmission(sub)}
                      className={`hover:bg-slate-800/70 cursor-pointer transition ${
                        canAccept ? "bg-blue-950/20" : ""
                      }`}
                    >
                      {/* Tracking ID & Date */}
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-white block">{sub.trackingId}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(sub.createdAt)}</span>
                      </td>

                      {/* Service Category */}
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] border ${getServiceBadge(
                            sub.serviceType
                          )}`}
                        >
                          {sub.serviceType.replace("_", " ")}
                        </span>
                      </td>

                      {/* Code with Quick Copy */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400">{sub.identifierCode}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(sub.identifierCode, sub.id);
                            }}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                            title="Copy Code"
                          >
                            {copiedId === sub.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {sub.modificationType && (
                          <span className="text-[10px] text-amber-400 block font-sans">
                            {sub.modificationType}
                          </span>
                        )}
                      </td>

                      {/* Applicant */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-100">{sub.applicantName}</div>
                        <div className="text-[11px] text-slate-400">{sub.phone} • {sub.email}</div>
                      </td>

                      {/* Amount & Payment */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white">{formatCurrency(sub.amount)}</div>
                        <div className="pt-0.5">
                          <PaymentBadge status={sub.paymentStatus} />
                        </div>
                      </td>

                      {/* Lifecycle Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={sub.status} />
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        {canAccept ? (
                          <button
                            onClick={(e) => handleQuickAccept(e, sub)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition inline-flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 hover:text-white font-medium inline-flex items-center gap-1">
                            <span>Review</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredSubmissions.length} of {submissions.length} submissions</span>
          <span>Click any row for detailed inspection and status management</span>
        </div>
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
