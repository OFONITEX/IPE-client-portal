"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ServiceType, DOBModificationData, PhoneModificationData } from "@/lib/types";
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
  Loader2,
  Upload,
  Camera,
  User,
  Users,
  Phone,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";

interface Props {
  initialService?: ServiceType;
}

export function SubmissionForm({ initialService = "IPE" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedService, setSelectedService] = useState<ServiceType>(initialService);
  const [identifierCode, setIdentifierCode] = useState("");
  const [modificationType, setModificationType] = useState("Name Correction");

  // DOB Modification extended form state
  const emptyDOBData: DOBModificationData = {
    oldSurname: "", oldFirstName: "", oldMiddleName: "", oldDateOfBirth: "",
    oldTown: "", oldState: "", oldLGA: "", oldAddress: "",
    oldStateOfOrigin: "", oldLGAOfOrigin: "", oldPhoneNumber: "",
    newSurname: "", newFirstName: "", newMiddleName: "", newDateOfBirth: "",
    newTown: "", newState: "", newLGA: "", newAddress: "",
    newStateOfOrigin: "", newLGAOfOrigin: "", newPhoneNumber: "",
    fatherFirstName: "", fatherSurname: "", fatherTown: "", fatherState: "", fatherLGA: "",
    motherFirstName: "", motherSurname: "", motherMiddleName: "", motherTown: "", motherState: "",
    trackingId: "", passportPhoto: "",
  };
  const [dobData, setDobData] = useState<DOBModificationData>(emptyDOBData);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  const isDOBType = modificationType === "Date of Birth" || modificationType === "DOB above 5 years";
  const isPhoneType = modificationType === "Phone Number Update";

  // Phone Number Modification state
  const [phoneData, setPhoneData] = useState<PhoneModificationData>({
    nin: "",
    newPhoneNumber: "",
    newEmail: "",
    emailPassword: "",
  });
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  const updateDOB = (field: keyof DOBModificationData, value: string) => {
    setDobData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Passport photo must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      updateDOB("passportPhoto", result);
    };
    reader.readAsDataURL(file);
  };

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

    setSubmitting(true);
    try {
      const payload: any = {
        serviceType: selectedService,
        identifierCode: validation.sanitized,
        modificationType: selectedService === "MODIFICATION" ? modificationType : undefined,
      };

      // Attach DOB extended form data if DOB or DOB above 5 years is selected
      if (selectedService === "MODIFICATION" && isDOBType) {
        payload.dobModificationData = dobData;
        const fullName = `${dobData.newSurname} ${dobData.newFirstName} ${dobData.newMiddleName}`.trim() ||
                         `${dobData.oldSurname} ${dobData.oldFirstName}`.trim();
        if (fullName) {
          payload.applicantName = fullName;
        }
        if (dobData.newPhoneNumber || dobData.oldPhoneNumber) {
          payload.phone = dobData.newPhoneNumber || dobData.oldPhoneNumber;
        }
        if (dobData.newState || dobData.oldState) {
          payload.state = dobData.newState || dobData.oldState;
        }
        if (dobData.newLGA || dobData.oldLGA) {
          payload.lga = dobData.newLGA || dobData.oldLGA;
        }
      }

      // Attach Phone modification data if Phone Number Update is selected
      if (selectedService === "MODIFICATION" && isPhoneType) {
        if (!phoneData.newPhoneNumber.trim()) {
          setErrorMsg("Please enter the new phone number.");
          setSubmitting(false);
          return;
        }
        if (!phoneData.newEmail.trim()) {
          setErrorMsg("Please enter the new email address.");
          setSubmitting(false);
          return;
        }
        if (!phoneData.emailPassword.trim()) {
          setErrorMsg("Please enter the password for the new email.");
          setSubmitting(false);
          return;
        }

        payload.phoneModificationData = {
          nin: validation.sanitized,
          newPhoneNumber: phoneData.newPhoneNumber.trim(),
          newEmail: phoneData.newEmail.trim(),
          emailPassword: phoneData.emailPassword.trim(),
        };
        payload.phone = phoneData.newPhoneNumber.trim();
        payload.email = phoneData.newEmail.trim();
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      {/* Agent Header bar */}
      <div className="bg-slate-900 text-white px-5 py-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Agent Direct Submission Desk
            </h2>
            <p className="text-xs text-slate-400">instantipesubmit.com.ng • Fast-track clearance & validation</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Service Fee</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {formatCurrency(serviceConfig.price)}
          </p>
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
                <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">Name, Phone, DOB, DOB &gt; 5yrs</p>
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

          {/* Modification Category Chips (Only for MODIFICATION) */}
          {selectedService === "MODIFICATION" && (
            <div className="pt-3 border-t border-slate-200 mt-3 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Select Modification Field <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "Name Correction", label: "Name Correction" },
                  { id: "Phone Number Update", label: "Phone Number" },
                  { id: "Date of Birth", label: "Date of Birth (DOB)" },
                  { id: "DOB above 5 years", label: "DOB above 5 years" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setModificationType(item.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center ${
                      modificationType === item.id
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Correction Extended Form */}
        {selectedService === "MODIFICATION" && isPhoneType && (
          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-blue-200 pb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Phone Number Correction Details
                </h3>
                <p className="text-xs text-slate-500">
                  Please provide your 11-digit NIN, new phone number, new email, and email password.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. NIN Number */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                    <span>NIN Number (11 Digits)</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      identifierCode.length === 11
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {identifierCode.length} / 11 digits
                  </span>
                </label>
                <input
                  type="text"
                  value={identifierCode}
                  onChange={handleCodeChange}
                  placeholder="Enter 11-digit NIN (e.g. 12345678901)"
                  maxLength={11}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">Must be the 11-digit National Identification Number.</p>
              </div>

              {/* 2. New Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>New Phone Number</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phoneData.newPhoneNumber}
                  onChange={(e) => setPhoneData((prev) => ({ ...prev, newPhoneNumber: e.target.value }))}
                  placeholder="e.g. 08012345678"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">Active phone number to link to your NIN profile.</p>
              </div>

              {/* 3. New Email */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>New Email Address</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={phoneData.newEmail}
                  onChange={(e) => setPhoneData((prev) => ({ ...prev, newEmail: e.target.value }))}
                  placeholder="e.g. applicant@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">Active email to be linked for verification.</p>
              </div>

              {/* 4. Email Password */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Email Password</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-medium">
                    Required for email sync & verification
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showEmailPassword ? "text" : "password"}
                    value={phoneData.emailPassword}
                    onChange={(e) => setPhoneData((prev) => ({ ...prev, emailPassword: e.target.value }))}
                    placeholder="Enter password for the new email address"
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailPassword(!showEmailPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    title={showEmailPassword ? "Hide password" : "Show password"}
                  >
                    {showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Password for the new email to enable verification code authorization.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DOB Modification Extended Form (for Date of Birth & DOB above 5 years) */}
        {selectedService === "MODIFICATION" && isDOBType && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 sm:p-6 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-amber-200 pb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center">
                <FileEdit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">DOB Modification Form</h3>
                <p className="text-[10px] text-slate-500">Complete all fields for {modificationType} processing</p>
              </div>
            </div>

            {/* NIN Display (read-only, pulled from above) */}
            {identifierCode && (
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500">NIN:</span>
                <span className="font-mono font-bold text-slate-900 tracking-wider text-sm">{identifierCode}</span>
              </div>
            )}

            {/* OLD DETAILS */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 bg-rose-100 px-2 py-0.5 rounded">Old Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {([
                  ["oldSurname", "Surname"],
                  ["oldFirstName", "First Name"],
                  ["oldMiddleName", "Middle Name"],
                  ["oldDateOfBirth", "Date of Birth"],
                  ["oldTown", "Town"],
                  ["oldState", "State"],
                  ["oldLGA", "L.G.A"],
                  ["oldAddress", "Address"],
                  ["oldStateOfOrigin", "State of Origin"],
                  ["oldLGAOfOrigin", "L.G.A of Origin"],
                  ["oldPhoneNumber", "Phone Number"],
                ] as [keyof DOBModificationData, string][]).map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">{label}</label>
                    <input
                      type={field === "oldDateOfBirth" ? "date" : "text"}
                      value={dobData[field] as string}
                      onChange={(e) => updateDOB(field, e.target.value)}
                      placeholder={label}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* NEW DETAILS */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">New Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {([
                  ["newSurname", "Surname"],
                  ["newFirstName", "First Name"],
                  ["newMiddleName", "Middle Name"],
                  ["newDateOfBirth", "Date of Birth"],
                  ["newTown", "Town"],
                  ["newState", "State"],
                  ["newLGA", "L.G.A"],
                  ["newAddress", "Address"],
                  ["newStateOfOrigin", "State of Origin"],
                  ["newLGAOfOrigin", "L.G.A of Origin"],
                  ["newPhoneNumber", "Phone Number"],
                ] as [keyof DOBModificationData, string][]).map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">{label}</label>
                    <input
                      type={field === "newDateOfBirth" ? "date" : "text"}
                      value={dobData[field] as string}
                      onChange={(e) => updateDOB(field, e.target.value)}
                      placeholder={label}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* FATHER INFORMATION */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Father Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {([
                  ["fatherFirstName", "First Name"],
                  ["fatherSurname", "Surname"],
                  ["fatherTown", "Town"],
                  ["fatherState", "State"],
                  ["fatherLGA", "L.G.A"],
                ] as [keyof DOBModificationData, string][]).map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">{label}</label>
                    <input
                      type="text"
                      value={dobData[field] as string}
                      onChange={(e) => updateDOB(field, e.target.value)}
                      placeholder={label}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* MOTHER INFORMATION */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">Mother Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {([
                  ["motherFirstName", "First Name"],
                  ["motherSurname", "Surname"],
                  ["motherMiddleName", "Middle Name"],
                  ["motherTown", "Town"],
                  ["motherState", "State"],
                ] as [keyof DOBModificationData, string][]).map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">{label}</label>
                    <input
                      type="text"
                      value={dobData[field] as string}
                      onChange={(e) => updateDOB(field, e.target.value)}
                      placeholder={label}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* TRACKING ID */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 bg-slate-200 px-2 py-0.5 rounded">Tracking ID</span>
              </div>
              <input
                type="text"
                value={dobData.trackingId}
                onChange={(e) => updateDOB("trackingId", e.target.value)}
                placeholder="Enter tracking ID if available"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-slate-400/40 focus:border-slate-400 transition"
              />
            </div>

            {/* PASSPORT PHOTO UPLOAD */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded">Passport Photograph</span>
              </div>
              <div className="flex items-start gap-4">
                {/* Upload area */}
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="flex-1 border-2 border-dashed border-slate-300 hover:border-teal-400 rounded-xl p-6 text-center cursor-pointer transition bg-white"
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Click to upload passport photo</p>
                  <p className="text-[10px] text-slate-400 mt-1">JPG, PNG • Max 2 MB</p>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                {/* Preview */}
                {photoPreview && (
                  <div className="w-24 h-28 rounded-xl border-2 border-teal-400 overflow-hidden shadow-md shrink-0">
                    <img src={photoPreview} alt="Passport" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
