---
name: identity-portal-paystack
description: >-
  Integrate, test, verify, and debug Paystack payment gateway workflows for Identity Clearance & NIN
  Validation portals. Use when working on payment initialization, Kobo currency conversion, reference
  generation, test mode fallback simulation, and webhook/callback handling.
---

# Paystack Payment Gateway Integration

The identity portal integrates with **Paystack** for handling online card payments, bank transfers, and USSD in Nigerian Naira (₦).

---

## 🔄 Payment Lifecycle Architecture

```
Applicant Clicks "Pay"
       │
       ▼
1. POST /api/pay/initialize
   - Fetches submission & current fee
   - Generates reference: PAY-TRK-TIMESTAMP
   - Computes Kobo: amount * 100
   - Returns public key & transaction config
       │
       ▼
2. Paystack Inline Pop (Client-side Modal)
   - Applicant enters card / bank transfer
   - Completes payment via OTP
       │
       ▼
3. POST /api/pay/verify
   - Server verifies reference against Paystack REST API
   - Updates submission: paymentStatus = "PAID", status = "PAID_PENDING_ACCEPTANCE"
       │
       ▼
4. Redirect to /success/?id=TRACKING_ID
   - Displays proof of payment, service receipt, and tracking link
```

---

## 💻 Edge Handlers Implementation

### Transaction Initialization (`functions/api/pay/initialize.ts`)
```typescript
const amountInKobo = submission.amount * 100;
const reference = `PAY-${submission.trackingId}-${Date.now()}`;
```

### Server-Side Verification (`functions/api/pay/verify.ts`)
1. Checks if secret key is present:
   ```typescript
   if (!simulated && secretKey && !secretKey.includes("sample_secret")) {
     const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
       headers: { Authorization: `Bearer ${secretKey}` },
     });
     const verifyData = await verifyRes.json();
     if (verifyData.status && verifyData.data.status === "success") {
       paymentVerified = true;
     }
   }
   ```
2. **Instant Test Simulation**:
   If running in staging or with demo credentials (`testMode: true`), verification succeeds gracefully to allow seamless end-to-end sandbox testing.

---

## ⚙️ Paystack Dashboard Configuration

When switching to production:
1. Log into [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer).
2. Switch toggle to **Live Mode**.
3. Copy **Live Secret Key** (`sk_live_...`) and **Live Public Key** (`pk_live_...`) to Cloudflare Pages Environment Variables.
4. Set URLs:
   - **Callback URL**: `https://instantipesubmit.com.ng/success/`
   - **Webhook URL**: `https://instantipesubmit.com.ng/api/pay/verify`

