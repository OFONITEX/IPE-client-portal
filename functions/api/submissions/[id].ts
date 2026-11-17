import { getSubmissionById, updateSubmission } from "../../../lib/db";
import { SubmissionStatus } from "../../../lib/types";

export const onRequestGet = async (context: any) => {
  try {
    const id = context.params.id as string;
    const submission = getSubmissionById(id);
    if (!submission) {
      return Response.json({ success: false, message: "Submission not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: submission });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
};

export const onRequestPatch = async (context: any) => {
  try {
    const id = context.params.id as string;
    const body: any = await context.request.json();
    const submission = getSubmissionById(id);

    if (!submission) {
      return Response.json({ success: false, message: "Submission not found" }, { status: 404 });
    }

    const updates: any = {};

    if (body.action === "ACCEPT") {
      if (submission.paymentStatus !== "PAID" && !body.forceOverride) {
        return Response.json(
          {
            success: false,
            message: "Cannot accept an unpaid submission. Payment must be confirmed first.",
          },
          { status: 400 }
        );
      }

      updates.adminAccepted = true;
      updates.adminAcceptedAt = new Date().toISOString();
      updates.adminAcceptedBy = body.adminName || "System Admin";
      updates.status = "ACCEPTED" as SubmissionStatus;
      if (body.adminNotes) {
        updates.adminNotes = body.adminNotes;
      }
    }

    if (body.status) {
      updates.status = body.status as SubmissionStatus;
    }

    if (body.adminNotes !== undefined) updates.adminNotes = body.adminNotes;
    if (body.rejectionReason !== undefined) updates.rejectionReason = body.rejectionReason;
    if (body.certificateRef !== undefined) updates.certificateRef = body.certificateRef;
    if (body.clearanceSlipUrl !== undefined) updates.clearanceSlipUrl = body.clearanceSlipUrl;

    if (body.paymentStatus) {
      updates.paymentStatus = body.paymentStatus;
      if (body.paymentStatus === "PAID") {
        updates.paidAt = updates.paidAt || new Date().toISOString();
        if (submission.status === "PENDING_PAYMENT") {
          updates.status = "PAID_PENDING_ACCEPTANCE";
        }
      }
    }

    const updated = updateSubmission(submission.id, updates);
    return Response.json({ success: true, data: updated });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
};

