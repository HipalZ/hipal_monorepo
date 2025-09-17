import { z } from "zod";

export const hotelServiceTemplateMapping = z.object({
  serviceName: z.string().min(2).max(200),
  isActive: z.boolean().default(true),
  templateId: z.number(),
  businessId: z.string().min(24).max(24),
});

export const updateHotelServiceTemplateMapping = z.object({
  isActive: z.boolean().optional(),
  templateId: z.number().optional(),
});

export type HotelServiceTemplateMappingType = z.infer<
  typeof hotelServiceTemplateMapping
>;
