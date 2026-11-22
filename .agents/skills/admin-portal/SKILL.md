---
name: admin-portal
description: >-
  Operations, deployment, administration, and troubleshooting runbook for the InstantIPESubmit Admin
  Portal (admin.instantipesubmit.com.ng). Enforces Google Authenticator TOTP 2FA, all 5 identity services
  reception, Cloudflare Pages subdomain routing, direct applicant onboarding, and Supabase synchronization.
---

# InstantIPESubmit Admin Portal Operations & Governance Skill (`admin.instantipesubmit.com.ng`)

This skill provides comprehensive operational guidelines, architectural runbooks, security policies, and incident-response procedures for operating the **InstantIPESubmit Admin Portal** (`admin.instantipesubmit.com.ng`).

---

## 1. System Overview & Dual-Domain Topology

The platform operates under a dual-domain topology hosted on Cloudflare's Global Edge Network, backed by Next.js 14 Static Export and Supabase PostgreSQL.

```
                             Internet Traffic
                                     │
                ┌────────────────────┴────────────────────┐
                ▼                                         ▼
    https://instantipesubmit.com.ng           https://admin.instantipesubmit.com.ng
    (Public Citizen & Agent Portal)           (Dedicated Admin Management)
                │                                         │
                └────────────────────┬────────────────────┘
                                     ▼
                     Cloudflare Pages Edge Middleware
                  • Host header routing & subdomain rewrite
                  • admin.instantipesubmit.com.ng -> /admin/
                  • Static assets delivered via Cloudflare Edge
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
        Next.js 14 Prerendered UI            Cloudflare Pages Functions
        • /admin (Overview Dashboard)        • /api/submissions (Queue)
        • /admin/submissions (Queue)         • /api/admin/auth (2FA TOTP)
        • /admin/new-submission (Direct)     • /api/admin/users (Roster)
        • /admin/users (Registered Users)    • /api/admin/settings (Rates)
        • /admin/settings (2FA & Rates)      • /api/admin/totp-setup (QR)
```

### Domain Endpoints Specification

| FQDN / Path | Purpose | Access Level |
|---|---|---|
| `https://admin.instantipesubmit.com.ng` | Dedicated administration subdomain | Super Admin (TOTP 2FA) |
| `https://instantipesubmit.com.ng/admin` | Alternate admin route on root domain | Super Admin (TOTP 2FA) |
| `https://instantipesubmit.com.ng` | Public citizen submission & payment portal | Public / Applicants |
| `https://admin.instantipesubmit.com.ng/api/*` | Admin-facing proxy to Edge API endpoints | Admin Session Cookie |

---

## 2. Super Administrator Governance & Google Authenticator (TOTP) Security

### 2.1 The Protected Super Administrator Identity
* **Primary Email:** `Iniobongunyime34@gmail.com` (Fallback alias: `admin@instantipesubmit.com.ng`)
* **Authority:** Full read/write access to all 5 services, fee overrides, applicant acceptance, slip attachments, and user account management.

### 2.2 Google Authenticator 2-Factor Authentication (RFC 6238 TOTP)
All administrative logins strictly enforce 2-Factor Authentication via rotating 6-digit Time-Based One-Time Passwords:
* **Secret Key:** Stored in `ADMIN_TOTP_SECRET` (default: `INSTANTIPE2026ADMINSECRET`).
* **Authenticator Compatibility:** Google Authenticator, Authy, Microsoft Authenticator, 1Password.
* **OTPAuth URI:** `otpauth://totp/InstantIPESubmit:Iniobongunyime34@gmail.com?secret=INSTANTIPE2026ADMINSECRET&issuer=InstantIPESubmit&algorithm=SHA1&digits=6&period=30`
* **Emergency Master Code:** `202699` (allows recovery in case of device replacement or clock drift).

---

## 3. Real-Time Reception of All 5 Services

Every submission created on the main portal (`instantipesubmit.com.ng`) instantly appears in the Admin Portal across all 5 standardized service queues:

| # | Service Name | Code | Input Requirement | Default Rate |
|---|---|---|---|---|
| **1** | **IPE Clearance** | `IPE` | 15 alphanumeric characters | ₦1,000 |
| **2** | **Mod IPE** | `MOD_IPE` | 15 alphanumeric characters | ₦2,500 |
| **3** | **NIN Validation** | `VALIDATION` | 11 numeric digits | ₦1,500 |
| **4** | **Mod Validation** | `MOD_VALIDATION` | 11 numeric digits | ₦1,500 |
| **5** | **NIN Modification** | `MODIFICATION` | 11 numeric digits | ₦2,500 |

### Inspection & Action Capabilities:
1. **Accept Submission:** Moves application from `PAID_PENDING_ACCEPTANCE` to `IN_PROGRESS`.
2. **Attach Slip / Complete:** Uploads or links clearance slip URL, sets status to `COMPLETED`.
3. **Reject Submission:** Records official officer rejection notes, sets status to `REJECTED`.
4. **Export CSV:** Exports complete submission queues with full demographic and payment audit trails.

---

## 4. Cloudflare DNS Configuration for `admin.instantipesubmit.com.ng`

To route the subdomain `admin.instantipesubmit.com.ng` directly to the admin interface:

1. **In Cloudflare DNS Management**:
   Add a CNAME record:
   * **Type**: `CNAME`
   * **Name**: `admin`
   * **Target**: `ipe-client-portal.pages.dev`
   * **Proxy Status**: `Proxied (Orange Cloud)`

2. **In Cloudflare Pages Project (`ipe-client-portal`)**:
   Under **Custom domains**:
   * Click **Set up a custom domain** ➔ Enter `admin.instantipesubmit.com.ng`.
   * Cloudflare automatically provisions the SSL/TLS certificate and edge routing.

