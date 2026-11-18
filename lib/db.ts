import { Submission, PortalSettings } from "./types";
import { DEFAULT_SETTINGS } from "./config";
import { getSupabaseClient } from "./supabase";

function rowToSubmission(row: any): Submission {
  return {
    id: row.id,
    trackingId: row.tracking_id,
    serviceType: row.service_type,
    identifierCode: row.identifier_code,
    modificationType: row.modification_type || undefined,
    applicantName: row.applicant_name,
    email: row.email || "",
    phone: row.phone,
    state: row.state || "",
    lga: row.lga || "",
    additionalNotes: row.additional_notes || "",
    amount: Number(row.amount),
    paymentStatus: row.payment_status || "PENDING",
    paymentReference: row.payment_reference || "",
    paymentChannel: row.payment_channel || "paystack",
    paidAt: row.paid_at || undefined,
    status: row.status || "SUBMITTED",
    adminAccepted: Boolean(row.admin_accepted),
    adminAcceptedAt: row.admin_accepted_at || undefined,
    adminAcceptedBy: row.admin_accepted_by || undefined,
    adminNotes: row.admin_notes || undefined,
    certificateRef: row.certificate_url || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function submissionToRow(s: Partial<Submission>): any {
  const row: any = {};
  if (s.id !== undefined && s.id.length > 20 && s.id.includes("-")) {
    row.id = s.id;
  }
  if (s.trackingId !== undefined) row.tracking_id = s.trackingId;
  if (s.serviceType !== undefined) row.service_type = s.serviceType;
  if (s.identifierCode !== undefined) row.identifier_code = s.identifierCode;
  if (s.modificationType !== undefined) row.modification_type = s.modificationType;
  if (s.applicantName !== undefined) row.applicant_name = s.applicantName;
  if (s.email !== undefined) row.email = s.email;
  if (s.phone !== undefined) row.phone = s.phone;
  if (s.state !== undefined) row.state = s.state;
  if (s.lga !== undefined) row.lga = s.lga;
  if (s.additionalNotes !== undefined) row.additional_notes = s.additionalNotes;
  if (s.amount !== undefined) row.amount = s.amount;
  if (s.paymentStatus !== undefined) row.payment_status = s.paymentStatus;
  if (s.paymentReference !== undefined) row.payment_reference = s.paymentReference;
  if (s.paymentChannel !== undefined) row.payment_channel = s.paymentChannel;
  if (s.paidAt !== undefined) row.paid_at = s.paidAt;
  if (s.status !== undefined) row.status = s.status;
  if (s.adminAccepted !== undefined) row.admin_accepted = s.adminAccepted;
  if (s.adminNotes !== undefined) row.admin_notes = s.adminNotes;
  if (s.certificateRef !== undefined) row.certificate_url = s.certificateRef;
  return row;
}

// In-memory fallback cache
let memorySubmissions: Submission[] = [];
let memorySettings: PortalSettings = { ...DEFAULT_SETTINGS };

export async function getSubmissions(env?: any): Promise<Submission[]> {
  try {
    const supabase = getSupabaseClient(env);
    if (supabase) {
      const { data, error } = await supabase
        .from("ipe_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map(rowToSubmission);
      }
      if (error) {
        console.error("Supabase getSubmissions error:", error.message);
      }
    }
  } catch (err) {
    console.error("getSubmissions error:", err);
  }
  return memorySubmissions;
}

export async function getSubmissionById(idOrTracking: string, env?: any): Promise<Submission | undefined> {
  const search = idOrTracking.trim();
  try {
    const supabase = getSupabaseClient(env);
    if (supabase) {
      const isUUID = search.length === 36 && search.includes("-");
      let query = supabase.from("ipe_submissions").select("*");

      if (isUUID) {
        query = query.eq("id", search);
      } else {
        query = query.or(`tracking_id.eq.${search},identifier_code.eq.${search}`);
      }

      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return rowToSubmission(data);
      }
    }
  } catch (err) {
    console.error("getSubmissionById error:", err);
  }

  const upper = search.toUpperCase();
  return memorySubmissions.find(
    (s) => s.id === search || s.trackingId.toUpperCase() === upper || s.identifierCode.toUpperCase() === upper
  );
}

export async function createSubmission(newSubmission: Submission, env?: any): Promise<Submission> {
  try {
    const supabase = getSupabaseClient(env);
    if (supabase) {
      const row = submissionToRow(newSubmission);
      const { data, error } = await supabase.from("ipe_submissions").insert(row).select().single();
      if (!error && data) {
        return rowToSubmission(data);
      }
      if (error) {
        console.error("Supabase insert error:", error.message);
      }
    }
  } catch (err) {
    console.error("createSubmission error:", err);
  }

  memorySubmissions.unshift(newSubmission);
  return newSubmission;
}

export async function updateSubmission(
  idOrTracking: string,
  updates: Partial<Submission>,
  env?: any
): Promise<Submission | null> {
  const search = idOrTracking.trim();
  try {
    const supabase = getSupabaseClient(env);
    if (supabase) {
      const rowUpdates = submissionToRow(updates);
      rowUpdates.updated_at = new Date().toISOString();

      const isUUID = search.length === 36 && search.includes("-");
      let query = supabase.from("ipe_submissions").update(rowUpdates);

      if (isUUID) {
        query = query.eq("id", search);
      } else {
        query = query.or(`tracking_id.eq.${search},id.eq.${search}`);
      }

      const { data, error } = await query.select().maybeSingle();
      if (!error && data) {
        return rowToSubmission(data);
      }
      if (error) {
        console.error("Supabase update error:", error.message);
      }
    }
  } catch (err) {
    console.error("updateSubmission error:", err);
  }

  const idx = memorySubmissions.findIndex((s) => s.id === search || s.trackingId === search);
  if (idx === -1) return null;

  memorySubmissions[idx] = {
    ...memorySubmissions[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return memorySubmissions[idx];
}

export async function getSettings(env?: any): Promise<PortalSettings> {
  try {
    const supabase = getSupabaseClient(env);
    if (supabase) {
      const { data, error } = await supabase.from("ipe_portal_settings").select("*").eq("id", 1).maybeSingle();
      if (!error && data) {
        return {
          portalName: data.portal_name || DEFAULT_SETTINGS.portalName,
          portalTagline: data.portal_tagline || DEFAULT_SETTINGS.portalTagline,
          supportEmail: data.support_email || DEFAULT_SETTINGS.supportEmail,
          supportPhone: data.support_phone || DEFAULT_SETTINGS.supportPhone,
          supportWhatsApp: data.support_whatsapp || DEFAULT_SETTINGS.supportWhatsApp,
          currency: data.currency || DEFAULT_SETTINGS.currency,
          currencySymbol: data.currency_symbol || DEFAULT_SETTINGS.currencySymbol,
          rates: {
            ipe: Number(data.rate_ipe) || 1000,
            modIpe: Number(data.rate_mod_ipe) || 2500,
            validation: Number(data.rate_validation) || 1500,
            modValidation: Number(data.rate_mod_validation) || 1500,
            modification: Number(data.rate_modification) || 2500,
          },
          paystack: {
            enabled: DEFAULT_SETTINGS.paystack.enabled,
            publicKey: data.paystack_public_key || DEFAULT_SETTINGS.paystack.publicKey,
            secretKey: data.paystack_secret_key || DEFAULT_SETTINGS.paystack.secretKey,
            testMode: data.paystack_test_mode ?? DEFAULT_SETTINGS.paystack.testMode,
          },
        };
      }
    }
  } catch (err) {
    console.error("getSettings error:", err);
  }
  return memorySettings;
}

export async function saveSettings(settings: PortalSettings, env?: any): Promise<PortalSettings> {
  try {
    const supabase = getSupabaseClient(env);
    if (supabase) {
      await supabase.from("ipe_portal_settings").upsert({
        id: 1,
        portal_name: settings.portalName,
        portal_tagline: settings.portalTagline,
        support_email: settings.supportEmail,
        support_phone: settings.supportPhone,
        support_whatsapp: settings.supportWhatsApp,
        currency: settings.currency,
        currency_symbol: settings.currencySymbol,
        rate_ipe: settings.rates.ipe,
        rate_mod_ipe: settings.rates.modIpe,
        rate_validation: settings.rates.validation,
        rate_mod_validation: settings.rates.modValidation,
        rate_modification: settings.rates.modification,
        paystack_public_key: settings.paystack?.publicKey,
        paystack_secret_key: settings.paystack?.secretKey,
        paystack_test_mode: settings.paystack?.testMode,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("saveSettings error:", err);
  }
  memorySettings = { ...settings };
  return memorySettings;
}
