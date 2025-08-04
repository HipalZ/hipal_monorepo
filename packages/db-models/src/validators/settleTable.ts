import { z } from "zod";
const settleModesSchema = z
  .array(
    z.object({
      name: z.string().max(100),
      amount: z.coerce.number().optional(),
      _id: z.string().max(100),
    }),
  )
  .min(1)
  .optional()
  .refine(
    (settleModes) => {
      if (!settleModes) return true;
      const names = settleModes.map((mode) => mode.name);
      const hasDues = names.includes("dues");
      const hasNpc = names.includes("npc");
      if ((hasDues && names.length > 1) || (hasNpc && names.length > 1)) {
        return false; // "dues" or "npc" should not be combined with other modes
      }

      if (settleModes.length > 1) {
        return settleModes.every((mode) => mode.amount !== undefined);
      }

      return true;
    },
    {
      message: "'dues' or 'npc' should not be combined with other modes",
    },
  );

const duessettleModesSchema = z
  .array(
    z.object({
      name: z.string().max(100),
      amount: z.coerce.number(),
      _id: z.string().max(100),
    }),
  )
  .min(1)
  .optional()
  .refine(
    (settleModes) => {
      if (!settleModes) return true;
      const names = settleModes.map((mode) => mode.name);
      const hasDues = names.includes("dues");
      const hasNpc = names.includes("npc");
      if ((hasDues && names.length > 1) || (hasNpc && names.length > 1)) {
        return false; // "dues" or "npc" should not be combined with other modes
      }

      if (settleModes.length > 1) {
        return settleModes.every((mode) => mode.amount !== undefined);
      }

      return true;
    },
    {
      message: "'dues' or 'npc' should not be combined with other modes",
    },
  );
export const normalSettleSchema = z
  .object({
    tableId: z.string().min(1).max(500),
    captainId: z.string().min(1).max(500),
    billId: z.string().min(1).max(500),
    settleModes: settleModesSchema,
    split: z.boolean().default(false).optional(),
    duesUserId: z.string().max(100).optional(),
    npcUserId: z.string().max(100).optional(),
    variantId: z.string().min(24).max(24).optional(),
  })
  .refine(
    (data) => {
      const names = data.settleModes?.map((mode) => mode.name) || [];
      const hasDues = names.includes("dues");
      const hasNpc = names.includes("npc");
      if (hasDues && !data.duesUserId) {
        return false;
      }
      if (hasNpc && !data.npcUserId) {
        return false;
      }
      return true;
    },
    {
      message:
        "If settleModes includes 'dues', duesUserId is required. If settleModes includes 'npc', npcUserId is required.",
      path: ["settleModes"], // specify the path to the field that caused the error
    },
  );

export const forceSettleSchema = z
  .object({
    tableId: z.string().min(1).max(500),
    captainId: z.string().min(1).max(500),
    reasonForForceSettle: z.string().min(1).max(500),
    settleAmount: z.coerce.number().optional(),
    billRequestId: z.string().min(1).max(500).optional(),

    settleModes: settleModesSchema,
    split: z.boolean().default(false).optional(),
    duesUserId: z.string().max(100).optional(),
    npcUserId: z.string().max(100).optional(),
  })
  .refine(
    (data) => {
      const names = data.settleModes?.map((mode) => mode.name) || [];
      const hasDues = names.includes("dues");
      const hasNpc = names.includes("npc");
      if (hasDues && !data.duesUserId) {
        return false;
      }
      if (hasNpc && !data.npcUserId) {
        return false;
      }

      return true;
    },
    {
      message:
        "If settleModes includes 'dues', duesUserId is required. If settleModes includes 'npc', npcUserId is required.",
      path: ["settleModes"], // specify the path to the field that caused the error
    },
  );

export const duesSettleSchema = z
  .object({
    businessId: z.string().min(1).max(50),
    duesUserId: z.string().min(1).max(50),
    settleModes: duessettleModesSchema,
    npcUserId: z.string().max(100).optional(),
  })
  .refine(
    (data) => {
      const names = data.settleModes?.map((mode) => mode.name) || [];
      const hasDues = names.includes("dues");
      const hasNpc = names.includes("npc");
      if (hasDues && !data.duesUserId) {
        return false;
      }
      if (hasNpc && !data.npcUserId) {
        return false;
      }

      return true;
    },
    {
      message:
        "If settleModes includes 'dues', duesUserId is required. If settleModes includes 'npc', npcUserId is required.",
      path: ["settleModes"], // specify the path to the field that caused the error
    },
  );

export const resolveTableSchema = z
  .object({
    unSettleTableId: z.string().min(1).max(500),
    captainId: z.string().min(1).max(500),
    businessId: z.string().min(1).max(500),
    reasonForSettle: z.string().min(1).max(500),
    settleAmount: z.coerce.number().optional(),
    orderId: z.string().min(1).max(500).optional(),
    duesUserId: z.string().max(100).optional(),
    settleModes: settleModesSchema,
    split: z.boolean().default(false).optional(),
    npcUserId: z.string().max(100).optional(),
  })

  .refine(
    (data) => {
      const names = data.settleModes?.map((mode) => mode.name) || [];
      const hasDues = names.includes("dues");
      const hasNpc = names.includes("npc");
      if (hasDues && !data.duesUserId) {
        return false;
      }
      if (hasNpc && !data.npcUserId) {
        return false;
      }

      return true;
    },
    {
      message:
        "If settleModes includes 'dues', duesUserId is required. If settleModes includes 'npc', npcUserId is required.",
      path: ["settleModes"], // specify the path to the field that caused the error
    },
  );
