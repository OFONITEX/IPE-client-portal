"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SERVICES } from "@/lib/config";
import { ServiceCard } from "@/components/ServiceCard";
import {
  ShieldCheck,
  Search,
  ArrowRight,
  Lock,
  Clock,
  CheckCircle,
  FileText,
  CreditCard,
  Headphones,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [quickTrackQuery, setQuickTrackQuery] = useState("");

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackQuery.trim()) {
      router.push(`/track?q=${encodeURIComponent(quickTrackQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified National Identity Submission Portal</span>
            </div>

            {/* Main title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Fast-Track Your <span className="text-emerald-400">IPE, Mod IPE</span> & NIN Validations
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Submit your 15-character IPE / Mod IPE exception clearance, 11-digit NIN Validation, Mod Validation, or
              Data Modification request with instant secure payment and administrative review.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-xl transition flex items-center justify-center gap-2 text-base"
              >
                <span>Start New Submission</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/track"
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 text-base"
              >
                <Search className="w-4 h-4 text-emerald-400" />
                <span>Track Application Status</span>
              </Link>
            </div>
          </div>

          {/* Quick Tracking Search Bar */}
          <div className="mt-12 sm:mt-16 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl">
              <form onSubmit={handleQuickTrack} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={quickTrackQuery}
                    onChange={(e) => setQuickTrackQuery(e.target.value)}
                    placeholder="Enter Tracking ID (e.g. TRK-IPE-...) or 11-digit NIN"
                    className="w-full pl-12 pr-4 py-3 bg-white/90 rounded-xl text-slate-900 placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Track</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              Instant lookup for all paid and in-progress submissions.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid Section (5 Services) */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Available Identity Services
          </span>
          <h2 className="text-3xl font-bold text-slate-900 mt-3 tracking-tight">
            Choose Your Submission Category
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            IPE and Mod IPE accept exact 15-character alphanumeric combinations. Validation, Mod Validation, and
            Modification accept exact 11-digit National Identification Numbers.
          </p>
        </div>

        {/* 5-card responsive layout: 3 on top, 2 centered on bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ServiceCard service={SERVICES.IPE} />
          <ServiceCard service={SERVICES.MOD_IPE} />
          <ServiceCard service={SERVICES.VALIDATION} />
          <ServiceCard service={SERVICES.MOD_VALIDATION} />
          <ServiceCard service={SERVICES.MODIFICATION} />
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section className="bg-slate-100 py-16 sm:py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
              Transparent Lifecycle
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
              How Submissions Work
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              From application entry to payment verification and administrative acceptance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base">Select & Enter Code</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose IPE / Mod IPE (15 chars) or Validation / Mod Validation / Modification (11 digits). Real-time
                validation checks character count immediately.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base">Make Online Payment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pay securely via integrated payment gateway (Card, Bank Transfer, USSD). A unique tracking reference
                is automatically issued.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-sm">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base">Admin Acceptance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Once payment is confirmed, the submission appears in the Admin Portal where authorized officers review
                and accept it into the active queue.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm">
                04
              </div>
              <h3 className="font-bold text-slate-900 text-base">Clearance & Slip</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track status in real-time. Upon completion, download your official clearance verification certificate or
                clearance reference slip.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Bank-Grade Security</h4>
                <p className="text-xs text-slate-300 mt-1">
                  256-bit SSL encryption. All personal identity and financial submissions are processed in strict
                  compliance with NDPR data regulations.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Rapid Turnaround</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Submissions are accepted by admin operators promptly after payment confirmation for rapid
                  reconciliation.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Live Support</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Helpdesk available via WhatsApp and hotline (+234 800 433 6848) to assist with any code formatting or
                  clearance questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Identity Services Submission FAQs
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              What is the difference between IPE and Mod IPE?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
              Standard IPE is generated on fresh, new enrollments when biometric or demographic exceptions occur. Mod
              IPE is generated specifically when an existing profile modification experiences an exception hold. Both
              require the 15-character alphanumeric code.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              When should I choose Validation vs Mod Validation?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
              Choose <strong>Validation</strong> if you need your active NIN verified and synced for banking or passport
              renewal. Choose <strong>Mod Validation</strong> if you previously submitted a modification (such as name or
              date of birth) and need to sync the newly modified data across the national registry.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              How does NIN Modification work on this portal?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
              Provide your 11-digit NIN and select the target modification category (e.g. Name Correction, Date of
              Birth, Phone, Address). Once payment is completed, the administrator will review your submission and route
              it for regulatory data adjustment.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              When does the admin accept my submission?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
              As soon as your payment is confirmed by the payment gateway, your application transitions to "Paid •
              Pending Acceptance" and immediately alerts the administrative team to accept and process it.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
