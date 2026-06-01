# PRD — WhatsApp Template Send API (Sandbox)

| Field | Value |
|---|---|
| **Status** | Draft v1 |
| **Owner** | Platform team |
| **Last updated** | 2026-05-14 |
| **Target release** | TBD |
| **Reviewers** | Backend lead, Frontend lead, Security, Customer Success |

---

## 1. Background

We already let businesses approve WhatsApp templates against their own WABA through the hibiz dashboard. Every approved template is stored in `WhatAppTemplate` with a `bodyVariableSequence` that lists the variable names in `{{1}}, {{2}}, ...` order (e.g. `["name", "confirmationId", "amount", ...]`).

Today, the only way to actually *send* a templated message is from inside our own UI (campaigns + bulk send). External systems owned by our customers — e.g. **Book My Hostels** sending a "payment confirmed" message right after Razorpay success — have no programmatic way in.

We need a **public, multi-tenant API** that any onboarded business can call from their own backend to trigger their approved templates with their own data.

## 2. Problem statement

> A business that has approved templates in our platform cannot trigger those templates from their own backend. Today they either embed our UI flows or send manual messages, which doesn't scale and prevents real-time transactional notifications.

## 3. Goals

1. **One public endpoint** — `POST /api/v1/whatsapp/send` — usable by every business with no per-tenant code.
2. **Self-describing contract** — clients can read the list of their templates and learn the exact variable names they must send. No external docs go stale when a template changes.
3. **Boring, key-based auth** — `Authorization: Bearer <api-key>` resolves to a `businessId`. Industry standard.
4. **Test mode from day one** — separate `sk_test_*` keys that validate the request but do not actually call Meta. Mock delivery IDs returned.
5. **Audit-friendly** — every call logs `who, what template, what variables, what response` so customers and we can debug independently.

## 4. Non-goals (v1)

- Free-form (non-template) WhatsApp messages.
- Inbound message webhooks routed to customer URLs (we already handle inbound).
- Per-tenant deployments / "private sandbox per business" — explicitly rejected as wasteful.
- Bulk send via this endpoint (>1 recipient per call). Keep v1 single-recipient; bulk is a v2 endpoint.
- Pricing / metering changes. Wallet still gets debited by the existing template-send pipeline.

## 5. Personas

| Persona | Need |
|---|---|
| **Customer's backend dev** (e.g. BMH engineer) | Wants a stable HTTP endpoint, clear docs, predictable errors, test keys. |
| **Customer's ops user** | Wants to generate / revoke keys, see what was sent and to whom, debug failures. |
| **hibiz dashboard user (business owner)** | Wants to feel confident their key is safe and they can shut it off if leaked. |
| **hibiz support engineer** | Wants to look up "did template X for business Y send at time T?" |

## 6. User stories

- **US-1** As a customer backend, I can POST a JSON payload with my API key and have a WhatsApp template message delivered to a phone number.
- **US-2** As a customer backend, I can call `GET /templates` to discover which templates are available and what variable names each one expects.
- **US-3** As a customer backend, I can set a `referenceId` on each send and later query `GET /messages/:deliveryId` to see status, even after a server restart.
- **US-4** As a business owner, I can generate a new API key (live or test) from the hibiz dashboard, copy it once, see only the prefix afterward, and revoke it at any time.
- **US-5** As a business owner, I can browse a log of recent API calls to my business — when, which template, success/fail, error reason.
- **US-6** As a customer backend, when I send the wrong variable names, I get a 400 with a list of `missing` keys so I can fix my code without asking support.

## 7. Functional requirements

### FR-1 — API key authentication
- Keys are randomly generated, 32 bytes, base64url-encoded.
- Stored on the server only as `bcrypt(key)`. The plaintext is shown to the user **once** at creation.
- A 12-character `prefix` (e.g. `sk_live_a3f9b2c1`) is stored separately for UI display and log correlation.
- Two modes: `live` and `test`. Same code path; `test` short-circuits before the actual Meta call.
- Revocation flips `isRevoked = true`; revoked keys 401 within one request.
- `lastUsedAt` updated on every authenticated call (best-effort, not transactional).

