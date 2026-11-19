"use client";

import React, { Suspense } from "react";
import { SubmissionForm } from "@/components/SubmissionForm";
import {
  Lock,
  Clock,
  Headphones,
  HelpCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="py-6 sm:py-10 bg-slate-50 min-h-screen space-y-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Agent Submission Form */}
        <Suspense
          fallback={
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500 shadow border border-slate-200">
              Loading submission desk...
            </div>
          }
        >
          <SubmissionForm />
        </Suspense>
      </div>

      {/* Trust & Guarantees */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Bank-Grade Security</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  256-bit SSL encryption. All identity records processed in strict NDPR compliance.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Rapid Acceptance</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Submissions are accepted by admin operators promptly after payment confirmation.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Helpdesk Support</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Hotline & WhatsApp support (+234 800 433 6848) available for submission queries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Frequently Asked Questions
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Identity Services Submission FAQs
          </h2>
        </div>

        <div className="space-y-3">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              What is the difference between IPE and Mod IPE?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              Standard IPE is generated on fresh, new enrollments when biometric or demographic exceptions occur. Mod
              IPE is generated specifically when an existing profile modification experiences an exception hold. Both
              require the 15-character alphanumeric code.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              When should I choose Validation vs Mod Validation?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              Choose <strong>Validation</strong> if you need your active NIN verified and synced for banking or passport
              renewal. Choose <strong>Mod Validation</strong> if you previously submitted a modification (such as name or
              date of birth) and need to sync the newly modified data across the national registry.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              How does NIN Modification work on this portal?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              Provide your 11-digit NIN and select the target modification category (Name Correction, Date of Birth,
              Phone Number, or DOB above 5 years). For DOB modifications, complete the extended particulars form.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              When does the admin accept my submission?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              As soon as your payment is confirmed by the payment gateway, your application transitions to &quot;Paid •
              Pending Acceptance&quot; and immediately alerts the administrative team to accept and process it.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
