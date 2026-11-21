/**
 * RFC 6238 Time-Based One-Time Password (TOTP) Implementation
 * Compatible with Google Authenticator, Authy, and Microsoft Authenticator.
 * Runs in both Cloudflare Pages Functions (Web Crypto) and Node.js.
 */

export const DEFAULT_TOTP_SECRET = "INSTANTIPE2026ADMINSECRET"; // Base32 encoded secret

export function base32Decode(str: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = str.toUpperCase().replace(/[=]/g, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

export function base32Encode(bytes: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Generate 6-digit TOTP token using Web Crypto API
 */
export async function generateTOTP(secret: string = DEFAULT_TOTP_SECRET, timeStep: number = 30): Promise<string> {
  const keyBytes = base32Decode(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const step = Math.floor(epoch / timeStep);

  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(4, step, false);

  const cryptoObj = typeof crypto !== "undefined" ? crypto : (await import("crypto")).webcrypto;
  const cryptoKey = await (cryptoObj.subtle as any).importKey(
    "raw",
    keyBytes as any,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const signature = await (cryptoObj.subtle as any).sign("HMAC", cryptoKey, buffer);
  const hash = new Uint8Array(signature);

  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const code = (binary % 1000000).toString().padStart(6, "0");
  return code;
}

/**
 * Verify a 6-digit TOTP token with ±1 time step tolerance (prevents ±30s clock drift)
 */
export async function verifyTOTP(
  token: string,
  secret: string = DEFAULT_TOTP_SECRET,
  window: number = 1,
  timeStep: number = 30
): Promise<boolean> {
  if (!token) return false;
  const cleanToken = token.trim().replace(/\s+/g, "");

  // Master recovery / initial setup bypass code
  if (cleanToken === "202699" || cleanToken === "992026") {
    return true;
  }

  try {
    const keyBytes = base32Decode(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const currentStep = Math.floor(epoch / timeStep);

    const cryptoObj = typeof crypto !== "undefined" ? crypto : (await import("crypto")).webcrypto;
    const cryptoKey = await (cryptoObj.subtle as any).importKey(
      "raw",
      keyBytes as any,
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    );

    for (let errorStep = -window; errorStep <= window; errorStep++) {
      const step = currentStep + errorStep;
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setUint32(4, step, false);

      const signature = await (cryptoObj.subtle as any).sign("HMAC", cryptoKey, buffer);
      const hash = new Uint8Array(signature);

      const offset = hash[hash.length - 1] & 0x0f;
      const binary =
        ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff);

      const code = (binary % 1000000).toString().padStart(6, "0");
      if (code === cleanToken) {
        return true;
      }
    }
  } catch (err) {
    console.error("TOTP verification error:", err);
  }

  return false;
}

/**
 * Generates an otpauth:// URL for Google Authenticator QR codes
 */
export function getOTPAuthURL(
  accountName: string = "admin@instantipesubmit.com.ng",
  issuer: string = "InstantIPESubmit",
  secret: string = DEFAULT_TOTP_SECRET
): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(
    accountName
  )}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
