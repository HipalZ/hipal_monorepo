# WhatsApp Sandbox — `POST /send`

Trigger an approved WhatsApp template for your business.

## Endpoint
```
POST https://api.test.hipalz.com/whatsapp/sandbox/send
```

## Headers

| Header | Required | Value |
|---|---|---|
| `Authorization` | ✅ | `Bearer <YOUR_API_KEY>` — the `sk_...` token shared with you at onboarding |
| `Content-Type` | ✅ | `application/json` |
| `Idempotency-Key` | recommended | Any unique string per logical send. Reuse on retries to avoid duplicate messages. Max 200 chars. |

## Body parameters

| Field | Type | Required | Description |
|---|---|---|---|
| `templateName` | string | ✅ | Exact name of the approved template (e.g. `payment_confirm`) |
| `to` | string | ✅ | Recipient phone in E.164 format (`+91...`, 10–15 digits) |
| `variables` | object | ✅ | Map of variable names → string values. Keys must match the template's `bodyVariableSequence` exactly. All values must be strings. |
| `referenceId` | string | optional | Your own correlation id (e.g. Razorpay payment id). Stored for audit, returned in delivery lookups. |
| `language` | string | optional | Overrides the template's default language code (e.g. `en_GB`) |

## Example

```bash
curl -X POST https://api.test.hipalz.com/whatsapp/sandbox/send \
  -H "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YTI1ZTI2MzMxODM5ODkzN2ViODdmMyIsInJvbGUiOiJPV05FUiIsImlhdCI6MTc3ODc1Mzc0OCwiZXhwIjoxNzc5NjE3NzQ4fQ.-xNBjV2uJzbYlO9fTX4awdS5FmGYj4wLVXaubUBkPxM" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: bmh-pay-PLEEcIIHk3HZOj" \
  -d '{
    "templateName": "payment_confirm",
    "to": "+9199xxxxxxxx",
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

## Success response — `200`

```json
{
  "err": false,
  "message": "Message dispatched",
  "data": {
    "deliveryId": "67361f49929d6b95d0f18165",
    "status": "SENT",
    "metaMessageId": "wamid.HBgM..."
  }
}
```

## Common errors

| HTTP | Meaning |
|---|---|
| `400` | Missing or non-string variables. Response includes `missing[]` and `invalid[]` arrays. |
| `401` | Invalid / missing API key. |
| `404` | `templateName` not approved for your business. |
| `422` | Business not configured for WhatsApp. |
| `502` | Upstream Meta error — safe to retry with the same `Idempotency-Key`. |

---

> **Note:** the `Authorization` header must be the `sk_...` API key minted via `POST /whatsapp/sandbox/keys`. JWTs work for admin endpoints only, not for `/send`.