### FR-2 — Template resolution
- Endpoint accepts `templateName`, not `templateId`. Names are stable, Meta IDs can rotate.
- Server runs `WhatAppTemplate.findOne({ businessId, templateName, isDeleted: false })`.
- If template is not `APPROVED` by Meta, return `422 Unprocessable Entity`.
- 404 if template doesn't exist for this business (don't leak existence cross-tenant).

### FR-3 — Named-to-positional translator
- Server reads `bodyVariableSequence` (and `headerVariableSequence`, `footerVariableSequence` where applicable).
- For each name in the sequence, plucks `variables[name]`.
- Missing names → 400 with `{ missing: ["amount", "paymentMethod"] }`.
- Extra names in `variables` that aren't in any sequence → ignored (forward compatibility).
- All values must be strings; numbers/nulls → 400 with `{ invalid: ["amount"] }`.

### FR-4 — Send pipeline reuse
- Translator hands off to the **existing** internal template sender that the campaign flow uses. **No fork.** Same wallet debit logic, same Meta retry/error handling.

### FR-5 — Delivery log
- Every authenticated call writes a `whatsAppApiDelivery` row before the Meta call.
- Row mutated to `SENT` / `FAILED` after Meta responds, recording `metaMessageId` or `errorReason`.
- Retention: 90 days for body content, 12 months for metadata (for audit).

### FR-6 — Template discovery endpoint
- `GET /api/v1/whatsapp/templates` returns the same shape the hibiz UI receives, scoped to the API key's businessId.
- Clients use `components[].example.body_text[0]` to read variable names.

### FR-7 — Delivery status endpoint
- `GET /api/v1/whatsapp/messages/:deliveryId`. 404 if not owned by the API key's businessId.

### FR-8 — Hibiz dashboard surface
- New page **Settings → API Integration**:
  - "Create new key" form: `label`, `mode` (live/test). Returns plaintext key in a one-time modal.
  - List of existing keys (label, prefix, mode, lastUsedAt, status, revoke button).
  - "Recent API activity" table: last 100 calls with timestamp, template, status, optional jump-to-delivery detail.

## 8. Non-functional requirements

