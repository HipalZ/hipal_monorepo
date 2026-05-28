# WhatsApp Sandbox API — Technical Reference v1

> Trigger your approved WhatsApp templates from your own backend with a single HTTP call.
> Multi-tenant, key-authenticated, self-describing.

| Field | Value |
|---|---|
| **Base URL (staging)** | `https://api.test.hipalz.com` |
| **Base URL (production)** | `https://api.hipalz.com` |
| **Path prefix** | `/whatsapp/sandbox` |
| **Content type** | `application/json` |
| **Auth scheme** | `Authorization: Bearer sk_...` |
| **Version** | v1 |

---

## 1. Getting started

1. Your hipalz account manager provisions an API key by calling `POST /whatsapp/sandbox/keys` with your `businessId`. The plaintext key is shared with you **once** over a secure channel.
2. Store the key in your server-side secret manager (`HIPAL_API_KEY` env var, vault, etc.). **Never commit it. Never expose it in browser code.**
3. Call `GET /whatsapp/sandbox/templates` to discover which templates are approved for you, and what variable names each expects.
4. Call `POST /whatsapp/sandbox/send` to dispatch a message. The response contains a `deliveryId` you can poll via `GET /whatsapp/sandbox/messages/:deliveryId`.

---

## 2. Endpoints

### 2.1 `POST /whatsapp/sandbox/keys` — *(internal, ops only)*
Mints a new API key for a business. Returns the plaintext key exactly once.

> **Auth:** requires a hipalz admin JWT (`Authorization: Bearer <jwt>`) plus the `HIPAL_ADMIN` role. Customer keys (`sk_...`) cannot mint other keys.

**Request body**
```json
{
  "businessId": "66a25e423318398937eb87f9",
  "label": "Book My Hostels — production backend",
  "scopes": ["send", "templates:read"]
}
```

**Response — 201**
```json
{
  "err": false,
  "message": "API key created. Copy the `key` value now — it will not be shown again.",
  "data": {
    "apiKeyId": "65f9a3...",
    "key": "sk_A3f9B2c1D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3F4a5",
    "prefix": "sk_A3f9B2c1",
    "label": "Book My Hostels — production backend",
    "scopes": ["send", "templates:read"],
    "businessId": "66a25e423318398937eb87f9",
    "createdAt": "2026-05-14T09:12:34.000Z"
  }
}
```

> Copy the value of `data.key`. It is never returned again. If lost, revoke and re-issue.

### 2.2 `GET /whatsapp/sandbox/keys?businessId=...` — *(internal, ops only)*
Lists keys issued for a business. **Never** returns `keyHash` or anything from which the plaintext is derivable — only `{ apiKeyId, prefix, label, scopes, isRevoked, lastUsedAt, revokedAt, date }`.

> **Auth:** hipalz admin JWT + `HIPAL_ADMIN` role.

### 2.2.1 `POST /whatsapp/sandbox/keys/:apiKeyId/revoke` — *(internal)*
Soft-revokes a key. Idempotent. After revocation every authenticated call from this key returns `401`.

> **Auth:** hipalz admin JWT + `HIPAL_ADMIN` role.

---

### 2.3 `GET /whatsapp/sandbox/templates`
Returns the approved WhatsApp templates available to the business that owns the calling key. **This endpoint is your live contract** — the variable names you must send for each template come from each row's `bodyVariableSequence`.

**Headers**
```
Authorization: Bearer sk_...
```

**Response — 200**
```json
{
  "err": false,
  "message": "Templates fetched",
  "data": [
    {
      "_id": "65a1...",
      "templateName": "payment_confirm",
      "templateId": 4531830567045604,
      "languageCode": "en_GB",
      "category": "UTILITY",
      "bodyVariableSequence": [
        "name", "confirmationId", "transactionDate", "amount",
        "paymentMethod", "hostelName", "checkinDate", "checkoutDate"
      ],
      "headerVariableSequence": [],
      "footerVariableSequence": []
    }
  ]
}
```

---

### 2.4 `POST /whatsapp/sandbox/send`
Send one templated WhatsApp message. The server matches your `variables` keys against the template's `bodyVariableSequence`, builds the positional array Meta expects, and dispatches.

**Headers**
| Name | Required | Description |
|---|---|---|
| `Authorization` | ✅ | `Bearer sk_...` |
| `Content-Type` | ✅ | `application/json` |
| `Idempotency-Key` | optional | Any unique string per send. Retries with the same key return the original delivery without re-sending. |

