import { NextRequest, NextResponse } from "next/server";
import { getSubmissionById, getSettings, updateSubmission } from "@/lib/db";
import { generatePaymentReference } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { submissionId, channel } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ success: false, message: "submissionId is required" }, { status: 400 });
    }

    const submission = getSubmissionById(submissionId);
    if (!submission) {
      return NextResponse.json({ success: false, message: "Submission not found" }, { status: 404 });
    }

    const settings = getSettings();
    const reference = generatePaymentReference();

    // Store the reference on the submission
    updateSubmission(submission.id, {
      paymentReference: reference,
    });

    const amountInKobo = submission.amount * 100;
    const publicKey = settings.paystack.publicKey || "pk_test_sample_key_identity_portal";

    // Build response for both Paystack Inline and Instant Test Checkout
    return NextResponse.json({
      success: true,
      data: {
        reference,
        amount: submission.amount,
        amountInKobo,
        email: submission.email,
        applicantName: submission.applicantName,
        serviceType: submission.serviceType,
        trackingId: submission.trackingId,
        publicKey,
        currency: settings.currency,
        testMode: settings.paystack.testMode,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

