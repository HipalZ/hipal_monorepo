import { z } from 'zod';

export const addStaffValidator = z.object({
  businessId: z.string(),
  name: z.string().max(30),
  phone: z.string().max(10),
  permissions: z
    .array(
      z.object({
        title: z.string(),
        subPermissions: z
          .array(
            z.object({
              subTitle: z.string().optional(),
              descriptions: z.string(), // Assuming descriptions should be a string. If it needs to be an array, adjust accordingly.
            }),
          )
          .optional(),
      }),
    )
    .optional(),
});

export type AddStaffValidatorType = z.infer<typeof addStaffValidator>;
