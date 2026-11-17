import { NextRequest, NextResponse } from "next/server";
import { getSubmissionById, updateSubmission } from "@/lib/db";
import { SubmissionStatus } from "@/lib/types";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submission = getSubmissionById(params.id);
    if (!submission) {
      return NextResponse.json({ success: false, message: "Submission not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: submission });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const submission = getSubmissionById(params.id);

    if (!submission) {
      return NextResponse.json({ success: false, message: "Submission not found" }, { status: 404 });
    }

    const updates: any = {};

    // Action 1: Admin accepts submission after payment
    if (body.action === "ACCEPT") {
      if (submission.paymentStatus !== "PAID" && !body.forceOverride) {
        return NextResponse.json(
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

    // Action 2: Change Status (IN_PROGRESS, COMPLETED, REJECTED, etc.)
    if (body.status) {
      updates.status = body.status as SubmissionStatus;
    }

    // Action 3: Admin Notes, Rejection, Clearance Certificate
    if (body.adminNotes !== undefined) updates.adminNotes = body.adminNotes;
    if (body.rejectionReason !== undefined) updates.rejectionReason = body.rejectionReason;
    if (body.certificateRef !== undefined) updates.certificateRef = body.certificateRef;
    if (body.clearanceSlipUrl !== undefined) updates.clearanceSlipUrl = body.clearanceSlipUrl;

    // Action 4: Payment status override (if admin manually reconciles a bank transfer)
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
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