| Category | Requirement |
|---|---|
| **Security** | Keys hashed at rest. No key plaintext in logs. TLS 1.2+ only. CORS disabled (server-to-server only — browsers shouldn't call this). |
| **Rate limit** | 60 req/sec per key, burst 100. Sliding window. 429 with `Retry-After` header. |
| **Idempotency** | Optional `Idempotency-Key` header (24h TTL); duplicate keys return the original delivery row. |
| **Latency** | p95 < 400ms server-side (excluding Meta upstream). |
| **Observability** | Each request logs `{ requestId, apiKeyId, businessId, templateName, status, durationMs }`. |
| **Backward compat** | This endpoint never breaks once shipped. New fields are additive. Removing fields requires a versioned `/v2/`. |

## 9. API surface (v1)

### Base URL
```
https://api.hipal.com
```

### Common headers
```
Authorization: Bearer <key>
Content-Type: application/json
Idempotency-Key: <client-generated, optional>
```

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/whatsapp/templates` | List approved templates for the calling business |
| POST | `/api/v1/whatsapp/send` | Send one template message |
| GET | `/api/v1/whatsapp/messages/:deliveryId` | Get status of one delivery |

### Request body — `POST /send`
```json
{
  "templateName": "payment_confirm",
  "to": "+919876543210",
  "language": "en_GB",
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
}
```

### Success response
```json
{
  "err": false,
  "data": {
    "deliveryId": "65f8a2c1...",
    "status": "QUEUED",
    "metaMessageId": "wamid.HBgM..."
  }
}
```

### Error matrix

| HTTP | `message` | When |
|---|---|---|
| 401 | `"Invalid API key"` | Missing / malformed / revoked key |
| 403 | `"Key mode mismatch"` | Test key used on a route restricted to live (or vice versa) |
| 404 | `"Template not found"` | No matching `(businessId, templateName)` |
| 422 | `"Template not approved"` | Template exists but Meta status ≠ APPROVED |
| 400 | `"Missing required variables"` + `{ missing: [...] }` | Variable name not present in payload |
| 400 | `"Invalid variable types"` + `{ invalid: [...] }` | Non-string variable values |
| 429 | `"Rate limit exceeded"` | Throughput exceeded; respect `Retry-After` |
| 502 | `"Upstream error"` | Meta returned 5xx; safe to retry |

## 10. Data model

### New collection — `whatsAppApiKey`
```ts
{
  _id: ObjectId,
  businessId: ObjectId,        // owning business
  keyHash: string,             // bcrypt(plaintext)
  prefix: string,              // first 12 chars for UI; unique
  mode: "test" | "live",
  label: string,               // human-readable, set by user
  scopes: string[],            // future-proof: e.g. ["send", "templates:read"]
  lastUsedAt?: number,         // epoch ms
  isRevoked: boolean,
  revokedAt?: number,
  createdBy: ObjectId,         // userId who generated
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ prefix: 1 }` unique, `{ businessId: 1, isRevoked: 1 }`.

### New collection — `whatsAppApiDelivery`
```ts
{
  _id: ObjectId,
  businessId: ObjectId,
  apiKeyId: ObjectId,
  mode: "test" | "live",
  templateName: string,
  templateId?: number,         // resolved at send time
  to: string,                  // phone
  variables: Record<string, string>,
  positional: string[],        // what we actually sent to Meta
  referenceId?: string,        // client-supplied
  idempotencyKey?: string,
  status: "QUEUED" | "SENT" | "FAILED",
  metaMessageId?: string,
  errorReason?: string,
  errorDescription?: string,
  durationMs?: number,
  date: number,
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ businessId: 1, date: -1 }`, `{ apiKeyId: 1, date: -1 }`, `{ idempotencyKey: 1 }` sparse unique, `{ referenceId: 1 }` sparse.

### Untouched collections
`WhatAppTemplate`, `WhatsAppBusinessConfig`, `WhatsAppWallet`, `WhatsAppPayment`, `WhatsAppWalletHistory` — all read/write paths unchanged. The new endpoint sits on top.

## 11. Sequence flow (happy path)

```
Customer backend                  hipal API                 MongoDB                   Meta WhatsApp
       │                              │                        │                            │
       │  POST /v1/whatsapp/send      │                        │                            │
       │  Bearer sk_live_...          │                        │                            │
       ├─────────────────────────────►│                        │                            │
       │                              │  hash(key) lookup      │                            │
       │                              ├───────────────────────►│                            │
       │                              │  apiKey doc            │                            │
       │                              │◄───────────────────────┤                            │
       │                              │  findOne template      │                            │
       │                              ├───────────────────────►│                            │
       │                              │  template doc          │                            │
       │                              │◄───────────────────────┤                            │
       │                              │  translate variables   │                            │
       │                              │  insert delivery       │                            │
       │                              ├───────────────────────►│                            │
       │                              │  POST /messages        │                            │
       │                              ├────────────────────────┼───────────────────────────►│
       │                              │                        │                            │
       │                              │  wamid.HBgM...         │                            │
       │                              │◄────────────────────────┼────────────────────────────┤
       │                              │  update delivery=SENT  │                            │
       │                              ├───────────────────────►│                            │
       │  { deliveryId, status }      │                        │                            │
       │◄─────────────────────────────┤                        │                            │
```

## 12. Phased rollout

| Phase | Scope | Exit criteria |
|---|---|---|
| **P0 — Spike** (1 wk) | Wire route + key auth + send for one hardcoded businessId. No dashboard UI. | curl from terminal sends a real message to a test number. |
| **P1 — MVP** (2 wk) | Both collections, full validator, error matrix, delivery log, `GET /templates` + `GET /messages/:id`. Dashboard "Create key" + "Revoke key" + key list. | BMH integrates and triggers payment_confirm end-to-end from their staging. |
| **P2 — Hardening** (1 wk) | Rate limit, idempotency, "Recent API activity" panel in dashboard, retention job, alerts on 5xx spike. | Internal load test 100 rps/key sustained 10 min, no errors. |
| **P3 — Public launch** (1 wk) | Public docs page, status page, support runbook. | Second business onboarded with zero engineering help. |

## 13. Open questions

1. **API key in `Authorization: Bearer` vs query param?**  → Recommendation: header only. Query params leak into access logs.
2. **Where does `businessId` come from in the request body — accepted as extra check or not?**  → Recommendation: **only** resolved from the API key. Body never accepts `businessId`. Reduces footgun.
3. **One template = one event**, or **one event = many templates**?  → Out of scope for v1 (no event mapping collection in v1; clients call `templateName` directly). Revisit in v2 if customers ask for it.
4. **Webhook delivery status callbacks** (Meta tells us delivered/read → we POST to customer)?  → v2.
5. **Per-key scopes** (e.g. "send-only" vs "send + read templates")?  → Schema supports it (`scopes: string[]`), v1 ships with all-keys-can-do-everything; enforcement deferred.
6. **Wallet handling for `test` keys** — do test keys debit wallet? Recommendation: **no**, test mode short-circuits before send and before debit. Documented explicitly.

## 14. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Customer leaks API key in client-side code | High | Document server-only. Reject calls from browser-like User-Agents on warn list (logging only, not blocking). Offer one-click revoke + rotate. |
| Variable name drift (template approved with `name`, customer sends `customerName`) | Medium | Discovery endpoint exists. Return `missing` array in 400. Add lint warning in docs. |
| Meta upstream outage | Medium | Existing template sender already handles retry. API returns 502 with `Retry-After`. |
| Cross-tenant data leak via 404/200 mismatch | High | Always return 404 (not 403) for unknown-or-unauthorized templates — never reveal existence. |
| Wallet drain via runaway integration bug | Medium | Per-key rate limit + per-business daily send cap (existing wallet enforces too). |

## 15. Success metrics

- **Adoption**: number of businesses with ≥1 live API key, 30 days post-launch. Target: 5 in first month.
- **Volume**: API sends as % of total template sends. Target: 30% within 3 months.
- **Reliability**: % of `/send` calls returning 2xx (excluding 4xx user errors). Target: ≥99.5%.
- **Latency**: p95 server-side latency. Target: <400 ms (excluding Meta upstream).
- **Support load**: tickets per 1000 sends. Target: <0.5 — the self-describing `/templates` endpoint should keep clients unblocked.

## 16. Out of scope (explicit)

- WhatsApp inbound message routing to customer webhooks (already handled by existing `wa-webhooks`).
- Non-WhatsApp channels (SMS, email).
- UI for *creating* templates from the public API. Templates are still created only via the hibiz dashboard for approval governance.
- OAuth flows. Static API keys only.

## 17. Appendix — example client integrations (informative)

### Book My Hostels — payment confirmation
```bash
curl -X POST https://api.hipal.com/api/v1/whatsapp/send \
  -H "Authorization: Bearer sk_live_..." \
  -H "Content-Type: application/json" \
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

### Generic Node.js (any business)
```js
async function sendTemplate({ templateName, to, variables, referenceId }) {
  const res = await fetch("https://api.hipal.com/api/v1/whatsapp/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.HIPAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ templateName, to, variables, referenceId }),
  });
  if (!res.ok) throw new Error(`hipal send failed: ${res.status}`);
  return res.json();
}
```

---

**End of PRD.**
