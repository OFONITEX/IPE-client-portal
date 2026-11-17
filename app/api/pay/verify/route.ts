import { NextRequest, NextResponse } from "next/server";
import { getSubmissionById, updateSubmission, getSettings } from "@/lib/db";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { submissionId, reference, channel = "paystack", simulated = false } = await request.json();

    if (!submissionId || !reference) {
      return NextResponse.json(
        { success: false, message: "submissionId and reference are required" },
        { status: 400 }
      );
    }

    const submission = getSubmissionById(submissionId);
    if (!submission) {
      return NextResponse.json({ success: false, message: "Submission not found" }, { status: 404 });
    }

    const settings = getSettings();
    let paymentVerified = false;
    let gatewayResponse = "Success";

    // 1. If Paystack secret key is configured and this is not a simulated dev payment
    if (!simulated && settings.paystack.secretKey && !settings.paystack.secretKey.includes("sample_secret")) {
      try {
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: {
            Authorization: `Bearer ${settings.paystack.secretKey}`,
          },
        });
        const verifyData = await verifyRes.json();
        if (verifyData.status && verifyData.data.status === "success") {
          paymentVerified = true;
          gatewayResponse = verifyData.data.gateway_response || "Approved";
        } else {
          return NextResponse.json(
            { success: false, message: "Payment verification failed with provider." },
            { status: 400 }
          );
        }
      } catch (err: any) {
        console.error("Paystack verification error:", err);
        // Fallback to simulated in test mode if network fails
        if (settings.paystack.testMode) {
          paymentVerified = true;
        } else {
          return NextResponse.json(
            { success: false, message: "Could not reach payment provider." },
            { status: 502 }
          );
        }
      }
    } else {
      // Instant Simulated test payment
      paymentVerified = true;
      gatewayResponse = "Demo Payment Approved";
    }

    if (paymentVerified) {
      const updated = updateSubmission(submission.id, {
        paymentStatus: "PAID",
        paymentReference: reference,
        paymentChannel: channel as any,
        paidAt: new Date().toISOString(),
        status: "PAID_PENDING_ACCEPTANCE", // Marked as paid, now waiting for admin acceptance!
      });

      return NextResponse.json({
        success: true,
        message: "Payment successfully confirmed! Submission queued for admin acceptance.",
        data: updated,
      });
    }

    return NextResponse.json({ success: false, message: "Unable to verify transaction." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