**Request body**
| Field | Type | Required | Description |
|---|---|---|---|
| `templateName` | string | ✅ | Exact `templateName` from `/templates` (e.g. `"payment_confirm"`). |
| `to` | string | ✅ | Recipient phone in E.164 format (`+919876543210`). |
| `language` | string | optional | Defaults to the template's `languageCode` (e.g. `"en_GB"`). |
| `variables` | object | ✅ | Map of variable names → string values. Keys must match `bodyVariableSequence` exactly. |
| `referenceId` | string | optional | Your own correlation id (e.g. Razorpay `pay_xxx`). Echoed on every response and stored for audit. |

**Example — payment confirmation**
```bash
curl -X POST https://api.test.hipalz.com/whatsapp/sandbox/send \
  -H "Authorization: Bearer sk_A3f9B2c1..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: bmh-pay-PLEEcIIHk3HZOj" \
  -d '{
    "templateName": "payment_confirm",
    "to": "+919876543210",
    "variables": {
      "name": "Ravi Kumar",
      "confirmationId": "BMH-2024-7891",
      "transactionDate": "14 Nov 2024",
      "amount": "₹5,000",
      "paymentMethod": "UPI",
      "hostelName": "Book My Hostels - Hyderabad",
      "checkinDate": "20 Nov 2024",
      "checkoutDate": "22 Nov 2024"
    },
    "referenceId": "razorpay_pay_PLEEcIIHk3HZOj"
  }'
```

**Success — 200**
```json
{
  "err": false,
  "message": "Message dispatched",
  "data": {
    "deliveryId": "67361f49929d6b95d0f18165",
    "status": "SENT",
    "metaMessageId": "wamid.HBgMOTE5ODc2NTQzMjEwFQIAERgSMEUz..."
  }
}
```

**Error matrix**

| HTTP | `err` | Meaning | What to do |
|---|---|---|---|
| `400` | `true` | Missing or non-string variables. Response contains `missing[]` and `invalid[]`. | Fix payload, retry. |
| `401` | `true` | API key invalid / revoked / missing. | Check header, request a new key if needed. |
| `403` | `true` | Key lacks `send` scope. | Request scope upgrade. |
| `404` | `true` | Template not found for your business. | Re-check `templateName` against `/templates`. |
| `422` | `true` | Business not configured for WhatsApp (no WABA). | Contact hipalz support. |
| `429` | `true` | Rate limit hit (60 req/s per key). | Honor `Retry-After`, back off. |
| `502` | `true` | Upstream (Meta) error. `data.errorReason` + `data.errorDescription` included. | Retry with same `Idempotency-Key`. |

**Example — missing variables**
```json
{
  "err": true,
  "message": "Missing required variables for template 'payment_confirm'",
  "missing": ["amount", "paymentMethod"],
  "invalid": [],
  "required": [
    "name", "confirmationId", "transactionDate", "amount",
    "paymentMethod", "hostelName", "checkinDate", "checkoutDate"
  ]
}
```

---

### 2.5 `GET /whatsapp/sandbox/messages/:deliveryId`
Returns the current status of a previously-sent delivery. Scoped to the calling business.

**Headers**
```
Authorization: Bearer sk_...
```

**Response — 200**
```json
{
  "err": false,
  "message": "Delivery fetched",
  "data": {
    "deliveryId": "67361f49929d6b95d0f18165",
    "templateName": "payment_confirm",
    "to": "+919876543210",
    "status": "SENT",
    "metaMessageId": "wamid.HBgM...",
    "referenceId": "razorpay_pay_PLEEcIIHk3HZOj",
    "errorReason": null,
    "errorDescription": null,
    "durationMs": 342,
    "date": 1731600201861
  }
}
```

Returns `404` if the delivery doesn't exist *or* doesn't belong to your business (no cross-tenant existence disclosure).

---

## 3. Conventions

### 3.1 Authentication
- Single static key per integration. No OAuth, no refresh tokens.
- Key format: `sk_` + 43 base64url characters (≈ 256 bits of entropy).
- Server stores SHA-256 hash + first 11 chars (prefix) only. Plaintext is unrecoverable.
- Bearer scheme in `Authorization` header. Query-string keys are not supported.
- Failed auth attempts are logged with prefix, IP, user-agent. Brute-force or scraping patterns trigger alerts. Repeated failures from one source may result in a temporary block.

**Key-admin endpoints** (`POST /keys`, `GET /keys`, `POST /keys/:id/revoke`) are not customer-facing. They require a hipalz **dashboard JWT** with the `HIPAL_ADMIN` role. Customer `sk_` keys cannot create, list, or revoke other keys.

### 3.2 Tenancy
- `businessId` is **derived from the key**, never accepted in the request body.
- Every delivery row, template lookup, and status query is filtered by `businessId` server-side. There is no way for one business's key to touch another business's data.

