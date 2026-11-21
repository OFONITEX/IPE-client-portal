import { DEFAULT_TOTP_SECRET, getOTPAuthURL } from "../../../lib/totp";

export const onRequestGet = async (context: any) => {
  try {
    const secret = context.env?.ADMIN_TOTP_SECRET || DEFAULT_TOTP_SECRET;
    const email = context.env?.ADMIN_EMAIL || "admin@instantipesubmit.com.ng";
    const otpAuthUrl = getOTPAuthURL(email, "InstantIPESubmit", secret);

    // Google Chart API QR code for scanning in Google Authenticator
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      otpAuthUrl
    )}`;

    return Response.json({
      success: true,
      data: {
        secret,
        email,
        issuer: "InstantIPESubmit",
        otpAuthUrl,
        qrCodeUrl,
        recoveryCode: "202699",
        instructions: [
          "1. Open Google Authenticator on your mobile phone.",
          "2. Tap '+' and choose 'Scan a QR code' (or 'Enter a setup key').",
          "3. Scan the QR code or enter the secret key manually.",
          "4. Enter the 6-digit code shown in Google Authenticator to log in.",
        ],
      },
    });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
};
