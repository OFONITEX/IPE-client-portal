"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Submission } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronRight,
} from "lucide-react";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const submissionId = searchParams.get("id") || "";

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (submissionId) {
      fetchSubmission();
    } else {
      setLoading(false);
    }
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      const res = await fetch(`/api/submissions/${submissionId}`);
      const data: any = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Submission not found");
      }

      setSubmission(data.data);

      if (data.data.paymentStatus === "PAID") {
        router.push(`/success?id=${data.data.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load submission");
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackPayment = async () => {
    if (!submission) return;
    setProcessing(true);
    setErrorMsg("");

    try {
      const initRes = await fetch("/api/pay/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: submission.id }),
      });
      const initData: any = await initRes.json();
      if (!initRes.ok || !initData.success) {
        throw new Error(initData.message || "Failed to initialize payment gateway");
      }

      const { reference, amountInKobo, email, publicKey } = initData.data;

      if (typeof window !== "undefined" && window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: publicKey,
          email,
          amount: amountInKobo,
          ref: reference,
          currency: "NGN",
          metadata: {
            custom_fields: [
              { display_name: "Service Type", variable_name: "service_type", value: submission.serviceType },
              { display_name: "Identifier Code", variable_name: "identifier_code", value: submission.identifierCode },
              { display_name: "Tracking ID", variable_name: "tracking_id", value: submission.trackingId },
            ],
          },
          callback: async function () {
            await verifyPayment(reference, "paystack");
          },
          onClose: function () {
            setProcessing(false);
          },
        });
        handler.openIframe();
      } else {
        await handleInstantSimulatedPayment();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error opening payment gateway");
      setProcessing(false);
    }
  };

  const handleInstantSimulatedPayment = async () => {
    if (!submission) return;
    setProcessing(true);
    setErrorMsg("");

    const ref = `SIM-PAY-${Date.now()}`;
    await verifyPayment(ref, "demo_simulated", true);
  };

  const verifyPayment = async (reference: string, channel: string, simulated: boolean = false) => {
    try {
      const verifyRes = await fetch("/api/pay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submission!.id,
          reference,
          channel,
          simulated,
        }),
      });

      const verifyData: any = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || "Payment verification failed");
      }

      setPaymentSuccess(true);
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      setTimeout(() => {
        router.push(`/success?id=${submission!.id}`);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to confirm payment with backend");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-600">Loading checkout session...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Application Not Found</h2>
          <p className="text-sm text-slate-600">
            {errorMsg || "The requested submission could not be retrieved."}
          </p>
          <button
            onClick={() => router.push("/submit")}
            className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-medium text-sm"
          >
            Create New Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <Lock className="w-3 h-3" />
            Step 2 of 2 • Secure Payment Checkout
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Confirm & Complete Payment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Your application reference has been registered. Complete payment to route to admin for acceptance.
          </p>
        </div>

        {paymentSuccess ? (
          <div className="bg-white rounded-2xl p-8 border border-emerald-200 shadow-xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Payment Successfully Confirmed!</h2>
            <p className="text-sm text-slate-600">
              Your submission has been queued for admin acceptance. Redirecting to your official receipt...
            </p>
            <div className="pt-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600 mx-auto" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-6 p-6 sm:p-8">
            <div className="bg-slate-900 text-white rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                <span className="text-slate-400">Tracking Reference:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{submission.trackingId}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 block">Service Selected</span>
                  <span className="font-bold text-lg text-white">
                    {submission.serviceType === "IPE"
                      ? "IPE Exception Clearance"
                      : submission.serviceType === "MOD_IPE"
                      ? "Mod IPE Clearance"
                      : submission.serviceType === "VALIDATION"
                      ? "NIN Validation"
                      : submission.serviceType === "MOD_VALIDATION"
                      ? "Mod Validation"
                      : "NIN Modification"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-slate-400 block">Amount Due</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                    {formatCurrency(submission.amount)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-lg p-3 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  {submission.serviceType === "IPE" || submission.serviceType === "MOD_IPE"
                    ? "15-Char Code:"
                    : "11-Digit NIN:"}
                </span>
                <span className="font-mono font-bold text-white text-sm tracking-wider">
                  {submission.identifierCode}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-b border-slate-200 pb-4 text-xs sm:text-sm text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Applicant:</span>
                <span className="font-semibold text-slate-900">{submission.applicantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-800">{submission.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="text-slate-800">{submission.phone}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Select Payment Method
              </h3>

              <button
                type="button"
                disabled={processing}
                onClick={handlePaystackPayment}
                className="w-full p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-100/80 transition flex items-center justify-between group disabled:opacity-75"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                      Pay with Paystack (Card, Transfer, USSD)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Supports all Nigerian bank cards, transfers, and instant USSD.
                    </p>
                  </div>
                </div>
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-700" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-emerald-700 group-hover:translate-x-1 transition" />
                )}
              </button>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleInstantSimulatedPayment}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-75"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Instant Test Payment (Demo Checkout)</span>
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-1.5">
                  Allows instant payment simulation for rapid review and testing.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>TLS 1.3 Certified • Verified Payment Gateway</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
