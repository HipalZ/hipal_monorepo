import { z } from "zod";

export const switchTableschema = z
  .object({
    fromTableId: z.string().max(200).optional(),
    toTableId: z.string().max(200).optional(),
    businessId: z.string().min(1).max(200),
    switchType: z.enum(["TABLE", "KOT"]),
    switchBy: z.string().min(1).max(200),
    kotIds: z.array(z.string().max(500)).optional(),
  })
  .refine(
    (data) => {
      if (data.switchType === "KOT") {
        return data.kotIds && data.kotIds.length > 0;
      }
      return true;
    },
    {
      message: "Please provide kotIds when switchType is KOT",
      path: ["kotIds"], // Path to the field that needs to be validated
    },
  )
  .refine(
    (data) => {
      if (data.switchType === "TABLE") {
        return data.fromTableId && data.toTableId;
      }
      return true;
    },
    {
      message:
        "Please provide fromTableId and toTableId when switchType is TABLE",
      path: ["fromTableId", "toTableId"], // Path to the fields that need to be validated
    },
  );

export type SwitchTableType = z.infer<typeof switchTableschema>;
