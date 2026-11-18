# InstantIPESubmit (`instantipesubmit.com.ng`)

A full-stack, enterprise-grade Next.js web application for managing identity clearances, exception holds, and national identity number (NIN) verification & modification submissions on **instantipesubmit.com.ng**.

Includes a **public submission & tracking portal** with integrated payment gateway (Paystack & instant simulation) and a **custom admin backoffice** where administrators review, accept, and process applications after payment confirmation.

---

## 🚀 The 5 Supported Identity Services & Agent Pricing

| # | Service Name | Code | Input Requirement | Agent Fee | Scope / Description |
|---|---|---|---|---|---|
| **1** | **IPE Clearance** | `IPE` | **15 alphanumeric characters** | **₦1,000** | Fresh enrollment exception resolution |
| **2** | **Mod IPE** | `MOD_IPE` | **15 alphanumeric characters** | **₦2,500** | Exception holds triggered during modifications |
| **3** | **NIN Validation** | `VALIDATION` | **11 numeric digits** | **₦1,500** | Central NIN verification & KYC record sync |
| **4** | **Mod Validation** | `MOD_VALIDATION` | **11 numeric digits** | **₦1,500** | Validation & synchronization after modification |
| **5** | **NIN Modification** | `MODIFICATION` | **11 numeric digits** | **₦2,500** | Data corrections *(Name, Phone, Date of Birth, DOB above 5 years)* |

---

## 🌐 Custom Domain Setup (`instantipesubmit.com.ng`)

To link **`instantipesubmit.com.ng`** to your Cloudflare Pages portal:

### In Cloudflare Pages Dashboard:
1. Go to your Pages project: **`ipe-client-portal`**
2. Click the **Custom domains** tab.
3. Click **Set up a custom domain**.
4. Enter **`instantipesubmit.com.ng`** (and optionally **`www.instantipesubmit.com.ng`**).
5. Click **Continue**.

### In your Domain Registrar DNS (where you registered `.com.ng`):
If your DNS is managed at your domain registrar (e.g., Whogohost, Upperlink, Web4Africa, Truehost, etc.):
- Add a **CNAME record**:
  - **Type**: `CNAME`
  - **Name / Host**: `@` (or `instantipesubmit.com.ng`)
  - **Target / Value**: `ipe-client-portal.pages.dev`
- For the `www` subdomain:
  - **Type**: `CNAME`
  - **Name / Host**: `www`
  - **Target / Value**: `ipe-client-portal.pages.dev`

Cloudflare will automatically issue and provision a free **SSL / TLS Certificate** for `https://instantipesubmit.com.ng`.

---

## 🔐 Custom Admin Backoffice (`/admin`)

- **Login Credentials**:
  - URL: `/admin/login`
  - Email: `admin@instantipesubmit.com.ng`
  - Password: `Admin@2026Password!`
- **Dashboard**: High-priority overview of submissions awaiting acceptance, active processing queue, revenue, and breakdown across all 5 services.
- **Submissions Management**: Search, filter by service/status, review details, add internal notes, assign clearance certificates, and **Export to CSV**.
- **Settings & Live Pricing**: Configure rates for all 5 services and manage Paystack API keys.

---

## 🏁 Running Locally

```powershell
cd C:\Users\REG\.gemini\antigravity\scratch\identity_services_portal
npm run dev
```

Visit:
- Public Portal: `http://localhost:3000`
- Submit Service: `http://localhost:3000/submit`
- Track Status: `http://localhost:3000/track`
- Admin Portal: `http://localhost:3000/admin`
