import { z } from "zod";

export const hotelServiceTemplateMapping = z.object({
  serviceName: z.string().min(2).max(200),
  isActive: z.boolean().default(true),
  templateId: z.string(),
  businessId: z.string().min(24).max(24),
});

export const hotelServiceTemplateMappingArray = z.object({
  data: z.array(hotelServiceTemplateMapping),
});

export const updateHotelServiceTemplateMapping = z.object({
  isActive: z.boolean().optional(),
  templateId: z.string().optional(),
});

export type HotelServiceTemplateMappingType = z.infer<
  typeof hotelServiceTemplateMapping
>;
