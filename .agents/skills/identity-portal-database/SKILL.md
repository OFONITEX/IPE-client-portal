---
name: identity-portal-database
description: >-
  Manage Supabase PostgreSQL schema, migrations, data indexing, and runtime client bindings for Identity
  Clearance & NIN Validation portals (InstantIPESubmit pattern). Use when working on schema.sql, database
  tables, Supabase client initialization, or data queries.
---

# Supabase PostgreSQL Database Architecture

The identity portal relies on **Supabase PostgreSQL** as its primary cloud datastore, with a resilient edge data layer that automatically handles connection fallback during development or offline testing.

---

## 🗄️ Database Tables Specification

### 1. `ipe_submissions`
Tracks every identity submission across all 5 services:
- `id`: UUID primary key (`DEFAULT gen_random_uuid()`)
- `tracking_id`: Unique tracking reference (`TRK-XXX-YEAR-RANDOM`)
- `service_type`: `IPE`, `MOD_IPE`, `VALIDATION`, `MOD_VALIDATION`, `MODIFICATION`
- `identifier_code`: 15-char transaction reference or 11-digit NIN
- `modification_type`: Optional details for modifications (Name, Phone, DOB, DOB >5yr)
- `applicant_name`, `email`, `phone`, `state`, `lga`, `additional_notes`
- `amount`, `payment_status` (`PENDING`, `PAID`, `FAILED`), `payment_reference`, `paid_at`
- `status`: `SUBMITTED`, `PAID_PENDING_ACCEPTANCE`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`
- `admin_accepted`, `admin_accepted_at`, `admin_accepted_by`, `admin_notes`, `certificate_url`
- `created_at`, `updated_at`: Timestamps with descending indexes for instant dashboard pagination.

### 2. `ipe_portal_settings`
Singleton configuration row (`id = 1`) controlling rates and support channels:
- `portal_name`, `portal_tagline`, `support_email`, `support_phone`, `support_whatsapp`
- `currency` (`NGN`), `currency_symbol` (`₦`)
- Service fees: `rate_ipe` (₦1,000), `rate_mod_ipe` (₦2,500), `rate_validation` (₦1,500), `rate_mod_validation` (₦1,500), `rate_modification` (₦2,500)
- `paystack_public_key`, `paystack_secret_key`, `paystack_test_mode`

### 3. `ipe_users`
Client authentication for self-service applicant tracking:
- `id`: UUID primary key
- `first_name`, `last_name`, `email` (unique index), `password_hash`, `created_at`

---

## 🔌 Edge Supabase Client Configuration

In `lib/supabase.ts`, the client is initialized without local session persistence to remain edge-compliant:

```typescript
import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient(env?: any) {
  const url = env?.SUPABASE_URL || env?.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env?.SUPABASE_SERVICE_ROLE_KEY || env?.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
```

---

## 🛠️ Verification & Schema Migration

To apply the complete schema:
1. Open the [Supabase SQL Editor](https://supabase.com/dashboard).
2. Execute the entire content of [`scripts/schema.sql`](file:///c:/Users/REG/.gemini/antigravity/scratch/identity_services_portal/scripts/schema.sql).
3. Verify connection using the verification script:
   ```powershell
   node .agents/skills/identity-portal-builder/scripts/verify.js
   ```
