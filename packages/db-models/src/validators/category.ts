import { string, z } from 'zod';

export const categorySchema = z.object({
  businessId: z.string(),
  name: z.string().max(100),
  visibility: z.boolean(),
  timerOn: z.boolean().optional(),
  timerStart: z.string().optional(),
  timerEnd: z.string().optional(),
  availableDays: z.array(z.number()),
  hierarchy: z.enum(['PARENT', 'CHILD']),
  parentCategory: z.string().optional().default(''),
  parentCategoryId: z.string().optional().default(''),
  coverImage: z.string().url().optional(),
  links: z.array(z.string()).optional(),
  dishes: z.array(string()).optional().default([]),
  version: z.number().optional(),
  availability: z.boolean().default(true),
  charges: z.array(z.unknown()).optional(),
});

export type CategoryType = z.infer<typeof categorySchema>;
