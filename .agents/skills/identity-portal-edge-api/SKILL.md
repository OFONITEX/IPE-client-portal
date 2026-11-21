---
name: identity-portal-edge-api
description: >-
  Develop, extend, and test native Cloudflare Pages Functions (Edge API) for Identity Clearance & NIN
  Verification portals (InstantIPESubmit pattern). Use when working on functions/api/ handlers, tracking ID
  generation, PII masking, admin approval workflows, or user session cookies.
---

# Cloudflare Pages Edge API Tier (`functions/api/`)

The API tier runs entirely as native **Cloudflare Pages Functions** mounted under `functions/api/`. These functions execute on Cloudflare's global edge network in V8 isolates with instant startup and zero Node.js peer-dependency overhead.

---

## 📂 Edge API Route Architecture

```text
functions/api/
├── submissions/
│   ├── index.ts        # GET (list/filter) & POST (create submission)
│   └── [id].ts         # GET (single) & PATCH (admin action dispatcher)
├── track.ts            # GET (?q=...) Public tracking with demographic masking
├── pay/
│   ├── initialize.ts   # POST: Prepares transaction, generates reference
│   └── verify.ts       # POST: Verifies payment against Paystack or test simulator
├── auth/
│   ├── signup.ts       # POST: Registers applicant account in ipe_users
│   ├── login.ts        # POST: Authenticates user and issues session cookie
│   ├── me.ts           # GET: Returns authenticated applicant profile
│   └── logout.ts       # POST: Clears user session cookie
└── admin/
    ├── auth.ts         # GET/POST/DELETE: Admin session authentication
    └── settings.ts     # GET/PUT: Real-time fee rates & contact overrides
```

---

## ⚙️ Core Edge Handlers Specification

### 1. Tracking ID Generation & Submissions (`functions/api/submissions/index.ts`)
- **POST**:
  1. Validates `serviceType` against allowed 5 services.
  2. Validates `identifierCode` (15 alphanumeric for IPE, 11 numeric for NIN).
  3. Resolves current fee dynamically from `ipe_portal_settings` (or default rates).
  4. Generates a distinct tracking ID:
     `TRK-${serviceCode}-${currentYear}-${randomAlphaNum(6)}`
  5. Inserts record into `ipe_submissions` with status `SUBMITTED`.

### 2. Demographic Masking in Public Tracking (`functions/api/track.ts`)
- **GET `?q=...`**:
  Applicants can query by tracking ID or identifier code. To protect privacy while providing proof of progress:
  - Full Name is masked: `Johnathan Doe` ➔ `J*** D**`
  - Phone is masked: `08012345678` ➔ `080****5678`
  - Identifier Code is masked: `12345678901` ➔ `123*****901`
  - Public status badges: `SUBMITTED`, `PROCESSING`, `CLEARED / COMPLETED`, `ACTION_REQUIRED`.

### 3. Admin Workflow Dispatcher (`functions/api/submissions/[id].ts`)
- **PATCH**:
  Enables verification officers to update application progress:
  - `action: "ACCEPT"`: Sets `admin_accepted = true`, `status = "IN_PROGRESS"`.
  - `action: "COMPLETE"`: Attaches `certificate_url`, sets `status = "COMPLETED"`.
  - `action: "REJECT"`: Records `admin_notes`, sets `status = "REJECTED"`.

### 4. Admin Session Authentication (`functions/api/admin/auth.ts`)
- Uses `context.env.ADMIN_EMAIL` and `context.env.ADMIN_PASSWORD` (falling back to secure defaults).
- Issues an `HttpOnly`, `SameSite=Lax` session cookie `identity_admin_session=authenticated_session_valid` with 7-day TTL.

