# Identity Services Portal (IPE, Mod IPE, Validation, Mod Validation & Modification)

A full-stack, enterprise-grade Next.js web application for managing identity clearances, exception holds, and national identity number (NIN) verification & modification submissions.

Includes a **public submission & tracking portal** with integrated payment gateway (Paystack & instant simulation) and a **custom admin backoffice** where administrators review, accept, and process applications after payment confirmation.

---

## 🚀 The 5 Supported Identity Services

| # | Service Name | Code | Input Requirement | Purpose |
|---|---|---|---|---|
| **1** | **IPE Clearance** | `IPE` | **15 alphanumeric characters** | Fresh enrollment exception resolution |
| **2** | **Mod IPE** | `MOD_IPE` | **15 alphanumeric characters** | Exception holds triggered during profile modifications |
| **3** | **NIN Validation** | `VALIDATION` | **11 numeric digits** | Central NIN verification & KYC record sync |
| **4** | **Mod Validation** | `MOD_VALIDATION` | **11 numeric digits** | Validation & synchronization after profile modification |
| **5** | **NIN Modification** | `MODIFICATION` | **11 numeric digits** + Target Field | Data corrections *(Name, Date of Birth, Phone, Address, etc.)* |

---

## ☁️ Step-by-Step Cloudflare Hosting Guide

### Step 1: Deploy on Cloudflare Pages (Free & Global Edge)

1. Log into your **[Cloudflare Dashboard](https://dash.cloudflare.com/)**.
2. Go to **Workers & Pages** ➔ Click **Create application** ➔ Select the **Pages** tab.
3. Click **Connect to Git** and choose your repository: **`OFONITEX/IPE-client-portal`**.
4. Configure the **Build Settings**:
   * **Framework preset**: `Next.js`
   * **Build command**: `npx @cloudflare/next-on-pages`
   * **Build output directory**: `.vercel/output/static`
   * **Root directory**: `/`
5. In **Environment variables (Advanced)**, add:
   * `NODE_VERSION`: `20`
   * `NEXT_PUBLIC_APP_URL`: `https://your-custom-domain.com` *(or your default `*.pages.dev` URL)*
   * `ADMIN_EMAIL`: `admin@identityhub.ng`
   * `ADMIN_PASSWORD`: `Admin@2026Password!`
   * `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: `pk_test_sample_key_identity_portal`
   * `PAYSTACK_SECRET_KEY`: `sk_test_sample_secret_identity_portal`
6. In **Settings > Functions > Compatibility Flags**, ensure:
   * **Compatibility flag**: `nodejs_compat`
   * **Compatibility date**: `2024-09-23` (or latest)
7. Click **Save and Deploy**. Cloudflare will build your site across 300+ global data centers and give you a free live URL (e.g. `ipe-client-portal.pages.dev`).

---

### Step 2: Connecting a Custom Domain Bought on Another Platform

If you purchase your domain from **Namecheap, GoDaddy, Whogohost, Porkbun, Squarespace**, etc., you have two easy ways to attach it:

#### Method A: Direct CNAME Setup (Quickest)
1. In Cloudflare Pages, go to your project (`ipe-client-portal`) ➔ Click the **Custom domains** tab.
2. Click **Set up a custom domain**.
3. Type your domain (e.g. `portal.yourdomain.com` or `yourdomain.com`).
4. Cloudflare will give you a CNAME target: `ipe-client-portal.pages.dev`.
5. Go to your domain provider's DNS management console and add:
   * **Type**: `CNAME`
   * **Host / Name**: `@` (or `portal` for subdomain)
   * **Value / Target**: `ipe-client-portal.pages.dev`
   * **TTL**: Automatic (or 3600)
6. Cloudflare automatically generates and provisions a free **SSL Certificate**.

#### Method B: Full Cloudflare DNS (Best Performance & DDoS Protection)
1. In Cloudflare, click **Add Site** in the top navigation and enter your domain name.
2. Select the **Free plan**.
3. Cloudflare will scan your existing records and provide two Cloudflare Nameservers (e.g. `ns1.cloudflare.com`, `ns2.cloudflare.com`).
4. Log into where you bought your domain ➔ Find **Nameservers / DNS Settings** ➔ Change from "Default Nameservers" to **Custom Nameservers** and paste the Cloudflare ones.
5. In your Cloudflare Pages project, click **Custom domains** ➔ Enter your domain. It will activate with 1 click!

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
