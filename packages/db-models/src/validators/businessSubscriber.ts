import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


export const businessSubscriberValidator = z.object({
  userId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  userCount: z
    .number({
      message: "userCount must be a number",
    })
    .optional(),
  isDeleted: z.boolean().default(false).optional(),
  date: z
    .number({
      message: "date must be a number",
    })
    .optional(),
  whatsappMsgUnseenCount: z.number().default(0).optional(),
});

export type BusinessSubscriber = z.infer<typeof businessSubscriberValidator>;
