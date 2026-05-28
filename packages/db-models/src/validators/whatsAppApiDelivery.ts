import { z } from "zod";
import { ObjectIdSchema } from "./common";

/**
 * Validator for the `whatsAppApiDelivery` collection.
 *
 * One row per call to `/whatsapp/sandbox/send`. Insert as `QUEUED` before
 * the Meta call, then update to `SENT` / `FAILED` once Meta responds. This
 * row also acts as the idempotency cache when the client supplies an
 * `Idempotency-Key` header.
 */
export const whatsAppApiDeliveryStatusEnum = [
  "QUEUED",
  "SENT",
  "FAILED",
] as const;

export const whatsAppApiDeliverySchema = z.object({
  businessId: ObjectIdSchema,
  apiKeyId: ObjectIdSchema,

  templateName: z.string().min(1).max(200),
  // Meta-side template id, resolved at send time.
  templateId: z.number().optional(),

  // E.164 phone number (e.g. +919876543210). Validated more strictly at the
  // route level, kept loose here so we can still persist failed attempts
  // that came in with bad phones.
  to: z.string().min(3).max(20),

  // The named JSON exactly as the client supplied it.
  variables: z.record(z.string(), z.string()).default({}),

  // What we actually transmitted to Meta after translation. Stored separately
  // so we can spot translation regressions later.
  positional: z.array(z.string()).default([]),

  // Free-form client-side correlation id (e.g. their Razorpay payment id).
  referenceId: z.string().min(1).max(200).optional(),

  // Optional Idempotency-Key header value. If present, repeat requests with
  // the same key short-circuit and return this row instead of re-sending.
  idempotencyKey: z.string().min(1).max(200).optional(),

  status: z.enum(whatsAppApiDeliveryStatusEnum).default("QUEUED"),

  metaMessageId: z.string().min(1).max(200).optional(),
  errorReason: z.string().min(1).max(500).optional(),
  errorDescription: z.string().min(1).max(2000).optional(),
  durationMs: z.number().optional(),

  date: z.coerce.number().default(() => Date.now()),
});

export type WhatsAppApiDeliveryType = z.infer<
  typeof whatsAppApiDeliverySchema
>;

/** Body accepted by `POST /whatsapp/sandbox/send`. */
export const sandboxSendSchema = z.object({
  templateName: z.string().min(1).max(200),
  to: z
    .string()
    .min(10)
    .max(20)
    .regex(/^\+?[0-9]{10,15}$/, {
      message: "Phone must be 10–15 digits, optional leading + (E.164).",
    }),
  language: z.string().min(2).max(10).optional(),
  variables: z.record(z.string(), z.string()).default({}),
  referenceId: z.string().min(1).max(200).optional(),
});

export type SandboxSendType = z.infer<typeof sandboxSendSchema>;
