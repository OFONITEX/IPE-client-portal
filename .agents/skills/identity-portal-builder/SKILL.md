---
name: identity-portal-builder
description: >-
  Build, configure, replicate, troubleshoot, and deploy full-stack Identity Clearance & NIN
  Validation portals using Next.js Static Export, Cloudflare Pages Functions (Edge API), Supabase
  PostgreSQL, and Paystack. Use when creating, modifying, or maintaining portals for IPE Clearance,
  Mod IPE, NIN Validation, Mod Validation, and NIN Modifications.
---

# Identity Portal Builder (InstantIPESubmit Pattern)

A complete architectural runbook and deployment blueprint for building, modifying, or replicating high-performance, edge-hosted National Identity Clearance & NIN Verification portals.

---

## 🧩 Modular Step Skills in this Suite

This system is decomposed into 5 dedicated, focused step skills:

| Step Skill | Domain / Focus | Key Responsibilities |
|---|---|---|
| [`identity-portal-frontend`](../identity-portal-frontend/SKILL.md) | **Client Tier** | Next.js 14 Static Export, form validation (15-char/11-digit), DOB handling, Suspense boundaries |
| [`identity-portal-edge-api`](../identity-portal-edge-api/SKILL.md) | **Edge API Tier** | Cloudflare Pages Functions (`functions/api/`), tracking ID generation, PII masking, admin workflow |
| [`identity-portal-database`](../identity-portal-database/SKILL.md) | **Persistence Tier** | Supabase PostgreSQL schema (`ipe_submissions`, `ipe_portal_settings`, `ipe_users`), edge client |
| [`identity-portal-paystack`](../identity-portal-paystack/SKILL.md) | **Payments Tier** | Paystack initialization, Kobo conversion, reference generation, verification & simulation |
| [`identity-portal-deployment`](../identity-portal-deployment/SKILL.md) | **Deployment Tier** | Cloudflare Pages, custom domain (`instantipesubmit.com.ng`), DNS CNAME, environment secrets |

---

## 🏛️ Architecture Overview

The portal follows the **Hybrid Static-Edge Pattern** designed specifically for Cloudflare Pages:

```
┌────────────────────────────────────────────────────────┐
│  Client Tier (Next.js 14 Static Export)                │
│  - output: 'export', trailingSlash: true               │
│  - Prerendered HTML/JS assets inside out/              │
│  - instantipesubmit.com.ng / ipe-client-portal.pages.dev│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Edge API Tier (Cloudflare Pages Functions)             │
│  - Native ESbuild edge handlers in functions/api/      │
│  - Zero @cloudflare/next-on-pages build tool friction   │
│  - 0ms cold starts across 300+ edge data centers       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Persistence & Payments                                │
│  - Supabase PostgreSQL (ipe_submissions, ipe_settings) │
│  - Paystack Gateway (card, bank transfer, USSD, demo)  │
└────────────────────────────────────────────────────────┘
```

---

## 📋 The 5 Identity Services Specification

| # | Service Name | Code | Input Requirement | Default Rate | Scope / Purpose |
|---|---|---|---|---|---|
| **1** | **IPE Clearance** | `IPE` | **15 alphanumeric characters** | **₦1,000** | Fresh enrollment exception resolution |
| **2** | **Mod IPE** | `MOD_IPE` | **15 alphanumeric characters** | **₦2,500** | Modification hold clearance |
| **3** | **NIN Validation** | `VALIDATION` | **11 numeric digits** | **₦1,500** | Verification & record synchronization |
| **4** | **Mod Validation** | `MOD_VALIDATION` | **11 numeric digits** | **₦1,500** | Post-modification sync & validation |
| **5** | **NIN Modification** | `MODIFICATION` | **11 numeric digits** | **₦2,500** | **Name, Phone, Date of Birth (DOB), DOB above 5 years** |

> [!IMPORTANT]
> *Personalization* is excluded. Only these 5 standardized services are supported.

---

## 🛠️ Step-by-Step Implementation Runbook

### Step 1: Next.js Configuration for Static Export

In `next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};
export default nextConfig;
```

In `wrangler.toml`:
```toml
name = "ipe-client-portal"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "out"
```

In `public/_redirects`:
```text
# Rewrites dynamic parameterized static pages
/pay/:id /pay/?id=:id 301
/success/:id /success/?id=:id 301
```

---

### Step 2: Database Schema (Supabase PostgreSQL)

