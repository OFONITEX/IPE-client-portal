import fs from "fs";
import path from "path";
import { Submission, PortalSettings } from "./types";
import { DEFAULT_SETTINGS } from "./config";

const DATA_DIR = path.join(process.cwd(), "data");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initial Seed data covering all 5 services
const SEED_SUBMISSIONS: Submission[] = [
  {
    id: "sub-seed-1",
    trackingId: "TRK-IPE-2026-4892K9",
    serviceType: "IPE",
    identifierCode: "IPE847291038AB5",
    applicantName: "Chinedu Emmanuel Okonkwo",
    email: "chinedu.e@example.com",
    phone: "08034567890",
    state: "Lagos",
    lga: "Ikeja",
    additionalNotes: "Biometrics captured at Alausa center with exception flag.",
    amount: 4500,
    paymentStatus: "PAID",
    paymentReference: "PAY-1731782400-8812",
    paymentChannel: "paystack",
    paidAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    status: "PAID_PENDING_ACCEPTANCE",
    adminAccepted: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
  },
  {
    id: "sub-seed-2",
    trackingId: "TRK-MIPE-2026-7712Q3",
    serviceType: "MOD_IPE",
    identifierCode: "MIP773919401ABZ",
    applicantName: "Babatunde Adeleke",
    email: "babatunde.adeleke@example.com",
    phone: "08055667788",
    state: "Oyo",
    lga: "Ibadan North",
    additionalNotes: "Mod IPE triggered after submitting date of birth adjustment.",
    amount: 5000,
    paymentStatus: "PAID",
    paymentReference: "PAY-1731779900-3312",
    paymentChannel: "paystack",
    paidAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    status: "PAID_PENDING_ACCEPTANCE",
    adminAccepted: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
  },
  {
    id: "sub-seed-3",
    trackingId: "TRK-VAL-2026-1192M4",
    serviceType: "VALIDATION",
    identifierCode: "49281729401",
    applicantName: "Amina Yusuf Bello",
    email: "amina.bello@example.com",
    phone: "08129876543",
    state: "Kano",
    lga: "Nassarawa",
    additionalNotes: "NIN validation required for international passport renewal.",
    amount: 1500,
    paymentStatus: "PAID",
    paymentReference: "PAY-1731778800-4421",
    paymentChannel: "bank_transfer",
    paidAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    status: "ACCEPTED",
    adminAccepted: true,
    adminAcceptedAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    adminAcceptedBy: "Admin Operator (HQ)",
    adminNotes: "Queued for batch sync with central gateway.",
    createdAt: new Date(Date.now() - 3600 * 1000 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
  },
  {
    id: "sub-seed-4",
    trackingId: "TRK-MVAL-2026-6623X1",
    serviceType: "MOD_VALIDATION",
    identifierCode: "71029384619",
    applicantName: "Grace Ngozi Eze",
    email: "grace.eze@example.com",
    phone: "07031122445",
    state: "Enugu",
    lga: "Enugu North",
    additionalNotes: "Post-modification validation following legal surname change.",
    amount: 2000,
    paymentStatus: "PAID",
    paymentReference: "PAY-1731774000-9921",
    paymentChannel: "paystack",
    paidAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    status: "IN_PROGRESS",
    adminAccepted: true,
    adminAcceptedAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
    adminAcceptedBy: "Admin Operator (HQ)",
    adminNotes: "Validating updated marital surname across KYC nodes.",
    createdAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
  },
  {
    id: "sub-seed-5",
    trackingId: "TRK-MOD-2026-8819L5",
    serviceType: "MODIFICATION",
    identifierCode: "19283746501",
    applicantName: "Mohammed Danjuma",
    email: "m.danjuma@example.com",
    phone: "08091122334",
    state: "Kaduna",
    lga: "Kaduna South",
    modificationType: "Date of Birth",
    additionalNotes: "Affidavit and birth certificate attached for DOB correction.",
    amount: 3500,
    paymentStatus: "PAID",
    paymentReference: "PAY-1731760000-5512",
    paymentChannel: "paystack",
    paidAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    status: "COMPLETED",
    adminAccepted: true,
    adminAcceptedAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
    adminAcceptedBy: "Admin Operator (HQ)",
    adminNotes: "Modification approved and record successfully updated on central registry.",
    certificateRef: "MOD-NIMC-BATCH-99420-OK",
    clearanceSlipUrl: "/slips/MOD-8819L5.pdf",
    createdAt: new Date(Date.now() - 3600 * 1000 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
  },
];

export function getSubmissions(): Submission[] {
  ensureDirectoryExists();
  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(SEED_SUBMISSIONS, null, 2));
    return SEED_SUBMISSIONS;
  }
  try {
    const raw = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading submissions:", err);
    return [];
  }
}

export function saveSubmissions(submissions: Submission[]): void {
  ensureDirectoryExists();
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
}

export function getSubmissionById(idOrTracking: string): Submission | undefined {
  const all = getSubmissions();
  const search = idOrTracking.trim().toUpperCase();
  return all.find(
    (s) => s.id === idOrTracking || s.trackingId.toUpperCase() === search || s.identifierCode.toUpperCase() === search
  );
}

export function createSubmission(newSubmission: Submission): Submission {
  const all = getSubmissions();
  all.unshift(newSubmission);
  saveSubmissions(all);
  return newSubmission;
}

export function updateSubmission(id: string, updates: Partial<Submission>): Submission | null {
  const all = getSubmissions();
  const idx = all.findIndex((s) => s.id === id || s.trackingId === id);
  if (idx === -1) return null;

  all[idx] = {
    ...all[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveSubmissions(all);
  return all[idx];
}

export function getSettings(): PortalSettings {
  ensureDirectoryExists();
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<PortalSettings>): PortalSettings {
  ensureDirectoryExists();
  const current = getSettings();
  const updated = { ...current, ...settings };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2));
  return updated;
}
