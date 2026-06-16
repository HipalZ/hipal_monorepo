import {
  WhatAppTemplate,
  WhatsAppApiDelivery,
  WhatsAppApiKey,
  WhatsAppBusinessConfig,
} from "@hi/db-models";
import {
  createWhatsAppApiKeySchema,
  sandboxSendSchema,
} from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import type { Context } from "hono";
import { Hono } from "hono";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import {
  ClientRoles,
  requireAuthorization,
} from "../../../middleware/authorization";
import { authTokenValidator } from "../../../middleware/tokenValidator";
import { respond } from "../../utils/response";
import whatsAppApiBaseUrl, {
  WHATSAPP_BUSINESS_DISABLED_MESSAGE,
  isWhatsAppConfigEnabled,
} from "../../utils/whatsAppApiBaseUrl/apiPaths";

/**
 * WhatsApp Sandbox API — single multi-tenant public surface that lets any
 * onboarded business trigger their own approved WhatsApp templates from
 * their own backend with a Bearer key.
 *
 * Routes mounted under `/whatsapp/sandbox`:
 *
 *   POST   /keys                    → create an API key  (HIPAL_ADMIN JWT)
 *   GET    /keys                    → list this business's keys  (HIPAL_ADMIN JWT)
 *   POST   /keys/:id/revoke         → soft-revoke a key  (HIPAL_ADMIN JWT)
 *   GET    /templates               → list approved templates  (sk_ key)
 *   POST   /send                    → send one template message (sk_ key)
 *   GET    /messages/:deliveryId    → status of one delivery   (sk_ key)
 *
 * Two distinct auth layers:
 *
 *   (a) Admin layer — hipalz dashboard JWT, used by ops to create / revoke
 *       customer keys. Enforced via the existing `authTokenValidator` +
 *       `requireAuthorization([HIPAL_ADMIN])`.
 *
 *   (b) Public layer — customer's `sk_` API key. Resolved per-request via
 *       `authenticatePublic()` below. The key's `businessId` is the ONLY
 *       source of truth for tenant isolation; clients never send it in the
 *       body and cannot escalate by mutating any field.
 */

// ─── Key minting helpers ────────────────────────────────────────────────────

const KEY_BYTES = 32; // 256 bits of entropy → no rainbow-table risk
const KEY_PREFIX = "sk_"; // industry standard marker (Stripe / GitHub style)
const PREFIX_LENGTH = 11; // "sk_" + 8 chars

/** Generate a new plaintext key plus the storable fields. */
const mintKey = () => {
  const random = randomBytes(KEY_BYTES).toString("base64url");
  const plaintext = `${KEY_PREFIX}${random}`;
  const prefix = plaintext.slice(0, PREFIX_LENGTH);
  const keyHash = createHash("sha256").update(plaintext).digest("hex");
  return { plaintext, prefix, keyHash };
};

/** Constant-time SHA-256 comparison — prevents timing oracles. */
const verifyKey = (plaintext: string, storedHash: string): boolean => {
  const computed = createHash("sha256").update(plaintext).digest();
  let stored: Buffer;
  try {
    stored = Buffer.from(storedHash, "hex");
  } catch {
    return false;
  }
  if (computed.length !== stored.length) return false;
  return timingSafeEqual(computed, stored);
};

// ─── Public Bearer auth (customer-facing routes) ───────────────────────────

type AuthedKey = {
  apiKeyId: string;
  businessId: string;
  scopes: string[];
};

/**
 * Resolve the customer's Bearer key to an AuthedKey.
 *
 * Never returns *why* auth failed beyond a generic null — that detail goes
 * to the structured log, not to the response, to avoid leaking which keys
 * exist or whether they're revoked.
 */
