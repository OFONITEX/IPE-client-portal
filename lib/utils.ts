import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ServiceType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, symbol: string = "₦"): string {
  return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

export function generateTrackingId(serviceType: ServiceType): string {
  let prefix = "SRV";
  switch (serviceType) {
    case "IPE":
      prefix = "IPE";
      break;
    case "MOD_IPE":
      prefix = "MIPE";
      break;
    case "VALIDATION":
      prefix = "VAL";
      break;
    case "MOD_VALIDATION":
      prefix = "MVAL";
      break;
    case "MODIFICATION":
      prefix = "MOD";
      break;
  }

  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomDigits = Math.floor(100 + Math.random() * 900);
  return `TRK-${prefix}-${year}-${randomDigits}${randomChars}`;
}

export function generatePaymentReference(): string {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PAY-${timestamp}-${random}`;
}

/**
 * Validates the identifier code based on service requirement:
 * - IPE: 15 alphanumeric characters (mix of letters and digits)
 * - MOD_IPE: 15 alphanumeric characters (mix of letters and digits)
 * - VALIDATION: 11 digits (NIN number)
 * - MOD_VALIDATION: 11 digits (NIN number)
 * - MODIFICATION: 11 digits (NIN number)
 */
export function validateServiceCode(
  serviceType: ServiceType,
  rawCode: string
): { isValid: boolean; message: string; sanitized: string } {
  const sanitized = rawCode.trim().replace(/\s+/g, "").toUpperCase();

  // 15-character alphanumeric services (IPE & MOD_IPE)
  if (serviceType === "IPE" || serviceType === "MOD_IPE") {
    const label = serviceType === "IPE" ? "IPE" : "Mod IPE";
    if (sanitized.length !== 15) {
      return {
        isValid: false,
        message: `${label} code must be exactly 15 characters (currently ${sanitized.length})`,
        sanitized,
      };
    }
    const isAlphanumeric = /^[A-Z0-9]{15}$/.test(sanitized);
    if (!isAlphanumeric) {
      return {
        isValid: false,
        message: `${label} code can only contain letters and numbers (no special symbols).`,
        sanitized,
      };
    }
    return { isValid: true, message: `Valid 15-character ${label} code`, sanitized };
  }

  // 11-digit numeric services (VALIDATION, MOD_VALIDATION, MODIFICATION)
  if (serviceType === "VALIDATION" || serviceType === "MOD_VALIDATION" || serviceType === "MODIFICATION") {
    const digitsOnly = sanitized.replace(/\D/g, "");
    if (digitsOnly.length !== 11) {
      return {
        isValid: false,
        message: `NIN must be exactly 11 numeric digits (currently ${digitsOnly.length})`,
        sanitized: digitsOnly,
      };
    }
    return { isValid: true, message: "Valid 11-digit NIN number", sanitized: digitsOnly };
  }

  return { isValid: false, message: "Unknown service type", sanitized };
}

export function formatDate(isoDateString: string): string {
  try {
    const d = new Date(isoDateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoDateString;
  }
}
