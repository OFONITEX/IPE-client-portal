"use client";

import React, { Suspense } from "react";
import { SubmissionForm } from "@/components/SubmissionForm";

export default function SubmitPage() {
  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Suspense wrapped agent submission form */}
        <Suspense
          fallback={
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500 shadow border border-slate-200">
              Loading agent submission form...
            </div>
          }
        >
          <SubmissionForm />
        </Suspense>
      </div>
    </div>
  );
}