const authenticatePublic = async (
  c: Context,
): Promise<AuthedKey | null> => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    logSecurity(c, "auth.missing_or_malformed_header");
    return null;
  }

  const plaintext = authHeader.slice(7).trim();
  // Cap length so a malicious caller can't force a huge hash computation.
  if (
    plaintext.length < 20 ||
    plaintext.length > 200 ||
    !plaintext.startsWith(KEY_PREFIX)
  ) {
    logSecurity(c, "auth.bad_key_shape", { length: plaintext.length });
    return null;
  }

  const prefix = plaintext.slice(0, PREFIX_LENGTH);
  const row = await WhatsAppApiKey.findOne({ prefix, isRevoked: false });
  if (!row) {
    logSecurity(c, "auth.unknown_prefix", { prefix });
    return null;
  }
  if (!verifyKey(plaintext, row.keyHash)) {
    logSecurity(c, "auth.hash_mismatch", { prefix });
    return null;
  }

  // Fire-and-forget lastUsedAt bump.
  WhatsAppApiKey.updateOne(
    { _id: row._id },
    { $set: { lastUsedAt: Date.now() } },
  ).catch(() => {
    /* ignore */
  });

  return {
    apiKeyId: String(row._id),
    businessId: String(row.businessId),
    scopes: row.scopes || [],
  };
};

/**
 * Structured log for security-relevant events. Keeps the same field names
 * across denied auth attempts so they can be alerted on (e.g. spike in
 * `auth.unknown_prefix` from one IP).
 *
 * Never includes the plaintext key — only its prefix (which is not a secret).
 */
const logSecurity = (
  c: Context,
  event: string,
  detail: Record<string, unknown> = {},
) => {
  // Use console.warn so it surfaces in production logs without crashing if
  // a logger isn't wired. Replace with your structured logger when available.
  console.warn(
    JSON.stringify({
      kind: "whatsapp.sandbox.security",
      event,
      path: c.req.path,
      method: c.req.method,
      ua: c.req.header("User-Agent"),
      ip:
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        undefined,
      at: new Date().toISOString(),
      ...detail,
    }),
  );
};

// ─── Named → positional translator ─────────────────────────────────────────

/**
 * Project the client's named JSON into the positional array Meta expects,
 * driven by the template's `bodyVariableSequence`. Returns the array plus
 * a list of names that were missing or non-string (handed back to client
 * so they can fix without contacting support).
 */
const translateVariables = (
  sequence: string[],
  vars: Record<string, unknown>,
): { positional: string[]; missing: string[]; invalid: string[] } => {
  const positional: string[] = [];
  const missing: string[] = [];
  const invalid: string[] = [];

  // Defense in depth: cap iteration so a maliciously-large sequence on a
  // template doc can't cause a long loop. Templates rarely exceed ~30 vars.
  const limit = Math.min(sequence.length, 100);

  for (let i = 0; i < limit; i++) {
    const name = sequence[i];
    const value = vars[name];
    if (value === undefined || value === null || value === "") {
      missing.push(name);
      positional.push("");
      continue;
    }
    if (typeof value !== "string") {
      invalid.push(name);
      positional.push(String(value));
      continue;
    }
    if (value.length > 1024) {
      // Meta caps body-param length; reject explicitly rather than getting
      // a 4xx from Meta after the wallet debit.
      invalid.push(name);
      positional.push(value.slice(0, 1024));
      continue;
    }
    positional.push(value);
  }

  return { positional, missing, invalid };
};

// ─── Router ────────────────────────────────────────────────────────────────

