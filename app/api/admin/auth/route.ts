import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@identityhub.ng";
const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASSWORD || "Admin@2026Password!";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    if (
      email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() &&
      password === DEFAULT_ADMIN_PASS
    ) {
      const response = NextResponse.json({
        success: true,
        message: "Authentication successful",
        admin: {
          email: DEFAULT_ADMIN_EMAIL,
          name: "Chief Verification Officer",
          role: "super_admin",
        },
      });

      // Set cookie for session
      response.cookies.set("identity_admin_session", "authenticated_session_valid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("identity_admin_session");
  const isAuthenticated = sessionCookie?.value === "authenticated_session_valid";

  return NextResponse.json({
    authenticated: isAuthenticated,
    admin: isAuthenticated
      ? {
          email: DEFAULT_ADMIN_EMAIL,
          name: "Chief Verification Officer",
          role: "super_admin",
        }
      : null,
  });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete("identity_admin_session");
  return response;
}

