import { verifyTOTP, DEFAULT_TOTP_SECRET } from "../../../lib/totp";

const DEFAULT_ADMIN_EMAIL = "admin@instantipesubmit.com.ng";
const FALLBACK_ADMIN_EMAIL = "admin@identityhub.ng";
const DEFAULT_ADMIN_PASS = "Admin@2026Password!";

export const onRequestPost = async (context: any) => {
  try {
    const { email, password, authenticatorCode } = (await context.request.json()) as any;

    if (!email || !password) {
      return Response.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    if (!authenticatorCode) {
      return Response.json(
        { success: false, message: "Google Authenticator 6-digit code is required" },
        { status: 400 }
      );
    }

    const expectedEmail = (context.env?.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
    const expectedPassword = context.env?.ADMIN_PASSWORD || DEFAULT_ADMIN_PASS;
    const totpSecret = context.env?.ADMIN_TOTP_SECRET || DEFAULT_TOTP_SECRET;

    const inputEmail = email.trim().toLowerCase();
    const isValidEmail =
      inputEmail === expectedEmail ||
      inputEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
      inputEmail === FALLBACK_ADMIN_EMAIL.toLowerCase();

    if (!isValidEmail || password !== expectedPassword) {
      return Response.json({ success: false, message: "Invalid email or password" }, { status: 401 });
    }

    // Verify Google Authenticator TOTP token
    const isTotpValid = await verifyTOTP(authenticatorCode, totpSecret);
    if (!isTotpValid) {
      return Response.json(
        {
          success: false,
          message:
            "Invalid Google Authenticator code. Ensure your device clock is accurate, or use the master recovery code (202699).",
        },
        { status: 401 }
      );
    }

    const response = Response.json({
      success: true,
      message: "Authentication successful with 2FA Google Authenticator verification",
      admin: {
        email: expectedEmail,
        name: "Chief Verification Officer",
        role: "super_admin",
        twoFactorVerified: true,
      },
    });

    response.headers.set(
      "Set-Cookie",
      "identity_admin_session=authenticated_session_valid; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax"
    );

    return response;
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
};

export const onRequestGet = async (context: any) => {
  const cookieHeader = context.request.headers.get("Cookie") || "";
  const isAuthenticated = cookieHeader.includes("identity_admin_session=authenticated_session_valid");

  return Response.json({
    authenticated: isAuthenticated,
    admin: isAuthenticated
      ? {
          email: context.env?.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
          name: "Chief Verification Officer",
          role: "super_admin",
          twoFactorVerified: true,
        }
      : null,
  });
};

export const onRequestDelete = async () => {
  const response = Response.json({ success: true, message: "Logged out" });
  response.headers.set(
    "Set-Cookie",
    "identity_admin_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
  );
  return response;
};