const sandboxRouter = new Hono()
  /**
   * POST /whatsapp/sandbox/keys
   *
   * Mint a new API key for a business. Plaintext is returned in this
   * response and is NEVER recoverable later. Requires a hipalz admin JWT.
   */
  .post(
    "/keys",
    authTokenValidator,
    requireAuthorization([ClientRoles.HIPAL_ADMIN]),
    zValidator("json", createWhatsAppApiKeySchema),
    async (c) => {
      const body = c.req.valid("json");
      const currentUser = c.get("current_user") as
        | { id?: string }
        | undefined;

      const { plaintext, prefix, keyHash } = mintKey();

      const row = await WhatsAppApiKey.create({
        businessId: body.businessId,
        keyHash,
        prefix,
        label: body.label,
        scopes: body.scopes ?? ["send", "templates:read"],
        isRevoked: false,
        createdBy: currentUser?.id,
        date: Date.now(),
      });

      // Audit trail: who created which key for which business, when.
      console.info(
        JSON.stringify({
          kind: "whatsapp.sandbox.audit",
          event: "key.created",
          apiKeyId: String(row._id),
          businessId: String(row.businessId),
          prefix,
          createdBy: currentUser?.id,
          at: new Date().toISOString(),
        }),
      );

      return c.json(
        {
          err: false,
          message:
            "API key created. Copy the `key` value now — it will not be shown again.",
          data: {
            apiKeyId: row._id,
            key: plaintext,
            prefix,
            label: row.label,
            scopes: row.scopes,
            businessId: row.businessId,
            createdAt: row.get("createdAt"),
          },
        },
        201,
      );
    },
  )

  /**
   * GET /whatsapp/sandbox/keys?businessId=...
   *
   * Admin-only list of issued keys for a business. Never returns `keyHash`
   * or anything from which the plaintext can be derived.
   */
  .get(
    "/keys",
    authTokenValidator,
    requireAuthorization([ClientRoles.HIPAL_ADMIN]),
    zValidator(
      "query",
      z.object({ businessId: z.string().min(3).max(50) }),
    ),
    async (c) => {
      const { businessId } = c.req.valid("query");
      const rows = await WhatsAppApiKey.find({ businessId })
        .select("_id prefix label scopes isRevoked lastUsedAt revokedAt date")
        .sort({ date: -1 })
        .lean();
      return c.json({
        err: false,
        message: "API keys fetched",
        data: rows,
      });
    },
  )

  /**
   * POST /whatsapp/sandbox/keys/:apiKeyId/revoke
   *
   * Soft-revoke a key. Idempotent. Admin-only.
   */
  .post(
    "/keys/:apiKeyId/revoke",
    authTokenValidator,
    requireAuthorization([ClientRoles.HIPAL_ADMIN]),
    zValidator("param", z.object({ apiKeyId: z.string().min(3).max(50) })),
    async (c) => {
      const { apiKeyId } = c.req.param();
      const currentUser = c.get("current_user") as
        | { id?: string }
        | undefined;

      const row = await WhatsAppApiKey.findByIdAndUpdate(
        apiKeyId,
        { $set: { isRevoked: true, revokedAt: Date.now() } },
        { new: true },
      );
      if (!row) {
        return respond(c, "API key not found", true, 404, {});
      }

      console.info(
        JSON.stringify({
          kind: "whatsapp.sandbox.audit",
          event: "key.revoked",
          apiKeyId: String(row._id),
          businessId: String(row.businessId),
          prefix: row.prefix,
          revokedBy: currentUser?.id,
          at: new Date().toISOString(),
        }),
      );

      return c.json({
        err: false,
        message: "Key revoked",
        data: { apiKeyId: row._id, isRevoked: row.isRevoked },
      });
    },
  )

  /**
   * GET /whatsapp/sandbox/templates
   *
   * List the approved templates for the calling business. Self-discovery —
   * clients read each row's `bodyVariableSequence` to learn what variable
   * names they must send to `/send`.
   */
  .get("/templates", async (c) => {
    const auth = await authenticatePublic(c);
    if (!auth) return respond(c, "Invalid API key", true, 401, {});

    if (!auth.scopes.includes("templates:read")) {
      logSecurity(c, "scope.denied", {
        apiKeyId: auth.apiKeyId,
        required: "templates:read",
      });
      return respond(c, "Key is not authorized to read templates", true, 403, {});
    }

    const templates = await WhatAppTemplate.find({
      businessId: auth.businessId,
      isDeleted: false,
    })
      .select(
        "templateName templateId languageCode category bodyVariableSequence headerVariableSequence footerVariableSequence",
      )
      .sort({ createdAt: -1 })
      .lean();

    return c.json({
      err: false,
      message: "Templates fetched",
      data: templates,
    });
  })

  /**
   * POST /whatsapp/sandbox/send
   *
   * The main endpoint. Take a templateName + named variables → translate to
   * positional → push to Meta → log + return delivery id.
   */
  .post("/send", zValidator("json", sandboxSendSchema), async (c) => {
    const startedAt = Date.now();

    const auth = await authenticatePublic(c);
    if (!auth) return respond(c, "Invalid API key", true, 401, {});

    if (!auth.scopes.includes("send")) {
      logSecurity(c, "scope.denied", {
        apiKeyId: auth.apiKeyId,
        required: "send",
      });
      return respond(c, "Key is not authorized to send messages", true, 403, {});
    }

    // Bound the idempotency header so an attacker can't bloat the index or
    // probe for collisions cheaply.
    const idempotencyKeyRaw = c.req.header("Idempotency-Key");
    const idempotencyKey =
      idempotencyKeyRaw && idempotencyKeyRaw.length <= 200
        ? idempotencyKeyRaw
        : undefined;

    if (idempotencyKey) {
      const existing = await WhatsAppApiDelivery.findOne({
        idempotencyKey,
        businessId: auth.businessId,
      }).lean();
      if (existing) {
        return c.json({
          err: false,
          message: "Idempotent replay — returning the original delivery.",
          data: {
            deliveryId: existing._id,
            status: existing.status,
            metaMessageId: existing.metaMessageId,
          },
        });
      }
    }

    const body = c.req.valid("json");

    // 1. Resolve template scoped to this business.
    const template = await WhatAppTemplate.findOne({
      businessId: auth.businessId,
      templateName: body.templateName,
      isDeleted: false,
    }).lean();

    if (!template) {
      // Same response shape for "doesn't exist" and "belongs to another
      // business" — never leak cross-tenant existence.
      return respond(c, "Template not found", true, 404, {});
    }

    // 2. Translate named JSON → positional array.
    const sequence = template.bodyVariableSequence ?? [];
    const { positional, missing, invalid } = translateVariables(
      sequence,
      body.variables,
    );

    if (missing.length || invalid.length) {
      return c.json(
        {
          err: true,
          message: missing.length
            ? `Missing required variables for template '${body.templateName}'`
            : `Invalid variable values for template '${body.templateName}'`,
          missing,
          invalid,
          required: sequence,
        },
        400,
      );
    }

    // 3. Insert delivery row as QUEUED *before* the network call so we
    //    never lose track of an attempt even if Meta times out.
    //    Handles the idempotency-race: if another concurrent request with
    //    the same key beat us to the insert, Mongo's unique sparse index
    //    will throw E11000; we fall back to the existing row.
    let deliveryDoc: { _id: unknown };
    try {
      deliveryDoc = await WhatsAppApiDelivery.create({
        businessId: auth.businessId,
        apiKeyId: auth.apiKeyId,
        templateName: template.templateName,
        templateId: template.templateId,
        to: body.to,
        variables: body.variables,
        positional,
        referenceId: body.referenceId,
        idempotencyKey,
        status: "QUEUED",
        date: startedAt,
      });
    } catch (err: any) {
      if (err?.code === 11000 && idempotencyKey) {
        const existing = await WhatsAppApiDelivery.findOne({
          idempotencyKey,
          businessId: auth.businessId,
        }).lean();
        if (existing) {
          return c.json({
            err: false,
            message:
              "Idempotent replay (race) — returning the original delivery.",
            data: {
              deliveryId: existing._id,
              status: existing.status,
              metaMessageId: existing.metaMessageId,
            },
          });
        }
      }
      throw err;
    }

    // 4. Load this business's WABA credentials.
    const config = await WhatsAppBusinessConfig.findOne({
      businessId: auth.businessId,
    });
    if (!config || !config.token || !config.phoneId || !config.version) {
      await WhatsAppApiDelivery.updateOne(
        { _id: deliveryDoc._id },
        {
          $set: {
            status: "FAILED",
            errorReason: "WABA_CONFIG_MISSING",
            errorDescription:
              "Business has no WhatsApp Business Config (phoneId/token).",
            durationMs: Date.now() - startedAt,
          },
        },
      );
      return respond(c, "Business not configured for WhatsApp", true, 422, {
        deliveryId: deliveryDoc._id,
      });
    }
    if (!isWhatsAppConfigEnabled(config)) {
      await WhatsAppApiDelivery.updateOne(
        { _id: deliveryDoc._id },
        {
          $set: {
            status: "FAILED",
            errorReason: "WHATSAPP_BUSINESS_DISABLED",
            errorDescription: WHATSAPP_BUSINESS_DISABLED_MESSAGE,
            durationMs: Date.now() - startedAt,
          },
        },
      );
      return respond(c, WHATSAPP_BUSINESS_DISABLED_MESSAGE, true, 403, {
        deliveryId: deliveryDoc._id,
      });
    }

    // 5. Compose the Meta template payload.
    const language = body.language || template.languageCode || "en_GB";
    const components = positional.length
      ? [
          {
            type: "body",
            parameters: positional.map((text) => ({ type: "text", text })),
          },
        ]
      : [];

    const metaPayload = {
      messaging_product: "whatsapp",
      to: body.to.replace(/^\+/, ""),
      type: "template",
      template: {
        name: template.templateName,
        language: { code: language },
        ...(components.length ? { components } : {}),
      },
    };

    // Token goes in the Authorization header — NEVER the URL. Tokens in
    // query strings end up in access logs, proxy logs, browser history,
    // and APM tools. Header is the only safe place.
    const url = `${whatsAppApiBaseUrl.BASE_URL}${config.version}/${config.phoneId}/messages`;

    // 6. Send. Catch upstream errors and persist the failure detail.
    try {
      const metaRes = await axios.post(url, metaPayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        timeout: 15_000,
      });
      const metaMessageId = metaRes.data?.messages?.[0]?.id as
        | string
        | undefined;

      await WhatsAppApiDelivery.updateOne(
        { _id: deliveryDoc._id },
        {
          $set: {
            status: "SENT",
            metaMessageId,
            durationMs: Date.now() - startedAt,
          },
        },
      );

      return c.json({
        err: false,
        message: "Message dispatched",
        data: {
          deliveryId: deliveryDoc._id,
          status: "SENT",
          metaMessageId,
        },
      });
    } catch (err: any) {
      const errorReason =
        err?.response?.data?.error?.code?.toString() || "META_REQUEST_FAILED";
      // Cap error text we echo back so a verbose upstream message can't
      // be used to fingerprint internal infra.
      const upstreamMsg =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Unknown upstream error";
      const errorDescription = String(upstreamMsg).slice(0, 500);

      await WhatsAppApiDelivery.updateOne(
        { _id: deliveryDoc._id },
        {
          $set: {
            status: "FAILED",
            errorReason,
            errorDescription,
            durationMs: Date.now() - startedAt,
          },
        },
      );

      return c.json(
        {
          err: true,
          message: "Upstream send failed",
          data: {
            deliveryId: deliveryDoc._id,
            status: "FAILED",
            errorReason,
            errorDescription,
          },
        },
        502,
      );
    }
  })

  /**
   * GET /whatsapp/sandbox/messages/:deliveryId
   *
   * Fetch the status of a previously-sent message. Tenant-isolated.
   */
  .get(
    "/messages/:deliveryId",
    zValidator(
      "param",
      z.object({ deliveryId: z.string().min(3).max(50) }),
    ),
    async (c) => {
      const auth = await authenticatePublic(c);
      if (!auth) return respond(c, "Invalid API key", true, 401, {});

      const { deliveryId } = c.req.param();
      const row = await WhatsAppApiDelivery.findOne({
        _id: deliveryId,
        businessId: auth.businessId,
      }).lean();
      // Same 404 for "not yours" and "doesn't exist" — never leak
      // cross-tenant existence.
      if (!row) return respond(c, "Delivery not found", true, 404, {});

      return c.json({
        err: false,
        message: "Delivery fetched",
        data: {
          deliveryId: row._id,
          templateName: row.templateName,
          to: row.to,
          status: row.status,
          metaMessageId: row.metaMessageId,
          referenceId: row.referenceId,
          errorReason: row.errorReason,
          errorDescription: row.errorDescription,
          durationMs: row.durationMs,
          date: row.date,
        },
      });
    },
  );

export default sandboxRouter;
