"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ServiceType } from "@/lib/types";
import { SERVICES } from "@/lib/config";
import { validateServiceCode, formatCurrency } from "@/lib/utils";
import {
  ShieldAlert,
  FileEdit,
  CheckCircle2,
  RefreshCw,
  Sliders,
  AlertCircle,
  ArrowRight,
  Lock,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Loader2,
} from "lucide-react";

interface Props {
  initialService?: ServiceType;
}

export function SubmissionForm({ initialService = "IPE" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedService, setSelectedService] = useState<ServiceType>(initialService);
  const [identifierCode, setIdentifierCode] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [modificationType, setModificationType] = useState("Name Correction");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync with URL query parameter if present
  useEffect(() => {
    const qService = searchParams.get("service")?.toUpperCase() as ServiceType;
    if (qService && SERVICES[qService]) {
      setSelectedService(qService);
    }
  }, [searchParams]);

  const serviceConfig = SERVICES[selectedService] || SERVICES.IPE;

  // Real-time validation computation
  const validation = validateServiceCode(selectedService, identifierCode);
  const rawLength = identifierCode.replace(/\s+/g, "").length;
  const isCodeComplete = rawLength === serviceConfig.expectedLength;

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (
      selectedService === "VALIDATION" ||
      selectedService === "MOD_VALIDATION" ||
      selectedService === "MODIFICATION"
    ) {
      // Only keep digits, max 11
      const digits = raw.replace(/\D/g, "").slice(0, 11);
      setIdentifierCode(digits);
    } else {
      // Alphanumeric, max 15, auto uppercase (for IPE and MOD_IPE)
      const alphaNum = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 15);
      setIdentifierCode(alphaNum);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validation.isValid) {
      setErrorMsg(validation.message);
      return;
    }

    if (!applicantName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg("Please complete all required contact fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: selectedService,
          identifierCode: validation.sanitized,
          applicantName,
          email,
          phone,
          state,
          lga,
          modificationType: selectedService === "MODIFICATION" ? modificationType : undefined,
          additionalNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create submission");
      }

      // Redirect directly to the secure checkout / payment page for this submission
      router.push(`/pay?id=${data.data.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  const getServiceIcon = (id: ServiceType) => {
    switch (id) {
      case "IPE":
        return <ShieldAlert className="w-5 h-5" />;
      case "MOD_IPE":
        return <FileEdit className="w-5 h-5" />;
      case "VALIDATION":
        return <CheckCircle2 className="w-5 h-5" />;
      case "MOD_VALIDATION":
        return <RefreshCw className="w-5 h-5" />;
      case "MODIFICATION":
        return <Sliders className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              Step 1 of 2 • Submission Details
            </span>
            <h2 className="text-2xl font-bold tracking-tight">Identity Services Submission Form</h2>
            <p className="text-slate-300 text-sm mt-1">
              Select your required service: IPE, Mod IPE, Validation, Mod Validation, or Modification.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-slate-400">Total Processing Fee</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {formatCurrency(serviceConfig.price)}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {/* Service Selector Grid (5 Services) */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Choose Required Service <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* 1. IPE */}
            <button
              type="button"
              onClick={() => {
                setSelectedService("IPE");
                setIdentifierCode("");
              }}
              className={`text-left p-3 rounded-xl border-2 transition flex flex-col justify-between ${
                selectedService === "IPE"
                  ? "border-emerald-600 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-600/30"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedService === "IPE" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  15 Chars
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">IPE Clearance</h4>
                <span className="text-xs font-extrabold text-emerald-700 mt-1 block">
                  {formatCurrency(SERVICES.IPE.price)}
                </span>
              </div>
            </button>

            {/* 2. Mod IPE */}
            <button
              type="button"
              onClick={() => {
                setSelectedService("MOD_IPE");
                setIdentifierCode("");
              }}
              className={`text-left p-3 rounded-xl border-2 transition flex flex-col justify-between ${
                selectedService === "MOD_IPE"
                  ? "border-emerald-600 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-600/30"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedService === "MOD_IPE" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <FileEdit className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  15 Chars
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">Mod IPE</h4>
                <span className="text-xs font-extrabold text-emerald-700 mt-1 block">
                  {formatCurrency(SERVICES.MOD_IPE.price)}
                </span>
              </div>
            </button>

            {/* 3. Validation */}
            <button
              type="button"
              onClick={() => {
                setSelectedService("VALIDATION");
                setIdentifierCode("");
              }}
              className={`text-left p-3 rounded-xl border-2 transition flex flex-col justify-between ${
                selectedService === "VALIDATION"
                  ? "border-emerald-600 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-600/30"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedService === "VALIDATION" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                  11 Digits
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">NIN Validation</h4>
                <span className="text-xs font-extrabold text-emerald-700 mt-1 block">
                  {formatCurrency(SERVICES.VALIDATION.price)}
                </span>
              </div>
            </button>

            {/* 4. Mod Validation */}
            <button
              type="button"
              onClick={() => {
                setSelectedService("MOD_VALIDATION");
                setIdentifierCode("");
              }}
              className={`text-left p-3 rounded-xl border-2 transition flex flex-col justify-between ${
                selectedService === "MOD_VALIDATION"
                  ? "border-emerald-600 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-600/30"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedService === "MOD_VALIDATION" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                  11 Digits
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">Mod Validation</h4>
                <span className="text-xs font-extrabold text-emerald-700 mt-1 block">
                  {formatCurrency(SERVICES.MOD_VALIDATION.price)}
                </span>
              </div>
            </button>

            {/* 5. Modification */}
            <button
              type="button"
              onClick={() => {
                setSelectedService("MODIFICATION");
                setIdentifierCode("");
              }}
              className={`text-left p-3 rounded-xl border-2 transition flex flex-col justify-between ${
                selectedService === "MODIFICATION"
                  ? "border-emerald-600 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-600/30"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedService === "MODIFICATION" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  11 Digits
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">NIN Modification</h4>
                <span className="text-xs font-extrabold text-emerald-700 mt-1 block">
                  {formatCurrency(SERVICES.MODIFICATION.price)}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Identifier Code Input (15-char or 11-digit) */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <span>{serviceConfig.codeLabel}</span>
              <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                isCodeComplete
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {rawLength} / {serviceConfig.expectedLength}{" "}
              {serviceConfig.formatType === "NUMERIC_11" ? "digits" : "chars"}
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={identifierCode}
              onChange={handleCodeChange}
              placeholder={serviceConfig.codePlaceholder}
              maxLength={serviceConfig.expectedLength}
              className={`w-full px-4 py-3.5 rounded-xl border font-mono text-lg font-bold tracking-widest text-slate-900 bg-white shadow-sm focus:outline-none focus:ring-2 transition ${
                validation.isValid
                  ? "border-emerald-500 focus:ring-emerald-500/30"
                  : rawLength > 0 && !validation.isValid
                  ? "border-amber-400 focus:ring-amber-400/30"
                  : "border-slate-300 focus:ring-emerald-500/30"
              }`}
            />
            {validation.isValid && (
              <div className="absolute right-3.5 top-3.5 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <p className="text-slate-500">{serviceConfig.helperText}</p>
            {validation.isValid && (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Valid Format
              </span>
            )}
          </div>

          {/* Modification Type Dropdown (Only for MODIFICATION) */}
          {selectedService === "MODIFICATION" && (
            <div className="pt-3 border-t border-slate-200 mt-3">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Select Modification Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={modificationType}
                onChange={(e) => setModificationType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
              >
                <option value="Name Correction">Name Correction (First, Middle, or Surname)</option>
                <option value="Date of Birth">Date of Birth Correction</option>
                <option value="Phone Number Update">Phone Number Update</option>
                <option value="Residential Address">Residential Address Update</option>
                <option value="State & LGA of Origin">State & LGA of Origin Correction</option>
                <option value="Multiple Fields">Multiple Fields Modification</option>
              </select>
            </div>
          )}
        </div>

        {/* Applicant Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
            Applicant Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name (as registered) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g. Ibrahim Chukwuemeka Adeleke"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address (for notification & receipt) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone Number (WhatsApp/SMS) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="080 1234 5678"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                State of Residence / Origin
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Lagos, Abuja, Kano"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Enrollment Center or Modification Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Specify capture center, modification details, or exception background if applicable..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Validation Error</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Pricing & Submit CTA */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Secure 256-bit checkout • Instant tracking reference issued</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Submission...</span>
              </>
            ) : (
              <>
                <span>Proceed to Payment ({formatCurrency(serviceConfig.price)})</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
