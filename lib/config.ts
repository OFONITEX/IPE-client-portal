import { ServiceConfig, PortalSettings } from "./types";

export const SERVICES: Record<string, ServiceConfig> = {
  IPE: {
    id: "IPE",
    name: "Internal Processing Exception (IPE)",
    shortDescription: "Enrollment exception resolution and clearance submission.",
    fullDescription: "Submit for rapid clearance of IPE (Internal Processing Exception) holds on fresh enrollments. Requires your 15-character alphanumeric exception tracking code issued during biometric capture.",
    codeLabel: "15-Character IPE Code",
    codePlaceholder: "e.g. IPE98234KLM8192",
    expectedLength: 15,
    formatType: "ALPHANUMERIC_15",
    helperText: "Must be exactly 15 characters consisting of letters (A-Z) and numbers (0-9).",
    price: 550,
    icon: "ShieldAlert",
    badgeText: "Enrollment Exception",
  },
  MOD_IPE: {
    id: "MOD_IPE",
    name: "Modification IPE (Mod IPE)",
    shortDescription: "Clearance for IPE exceptions triggered during profile modifications.",
    fullDescription: "Resolve biometric, demographic, or technical IPE exception holds resulting from an existing profile modification request. Requires your 15-character alphanumeric modification tracking code.",
    codeLabel: "15-Character Mod IPE Code",
    codePlaceholder: "e.g. MOD773919401ABZ",
    expectedLength: 15,
    formatType: "ALPHANUMERIC_15",
    helperText: "Must be exactly 15 characters consisting of letters (A-Z) and numbers (0-9).",
    price: 2000,
    icon: "FileEdit",
    badgeText: "Modification Hold",
    isModification: true,
  },
  VALIDATION: {
    id: "VALIDATION",
    name: "NIN Validation & Sync",
    shortDescription: "Verification, validation, and real-time record synchronization.",
    fullDescription: "Validate your 11-digit National Identification Number (NIN) against the central database for banking, passport issuance, telecom, or general KYC compliance.",
    codeLabel: "11-Digit NIN Number",
    codePlaceholder: "e.g. 10293847561",
    expectedLength: 11,
    formatType: "NUMERIC_11",
    helperText: "Must be exactly 11 numeric digits (0-9).",
    price: 1000,
    icon: "CheckCircle2",
    badgeText: "Instant Verification",
  },
  MOD_VALIDATION: {
    id: "MOD_VALIDATION",
    name: "Modification Validation (Mod Validation)",
    shortDescription: "Validation and synchronization of updated/modified NIN data.",
    fullDescription: "Validate an existing NIN after modifications (such as name adjustment, date of birth, or DOB above 5 years) have been approved, ensuring new details reflect across all connected agencies.",
    codeLabel: "11-Digit NIN Number",
    codePlaceholder: "e.g. 10293847561",
    expectedLength: 11,
    formatType: "NUMERIC_11",
    helperText: "Must be exactly 11 numeric digits (0-9).",
    price: 1500,
    icon: "RefreshCw",
    badgeText: "Post-Mod Sync",
    isModification: true,
  },
  MODIFICATION: {
    id: "MODIFICATION",
    name: "NIN Modification Request",
    shortDescription: "Correction of Name, Phone Number, Date of Birth, or DOB above 5 years.",
    fullDescription: "Submit an official data modification request on your NIN record for Name Correction, Phone Number, Date of Birth, or DOB above 5 years.",
    codeLabel: "11-Digit NIN Number",
    codePlaceholder: "e.g. 10293847561",
    expectedLength: 11,
    formatType: "NUMERIC_11",
    helperText: "Must be exactly 11 numeric digits (0-9).",
    price: 6500,
    icon: "Sliders",
    badgeText: "Data Correction",
    isModification: true,
  },
};

export const MODIFICATION_SUB_RATES: Record<string, number> = {
  "Name Correction": 6500,
  "Phone Number Update": 6500,
  "Date of Birth": 53000,
  "DOB above 5 years": 53000,
};

export function getServiceRate(serviceType: string, modificationType?: string): number {
  if (serviceType === "IPE") return 550;
  if (serviceType === "MOD_IPE") return 2000;
  if (serviceType === "VALIDATION") return 1000;
  if (serviceType === "MOD_VALIDATION") return 1500;
  if (serviceType === "MODIFICATION") {
    if (modificationType && MODIFICATION_SUB_RATES[modificationType]) {
      return MODIFICATION_SUB_RATES[modificationType];
    }
    return 6500;
  }
  return 550;
}

export const DEFAULT_SETTINGS: PortalSettings = {
  portalName: "InstantIPESubmit",
  portalTagline: "instantipesubmit.com.ng • Fast-Track IPE, Mod IPE, Validation, Mod Validation & Modifications",
  supportEmail: "support@instantipesubmit.com.ng",
  supportPhone: "+234 (0) 800 433 6848",
  supportWhatsApp: "+2348004336848",
  currency: "NGN",
  currencySymbol: "₦",
  rates: {
    ipe: 550,
    modIpe: 2000,
    validation: 1000,
    modValidation: 1500,
    modification: 6500,
  },
  paystack: {
    enabled: true,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_sample_key_identity_portal",
    secretKey: process.env.PAYSTACK_SECRET_KEY || "sk_test_sample_secret_identity_portal",
    testMode: true,
  },
};
