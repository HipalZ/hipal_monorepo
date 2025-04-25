import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


export const zoneChema = z.object({
  name: z
    .string({
      message: "name is required",
    })
    .min(1, {
      message: "name must be atleast 3 characters long",
    })
    .max(100, {
      message: "name must be atmost 100 characters long",
    }),
  businessId: ObjectIdSchema,
  staffIds: z.array(ObjectIdSchema).optional(),
  zoneId: z.string().min(3).max(100).optional(),
  isDeleted: z.boolean().default(false).optional(),
  active: z.string().min(1).max(30).optional(),
  rank: z.string().min(1).max(30).optional(),
  visibility: z.boolean().default(true),
  taxes: z.number().min(1).max(100).optional(),
  couponIds: z.array(ObjectIdSchema).optional(),
  tableIds: z.array(ObjectIdSchema).optional(),
});

export const updateZoneChema = z.object({
  name: z
    .string({
      message: "name is required",
    })
    .min(1, {
      message: "name must be atleast 3 characters long",
    })
    .max(100, {
      message: "name must be atmost 100 characters long",
    }),
  staffIds: z.array(ObjectIdSchema).optional(),
  visibility: z.boolean().default(true),
  taxes: z.number().min(1).max(100).optional(),
  couponIds: z.array(ObjectIdSchema).optional(),
  zoneId: z.string().min(3).max(100).optional(),
});

export type ZoneType = z.infer<typeof zoneChema>;
