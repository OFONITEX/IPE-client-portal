"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ServiceType, SERVICES_LIST } from "@/lib/types";
import {
  FilePlus,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";

export default function AdminNewSubmissionPage() {
  const router = useRouter();
  const [serviceType, setServiceType] = useState<ServiceType>("IPE");
  const [identifierCode, setIdentifierCode] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [modificationType, setModificationType] = useState("Name Correction");
  const [oldDob, setOldDob] = useState("");
  const [newDob, setNewDob] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "PENDING">("PAID");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successResult, setSuccessResult] = useState<any | null>(null);

  const selectedService = SERVICES_LIST.find((s) => s.type === serviceType) || SERVICES_LIST[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // Validate code length
      if (serviceType === "IPE" || serviceType === "MOD_IPE") {
        if (identifierCode.trim().length !== 15) {
          throw new Error("IPE Clearance Code must be exactly 15 alphanumeric characters.");
        }
      } else {
        if (!/^\d{11}$/.test(identifierCode.trim())) {
          throw new Error("NIN must be exactly 11 numeric digits.");
        }
      }

      let notes = additionalNotes;
      if (serviceType === "MODIFICATION") {
        const modDetails: string[] = [`Type: ${modificationType}`];
        if (oldDob) modDetails.push(`Old DOB: ${oldDob}`);
        if (newDob) modDetails.push(`New DOB: ${newDob}`);
        notes = `${modDetails.join(" | ")}. ${notes}`.trim();
      }

      const payload = {
        serviceType,
        identifierCode: identifierCode.trim().toUpperCase(),
        applicantName: applicantName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        state: state.trim(),
        lga: lga.trim(),
        modificationType: serviceType === "MODIFICATION" ? modificationType : undefined,
        additionalNotes: notes,
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create submission");
      }

      // If marked as paid by admin (direct cash/transfer), update submission
      if (paymentStatus === "PAID") {
        await fetch(`/api/submissions/${data.data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ACCEPT",
            adminName: "Admin Officer (Direct Cash/Transfer)",
            adminNotes: "Paid directly to administrative account. Fast-tracked.",
          }),
        });
      }

      setSuccessResult(data.data);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <FilePlus className="w-7 h-7 text-emerald-400" />
          Direct Admin Submission
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Submit an application directly on behalf of a citizen or field agent into the database.
        </p>
      </div>

      {successResult ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-emerald-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Direct Submission Successful!</h2>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-md mx-auto space-y-2 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Tracking ID:</span>
              <span className="font-mono font-bold text-emerald-400">{successResult.trackingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Applicant:</span>
              <span className="text-white font-semibold">{successResult.applicantName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Service:</span>
              <span className="text-slate-200">{successResult.serviceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Identifier:</span>
              <span className="font-mono text-slate-200">{successResult.identifierCode}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSuccessResult(null);
                setIdentifierCode("");
                setApplicantName("");
                setEmail("");
                setPhone("");
                setAdditionalNotes("");
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Submit Another Application
            </button>
            <button
              onClick={() => router.push("/admin/submissions")}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
            >
              View in Submissions Queue
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Service Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Select Service
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SERVICES_LIST.map((srv) => (
                <button
                  type="button"
                  key={srv.type}
                  onClick={() => {
                    setServiceType(srv.type);
                    setIdentifierCode("");
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    serviceType === srv.type
                      ? "bg-emerald-950/50 border-emerald-500 text-white shadow-md shadow-emerald-500/10"
                      : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{srv.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">{srv.inputFormat}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Identifier Code */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              {selectedService.codeLabel}
            </label>
            <input
              type="text"
              required
              maxLength={serviceType === "IPE" || serviceType === "MOD_IPE" ? 15 : 11}
              value={identifierCode}
              onChange={(e) => setIdentifierCode(e.target.value.toUpperCase())}
              placeholder={selectedService.placeholder}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm font-mono tracking-wider focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Modification Specialized Fields */}
          {serviceType === "MODIFICATION" && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Modification Category</label>
                <select
                  value={modificationType}
                  onChange={(e) => setModificationType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none"
                >
                  <option value="Name Correction">Name Correction</option>
                  <option value="Phone Number Update">Phone Number Update</option>
                  <option value="Date of Birth (DOB)">Date of Birth (DOB)</option>
                  <option value="DOB Above 5 Years">DOB Above 5 Years (Affidavit Required)</option>
                </select>
              </div>

              {(modificationType.includes("DOB") || modificationType.includes("Date")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Old Date of Birth</label>
                    <input
                      type="date"
                      value={oldDob}
                      onChange={(e) => setOldDob(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">New Date of Birth</label>
                    <input
                      type="date"
                      value={newDob}
                      onChange={(e) => setNewDob(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Applicant Demographics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="e.g. Ibrahim Abubakar Musa"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08012345678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="applicant@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Lagos / Kano"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">LGA</label>
                <input
                  type="text"
                  value={lga}
                  onChange={(e) => setLga(e.target.value)}
                  placeholder="Ikeja / Municipal"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Status by Admin */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Payment Settlement
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentStatus === "PAID"}
                  onChange={() => setPaymentStatus("PAID")}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
                <span>Direct Cash / Bank Transfer (Mark as Paid & Fast-Track)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentStatus === "PENDING"}
                  onChange={() => setPaymentStatus("PENDING")}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
                <span>Pending Payment</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Officer Notes (Optional)</label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Internal processing remarks or tracking references..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering Submission...
              </>
            ) : (
              <>
                Save & Dispatch Submission
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

