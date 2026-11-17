import { getSubmissionById, getSettings, updateSubmission } from "../../../lib/db";
import { generatePaymentReference } from "../../../lib/utils";

export const onRequestPost = async (context: any) => {
  try {
    const { submissionId } = (await context.request.json()) as any;

    if (!submissionId) {
      return Response.json({ success: false, message: "submissionId is required" }, { status: 400 });
    }

    const submission = getSubmissionById(submissionId);
    if (!submission) {
      return Response.json({ success: false, message: "Submission not found" }, { status: 404 });
    }

    const settings = getSettings();
    const reference = generatePaymentReference();

    updateSubmission(submission.id, {
      paymentReference: reference,
    });

    const amountInKobo = submission.amount * 100;
    const publicKey = settings.paystack.publicKey || "pk_test_sample_key_identity_portal";

    return Response.json({
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
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
};