Execute the schema in the Supabase SQL Editor:
See [`scripts/schema.sql`](file:///C:/Users/REG/.gemini/antigravity/scratch/identity_services_portal/.agents/skills/identity-portal-builder/scripts/schema.sql)

```sql
CREATE TABLE IF NOT EXISTS ipe_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id VARCHAR(50) UNIQUE NOT NULL,
  service_type VARCHAR(30) NOT NULL,
  identifier_code VARCHAR(30) NOT NULL,
  modification_type VARCHAR(100),
  applicant_name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50) NOT NULL,
  state VARCHAR(100),
  lga VARCHAR(100),
  additional_notes TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  payment_status VARCHAR(30) DEFAULT 'PENDING',
  payment_reference VARCHAR(100),
  payment_channel VARCHAR(50) DEFAULT 'paystack',
  paid_at TIMESTAMPTZ,
  status VARCHAR(40) DEFAULT 'SUBMITTED',
  admin_accepted BOOLEAN DEFAULT FALSE,
  admin_accepted_at TIMESTAMPTZ,
  admin_accepted_by VARCHAR(100),
  admin_notes TEXT,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ipe_tracking_id ON ipe_submissions(tracking_id);
CREATE INDEX IF NOT EXISTS idx_ipe_identifier_code ON ipe_submissions(identifier_code);
CREATE INDEX IF NOT EXISTS idx_ipe_status ON ipe_submissions(status);
CREATE INDEX IF NOT EXISTS idx_ipe_created_at ON ipe_submissions(created_at DESC);
```

---

### Step 3: Edge API Functions (`functions/api/`)

Cloudflare Pages natively mounts edge handlers from `functions/`:

- `functions/api/submissions/index.ts`:
  - `GET`: Lists submissions with service/status filtering and search query.
  - `POST`: Validates 15-char/11-digit code, calculates fee, generates tracking ID (`TRK-XXX-YEAR-RANDOM`), and inserts to Supabase.
- `functions/api/submissions/[id].ts`:
  - `GET`: Returns single submission record.
  - `PATCH`: Admin actions (e.g. `ACCEPT`, attach certificate, add officer notes).
- `functions/api/track.ts`:
  - `GET ?q=...`: Public tracking by tracking ID, NIN, or code with sensitive demographic masking.
- `functions/api/pay/initialize.ts` & `functions/api/pay/verify.ts`:
  - Integrates Paystack API with instant fallback simulation for test transactions.
- `functions/api/admin/auth.ts`:
  - Secure session cookie authentication for operators.

---

### Step 4: Build & Deployment Commands (Windows PowerShell)

Always use `.cmd` wrappers and clean build output directories on Windows:

```powershell
# 1. Clean previous build artifacts (avoids EPERM file locking)
if (Test-Path "out") { Remove-Item -Recurse -Force "out" }
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

# 2. Compile static production export
npm.cmd run build

# 3. Direct Edge Deploy to Cloudflare Pages
npx.cmd wrangler pages deploy out --project-name=ipe-client-portal --branch=main --commit-dirty=true
```

---

### Step 5: Custom Domain Configuration (`instantipesubmit.com.ng`)

1. **Cloudflare Pages Dashboard**:
   - Project: `ipe-client-portal` ➔ **Custom domains** tab ➔ **Set up a custom domain**.
   - Add `instantipesubmit.com.ng` and `www.instantipesubmit.com.ng`.
2. **Domain Registrar DNS (Whogohost, Truehost, Upperlink, etc.)**:
   - Add `CNAME` for `@` pointing to `ipe-client-portal.pages.dev`.
   - Add `CNAME` for `www` pointing to `ipe-client-portal.pages.dev`.
   - Cloudflare provisions SSL/TLS automatically.

---

## ⚠️ Critical Troubleshooting & Gotchas

1. **Avoid `@cloudflare/next-on-pages` CLI build conflicts**:
   - Do **NOT** use `npx @cloudflare/next-on-pages`. On Windows, it throws shellac peer dependency conflicts with Next.js 14/15.
   - Use standard `next build` with `output: 'export'`, and let Cloudflare Pages Functions natively compile `functions/api/`.
2. **Handling Dynamic Query Routes**:
   - Next.js static export fails on dynamic folder paths like `app/pay/[id]/page.tsx` without `generateStaticParams`.
   - Instead, use static query routes `app/pay/page.tsx?id=...` wrapped in `<Suspense>`, paired with `public/_redirects`.
3. **Canvas Confetti SSR ReferenceError**:
   - Top-level `import confetti from "canvas-confetti"` breaks Node SSR prerendering (`self is not defined`).
   - Always dynamically import: `const confetti = (await import("canvas-confetti")).default;`.
4. **Transient EPERM on Windows**:
   - Windows file watchers occasionally lock `.next` or `out`. If `EPERM: operation not permitted, mkdir ...` occurs, remove `out` and rerun the command.

