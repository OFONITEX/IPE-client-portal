"use client";

import React, { Suspense } from "react";
import { SubmissionForm } from "@/components/SubmissionForm";
import { ShieldCheck, HelpCircle } from "lucide-react";

export default function SubmitPage() {
  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Title area */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Official Submission Gateway
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Identity Services Application
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Choose your service below. For IPE and Personalization, ensure you input your exact 15-character code.
            For NIN Validation, provide your 11-digit number.
          </p>
        </div>

        {/* Suspense wrapped form */}
        <Suspense
          fallback={
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500 shadow border border-slate-200">
              Loading submission form...
            </div>
          }
        >
          <SubmissionForm />
        </Suspense>

        {/* Informational Help Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Need Help Locating Your Identifier Code?</p>
            <p className="text-blue-700 leading-relaxed">
              Your 15-character IPE code or Personalization code can be found on your enrollment transaction slip issued
              at the capture center. If you are submitting for Validation, use the 11-digit NIN issued on your National
              e-ID slip.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

