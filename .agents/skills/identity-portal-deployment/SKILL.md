---
name: identity-portal-deployment
description: >-
  Build, deploy, and manage production deployments of Identity Clearance & NIN Verification portals
  to Cloudflare Pages with custom domains (e.g. instantipesubmit.com.ng). Use when configuring wrangler.toml,
  GitHub CI/CD, DNS CNAME records, SSL/TLS, and Cloudflare Pages environment secrets.
---

# Cloudflare Pages & Custom Domain Deployment Guide

This skill covers deploying the Identity Services Portal to **Cloudflare Pages** and routing the custom Nigerian domain (`instantipesubmit.com.ng`).

---

## ⚙️ Cloudflare Pages Configuration

In `wrangler.toml`:
```toml
name = "ipe-client-portal"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "out"
```

---

## 🚀 Deployment Methods

### Option 1: Automated GitHub Integration (Recommended)
1. In Cloudflare Dashboard ➔ **Workers & Pages** ➔ **Create application** ➔ **Pages** ➔ **Connect to Git**.
2. Select your repository: `OFONITEX/IPE-client-portal`.
3. Set Build Configuration:
   - **Framework Preset**: `None`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `out`
   - **Root Directory**: `/`
4. Deploy! Subsequent pushes to `main` build and deploy automatically.

### Option 2: Direct CLI Deployment via Wrangler
Run in your local terminal outside the sandbox:
```powershell
# 1. Clean previous builds
if (Test-Path "out") { Remove-Item -Recurse -Force "out" }

# 2. Compile static export
npm.cmd run build

# 3. Deploy to Cloudflare Pages
npx.cmd wrangler login
npx.cmd wrangler pages deploy out --project-name=ipe-client-portal --branch=main --commit-dirty=true
```

---

## 🔐 Environment Variables & Secrets Checklist

In Cloudflare Dashboard: **ipe-client-portal** ➔ **Settings** ➔ **Environment variables**:

| Key | Description | Example / Note |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Canonical portal URL | `https://instantipesubmit.com.ng` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://bqgjucjnoezlwahupsbd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | **Encrypt as Secret** |
| `ADMIN_EMAIL` | Admin login email | `admin@instantipesubmit.com.ng` |
| `ADMIN_PASSWORD` | Admin password | **Encrypt as Secret** |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key | `pk_live_...` or `pk_test_...` |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | **Encrypt as Secret** |

---

## 🌐 Custom Domain & DNS Mapping (`instantipesubmit.com.ng`)

1. In Cloudflare Pages project ➔ **Custom domains** tab:
   - Click **Set up a custom domain** ➔ Enter `instantipesubmit.com.ng`.
   - Click **Set up a custom domain** ➔ Enter `www.instantipesubmit.com.ng`.
2. At your domain registrar (e.g. Whogohost, Truehost, QServers, Upperlink):
   - Add `CNAME` for `@` pointing to `ipe-client-portal.pages.dev`.
   - Add `CNAME` for `www` pointing to `ipe-client-portal.pages.dev`.
3. Cloudflare will automatically provision and renew edge SSL/TLS certificates.
