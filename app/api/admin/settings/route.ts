import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = saveSettings(body);
    return NextResponse.json({ success: true, message: "Settings saved successfully", data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

