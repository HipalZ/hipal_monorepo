import z from 'zod';

export const staffValidator = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits.'),
  password: z.string().min(4),
});

export type StaffType = z.infer<typeof staffValidator>;
