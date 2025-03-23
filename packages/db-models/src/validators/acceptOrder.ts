import { z } from "zod";
export const settleModesSchema = z
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
export const acceptOrderSchema = z
  .object({
    comment: z.string().max(1000).optional(),
    waiterName: z.string().max(100).optional(),
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
const discountSchema = z
  .object({
    tableName: z.string().min(1).max(200),
    businessId: z.string().min(1).max(200),
    total: z.coerce.number(),
    discountValue: z.coerce.number(),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    action: z.enum(["ADD", "REMOVE"]),
    discountBy: z.string().min(1).max(50),
    discountReason: z.string().min(1).max(200),
  })
  .refine(
    (data) => {
      if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
        return false;
      }
      return true;
    },
    {
      message:
        "Discount value cannot be greater than 100 when discount type is PERCENTAGE",
      path: ["discountValue"], // specify the path to the field that caused the error
    },
  );

const kotOrderAcceptSchema = z
  .object({
    orderId: z.string().min(1).max(500),
    orderAction: z.enum(["ACCEPT", "REJECT", "EDIT"]),
    performBy: z.string().min(1).max(500),
    reasonOfRejection: z.string().min(1).max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.orderAction === "REJECT" && !data.reasonOfRejection) {
        return false;
      }
      return true;
    },
    {
      message: "reasonOfRejection is required when orderAction is REJECT",
      path: ["reasonOfRejection"], // specify the path to the field that caused the error
    },
  );

export { discountSchema, kotOrderAcceptSchema };

export type AcceptOrderType = z.infer<typeof acceptOrderSchema>;
