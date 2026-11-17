# Identity Services Portal (IPE, Mod IPE, Validation, Mod Validation & Modification)

A full-stack, enterprise-grade Next.js web application for managing identity clearances, exception holds, and national identity number (NIN) verification & modification submissions.

Includes a **public submission & tracking portal** with integrated payment gateway (Paystack & instant simulation) and a **custom admin backoffice** where administrators review, accept, and process applications after payment confirmation.

---

## 🚀 The 5 Supported Identity Services

### 1. IPE Clearance (`IPE`)
- Accepts exact **15 alphanumeric characters** (mix of letters `A-Z` and digits `0-9`).
- Used for fresh enrollment exception resolution.
- Real-time character counter (`0 / 15`), uppercase formatting, and regex validation.

### 2. Mod IPE (`MOD_IPE`)
- Accepts exact **15 alphanumeric characters** (mix of letters `A-Z` and digits `0-9`).
- Used when a profile modification experiences an exception hold.
- Real-time length indicator (`0 / 15`) and format check.

### 3. NIN Validation (`VALIDATION`)
- Accepts exact **11 numeric digits** (National Identification Number).
- Used for validating and syncing active NIN records across banking, telecom, and passport systems.

### 4. Mod Validation (`MOD_VALIDATION`)
- Accepts exact **11 numeric digits** (National Identification Number).
- Used to validate and synchronize an existing NIN after profile modifications (name, DOB, address) have been approved.

### 5. NIN Modification (`MODIFICATION`)
- Accepts exact **11 numeric digits** (National Identification Number) + selectable modification field:
  - *Name Correction (First, Middle, or Surname)*
  - *Date of Birth Correction*
  - *Phone Number Update*
  - *Residential Address Update*
  - *State & LGA of Origin Correction*
  - *Multiple Fields Modification*

---

## 💳 Payment Gateway & Workflow

1. **Submission**: Applicant enters their details and the validated 15-char code or 11-digit NIN.
2. **Secure Payment**:
   - **Paystack Checkout**: Collects payment via Nigerian bank cards, direct bank transfer, USSD, and QR code.
   - **Instant Demo Simulation**: Built-in test checkout mode to test and verify the entire payment-to-acceptance workflow without needing live bank cards.
3. **Admin Acceptance**:
   - As soon as payment is confirmed, the submission transitions to **"Paid • Pending Acceptance"** and alerts the admin.
   - Admin reviews the submission in the **Admin Portal** and clicks **"Accept Submission"** to route it to the active clearinghouse queue.
4. **Real-time Tracking**:
   - Applicants can track progress at `/track` using their Tracking ID or 11-digit NIN.
   - Downloadable & printable official payment receipt and clearance slip upon completion.

---

## 🔐 Custom Admin Backoffice (`/admin`)

- **Login Credentials**:
  - URL: `/admin/login`
  - Email: `admin@identityhub.ng`
  - Password: `Admin@2026Password!`
- **Dashboard**: High-priority overview of submissions awaiting acceptance, active processing queue, revenue, and breakdown across all 5 services.
- **Submissions Management**: Search, filter by service/status, review details, add internal notes, assign clearance certificates, and **Export to CSV**.
- **Settings & Live Pricing**: Configure rates for all 5 services and manage Paystack API keys.

---

## 🏁 Getting Started

```powershell
cd C:\Users\REG\.gemini\antigravity\scratch\identity_services_portal
npm run dev
```

Visit:
- Public Portal: `http://localhost:3000`
- Submit Service: `http://localhost:3000/submit`
- Track Status: `http://localhost:3000/track`
- Admin Portal: `http://localhost:3000/admin`