### 3.3 Variable contract
- Templates store variable names in `bodyVariableSequence`, in `{{1}}, {{2}}, ...` order. The same names appear in `components[0].example.body_text[0]` on Meta's side.
- Your `variables` payload **must use those exact names**. Casing matters: `checkinDate` ≠ `checkInDate`.
- Extra keys in `variables` that aren't in the sequence are ignored (forward compatibility — safe to send "future" fields).
- All values must be strings. Coerce numbers, dates, currencies on your side before sending.

### 3.4 Idempotency
- Send the same `Idempotency-Key` header on a retry → you get the original delivery row back, no second WhatsApp message.
- Recommended: derive the key from your own primary key (e.g. `bmh-pay-{razorpayPaymentId}`).
- Idempotency rows are unique per business; collisions across businesses are not possible.

### 3.5 Rate limits
- `60 req/sec` per key, burst `100`. Above that → `429` with `Retry-After`.
- WhatsApp-side Meta rate limits also apply (per business phone number); when those trigger you'll see `502` with `errorReason: "Rate limit hit"`.

### 3.6 Observability
- Every call writes a row in `whatsAppApiDelivery` with: `templateName`, `to`, full `variables`, translated `positional`, `metaMessageId`, status, error, duration, your `referenceId`, your `Idempotency-Key`.
- Hipalz support can resolve any delivery by `deliveryId`, `metaMessageId`, or `referenceId` — please include one when contacting support.

---

## 4. Integration recipes

### 4.1 Node.js (any business)
```ts
async function sendTemplate(opts: {
  templateName: string;
  to: string;
  variables: Record<string, string>;
  referenceId?: string;
}) {
  const res = await fetch(
    "https://api.test.hipalz.com/whatsapp/sandbox/send",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HIPAL_API_KEY}`,
        "Content-Type": "application/json",
        ...(opts.referenceId
          ? { "Idempotency-Key": opts.referenceId }
          : {}),
      },
      body: JSON.stringify(opts),
    },
  );
  const json = await res.json();
  if (!res.ok || json.err) {
    throw new Error(
      `hipalz send failed: ${json.message} ${JSON.stringify(json)}`,
    );
  }
  return json.data;
}
```

### 4.2 Book My Hostels — after Razorpay payment success
```ts
await sendTemplate({
  templateName: "payment_confirm",
  to: customer.phone,
  variables: {
    name: customer.fullName,
    confirmationId: booking.code,
    transactionDate: formatDate(razorpay.captured_at),
    amount: formatINR(razorpay.amount / 100),
    paymentMethod: razorpay.method.toUpperCase(),
    hostelName: hostel.name,
    checkinDate: formatDate(booking.checkIn),
    checkoutDate: formatDate(booking.checkOut),
  },
  referenceId: `bmh-pay-${razorpay.id}`,
});

await sendTemplate({
  templateName: "book_confirmation",
  to: customer.phone,
  variables: {
    name: customer.fullName,
    hostelName: hostel.name,
    confirmationId: booking.code,
    checkinDate: formatDate(booking.checkIn),
    checkinTime: booking.checkInTime,
    checkoutDate: formatDate(booking.checkOut),
    checkoutTime: booking.checkOutTime,
    roomType: booking.roomType,
    guestCount: String(booking.guests),
    paymentStatus: "Successful",
    inclusions: hostel.inclusions.join(", "),
    mapsLink: hostel.mapsUrl,
    contactInfo: hostel.contactNumber,
  },
  referenceId: `bmh-book-${booking.id}`,
});
```

---

## 5. Operational details

- **Data retention** — variable payloads kept 90 days, metadata (status, error, ids) kept 12 months.
- **Failure handling** — every send writes a row before calling Meta. A failed Meta call leaves the row as `FAILED` with the upstream error preserved. Retries are safe via `Idempotency-Key`.
- **Wallet** — each successful send debits the business's WhatsApp wallet per the existing UTILITY / MARKETING pricing. Sending while the wallet is empty returns `422`.
- **Approved templates only** — templates whose Meta status is not `APPROVED` cannot be sent. Submit through the hipalz dashboard and wait for Meta approval.

---

## 6. Quick checklist before going live

- [ ] API key stored server-side; never in client / mobile bundles.
- [ ] `Idempotency-Key` set on every send.
- [ ] `referenceId` carries your own primary key (booking id, payment id, etc.).
- [ ] Phone numbers normalized to E.164 (`+91...`).
- [ ] All `variables` values are strings.
- [ ] Calling `GET /templates` is part of your CI / staging warm-up — catches template renames before they hit production.

---

*Support: support@hipalz.com · Status: status.hipalz.com · API base: `api.hipalz.com`*
