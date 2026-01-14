import { z } from "zod";

export const switchTableschema = z
  .object({
    fromTableId: z.string().max(200),
    toTableId: z.string().max(200),
    businessId: z.string().min(1).max(200),
    transferType: z.enum(["TABLE", "ITEM", "KOT"]),
    transferBy: z.string().min(1).max(200),

    kotIds: z.array(z.string().max(500)).optional(),

    itemData: z
      .array(
        z.object({
          itemId: z.string().max(500),
          quantity: z.number().int().positive(), // ✅ quantity must be >= 1
        }),
      )
      .optional(),
  })

  // ✅ KOT validation
  .refine(
    (data) => {
      if (data.transferType === "KOT") {
        return data.kotIds && data.kotIds.length > 0;
      }
      return true;
    },
    {
      message: "Please provide kotIds when transferType is KOT",
      path: ["kotIds"],
    },
  )

  // ✅ TABLE validation
  .refine(
    (data) => {
      if (data.transferType === "TABLE") {
        return !!data.fromTableId && !!data.toTableId;
      }
      return true;
    },
    {
      message:
        "Please provide fromTableId and toTableId when transferType is TABLE",
      path: ["fromTableId", "toTableId"],
    },
  )

  // ✅ ITEM validation (FIXED)
  .refine(
    (data) => {
      if (data.transferType === "ITEM") {
        return data.itemData && data.itemData.length > 0;
      }
      return true;
    },
    {
      message: "Please provide itemData when transferType is ITEM",
      path: ["itemData"],
    },
  );

export type SwitchTableType = z.infer<typeof switchTableschema>;
