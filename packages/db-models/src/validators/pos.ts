import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


export const posSchema = z.object({
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

  secretKey: z.string().min(3).max(200),
  accessKey: z.string().min(3).max(200),
  authToken: z.string().min(3).max(200),
  restId: z.string().min(3).max(200),
  businessId: ObjectIdSchema,

  isDeleted: z.boolean().default(false).optional(),
});

export type PosType = z.infer<typeof posSchema>;
