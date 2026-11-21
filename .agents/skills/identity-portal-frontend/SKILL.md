---
name: identity-portal-frontend
description: >-
  Build, configure, style, and debug the Next.js 14 Static Export frontend for Identity Clearance
  & NIN Validation portals (InstantIPESubmit pattern). Use when working on UI components, form
  validation (15-char IPE, 11-digit NIN), DOB fields, client routing, Suspense wrappers, and static builds.
---

# Identity Portal Frontend Architecture (Next.js 14 Static Export)

The client tier of the Identity Clearance & NIN Verification portal uses Next.js 14 configured for **Static HTML Export** (`output: 'export'`), producing fully prerendered static assets that are hosted on Cloudflare Pages edge global network with 0ms cold starts.

---

## 🏗️ 1. Next.js Static Export Configuration

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

In `public/_redirects`:
Cloudflare Pages uses `_redirects` to route parameterized URLs without server-side SSR:
```text
/pay/:id /pay/?id=:id 301
/success/:id /success/?id=:id 301
```

---

## 📋 2. The 5 Identity Services Form Specification

Each service has rigorous client-side input validation before allowing form progression:

| Service Code | Service Name | Required Input Format | Client Validation Regex |
|---|---|---|---|
| `IPE` | Fresh IPE Clearance | Exactly 15 alphanumeric characters | `/^[A-Z0-9]{15}$/` |
| `MOD_IPE` | Modification IPE Hold | Exactly 15 alphanumeric characters | `/^[A-Z0-9]{15}$/` |
| `VALIDATION` | NIN Validation | Exactly 11 numeric digits | `/^\d{11}$/` |
| `MOD_VALIDATION` | Mod Validation | Exactly 11 numeric digits | `/^\d{11}$/` |
| `MODIFICATION` | NIN Modification | Exactly 11 numeric digits + modification payload | `/^\d{11}$/` |

### Modification Types & Specialized Fields
For `MODIFICATION`, the applicant must select a category:
- **Name Correction**: Fields for Old Full Name and Corrected Full Name.
- **Phone Number Update**: Fields for Old Phone Number and New Phone Number.
- **Date of Birth (DOB)**: Dedicated `oldDob` and `newDob` date pickers.
- **DOB Above 5 Years**: Dedicated `oldDob` and `newDob` date pickers with supplementary affidavit notice.

---

## ⚠️ 3. Critical Prerendering & Build Rules

### Rule A: Suspense Boundary for `useSearchParams`
Next.js static export fails during `next build` if `useSearchParams()` is called outside a `<Suspense>` boundary.
```tsx
// Correct pattern:
export default function PayPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading payment details...</div>}>
      <PayContent />
    </Suspense>
  );
}
```

### Rule B: Safe SSR Dynamic Imports for Browser Libraries
Libraries referencing `window` or `self` (such as `canvas-confetti`) crash static prerendering if imported at top-level.
```tsx
// Correct dynamic import pattern:
const triggerConfetti = async () => {
  const confetti = (await import("canvas-confetti")).default;
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
};
```

### Rule C: Clean Compilation on Windows
Windows file watchers occasionally lock files in `.next/` or `out/`.
```powershell
# Safe build sequence:
if (Test-Path "out") { Remove-Item -Recurse -Force "out" }
npm.cmd run build
```
Verify that `out/` contains `index.html`, `404.html`, `_redirects`, and static folders for all routes.
