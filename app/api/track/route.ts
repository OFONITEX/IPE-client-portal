import { NextRequest, NextResponse } from "next/server";
import { getSubmissionById, getSubmissions } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ success: false, message: "Query parameter 'q' is required" }, { status: 400 });
    }

    const clean = query.trim().toUpperCase();
    const submission = getSubmissionById(clean);

    if (!submission) {
      // Also attempt partial match on phone or email
      const all = getSubmissions();
      const match = all.find(
        (s) =>
          s.trackingId.toUpperCase() === clean ||
          s.identifierCode.toUpperCase() === clean ||
          s.phone.includes(clean)
      );

      if (!match) {
        return NextResponse.json(
          { success: false, message: "No application found matching this reference code." },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: maskSensitive(match) });
    }

    return NextResponse.json({ success: true, data: maskSensitive(submission) });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Mask sensitive information for public tracking
function maskSensitive(submission: any) {
  const maskedName = submission.applicantName
    ? submission.applicantName
        .split(" ")
        .map((part: string) => (part.length > 2 ? part[0] + "*".repeat(part.length - 2) + part[part.length - 1] : part))
        .join(" ")
    : "";

  let maskedCode = submission.identifierCode;
  if (maskedCode.length === 11) {
    // 11 digit NIN: 123****7890
    maskedCode = maskedCode.substring(0, 3) + "****" + maskedCode.substring(7);
  } else if (maskedCode.length === 15) {
    maskedCode = maskedCode.substring(0, 4) + "******" + maskedCode.substring(10);
  }

  return {
    ...submission,
    applicantName: maskedName,
    identifierCode: maskedCode,
    email: submission.email ? submission.email.replace(/(.{2})(.*)(?=@)/, "$1***") : "",
  };
}

