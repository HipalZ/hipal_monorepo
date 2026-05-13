import { z } from "zod";
import { ObjectIdSchema } from "./common";

/**
 * Validator for the `whatsAppApiKey` collection.
 *
 * One row per issued API key. A business may have several keys (production
 * backend, staging backend, internal tools, etc.). The plaintext key string
 * is shown to the user exactly once at creation time — we only persist the
 * hashed form (`keyHash`) for later verification.
 */
export const whatsAppApiKeySchema = z.object({
  businessId: ObjectIdSchema,

  // SHA-256 hex digest of the plaintext key. API keys are 32 bytes of
  // crypto-random data so a fast hash is sufficient (no dictionary risk).
  keyHash: z.string().min(64).max(64),

  // First ~12 chars of the plaintext (e.g. "sk_a3f9b2c1"). Stored in clear
  // so it can be displayed in the dashboard and looked up cheaply via index
  // before the constant-time hash comparison runs.
  prefix: z.string().min(8).max(20),

  // Human-readable name the user chose at creation time
  // ("Production backend", "Staging tests", etc.).
  label: z.string().min(1).max(100),

  // Coarse-grained permissions. v1 ships with every key carrying all scopes;
  // the field exists so we don't have to migrate the collection later when
  // we want "send-only" keys or read-only audit keys.
  scopes: z.array(z.string().min(1).max(50)).default(["send", "templates:read"]),

  // Best-effort timestamp of the most recent authenticated request that used
  // this key. Helps the user identify dormant keys safe to revoke.
  lastUsedAt: z.number().optional(),

  isRevoked: z.boolean().default(false),
  revokedAt: z.number().optional(),

  // userId of the hibiz dashboard user who generated the key.
  createdBy: ObjectIdSchema.optional(),

  date: z.coerce.number().default(() => Date.now()),
});

export type WhatsAppApiKeyType = z.infer<typeof whatsAppApiKeySchema>;

/** Body accepted by `POST /whatsapp/sandbox/keys`. */
export const createWhatsAppApiKeySchema = z.object({
  businessId: ObjectIdSchema,
  label: z.string().min(1).max(100),
  scopes: z
    .array(z.string().min(1).max(50))
    .optional()
    .default(["send", "templates:read"]),
});

export type CreateWhatsAppApiKeyType = z.infer<
  typeof createWhatsAppApiKeySchema
>;
