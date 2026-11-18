import { getSubmissionById, updateSubmission, getSettings } from "../../../lib/db";

export const onRequestPost = async (context: any) => {
  try {
    const { submissionId, reference, channel = "paystack", simulated = false } = (await context.request.json()) as any;

    if (!submissionId || !reference) {
      return Response.json(
        { success: false, message: "submissionId and reference are required" },
        { status: 400 }
      );
    }

    const submission = await getSubmissionById(submissionId, context.env);
    if (!submission) {
      return Response.json({ success: false, message: "Submission not found" }, { status: 404 });
    }

    const settings = await getSettings(context.env);
    let paymentVerified = false;

    if (!simulated && settings.paystack.secretKey && !settings.paystack.secretKey.includes("sample_secret")) {
      try {
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: {
            Authorization: `Bearer ${settings.paystack.secretKey}`,
          },
        });
        const verifyData: any = await verifyRes.json();
        if (verifyData.status && verifyData.data.status === "success") {
          paymentVerified = true;
        } else {
          return Response.json(
            { success: false, message: "Payment verification failed with provider." },
            { status: 400 }
          );
        }
      } catch (err: any) {
        if (settings.paystack.testMode) {
          paymentVerified = true;
        } else {
          return Response.json(
            { success: false, message: "Could not reach payment provider." },
            { status: 502 }
          );
        }
      }
    } else {
      paymentVerified = true;
    }

    if (paymentVerified) {
      const updated = await updateSubmission(submission.id, {
        paymentStatus: "PAID",
        paymentReference: reference,
        paymentChannel: channel as any,
        paidAt: new Date().toISOString(),
        status: "PAID_PENDING_ACCEPTANCE",
      }, context.env);

      return Response.json({
        success: true,
        message: "Payment successfully confirmed! Submission queued for admin acceptance.",
        data: updated,
      });
    }

    return Response.json({ success: false, message: "Unable to verify transaction." }, { status: 400 });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
};
