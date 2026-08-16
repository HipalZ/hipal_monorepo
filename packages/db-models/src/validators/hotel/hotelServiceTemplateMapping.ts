import { z } from "zod";

const hotelTemplateButtonMapping = z.object({
  index: z.coerce.number().min(0).max(9),
  target: z.enum(["none", "roomLink", "chatLink", "reviewLink"]).default("none"),
});

export const hotelServiceTemplateMapping = z.object({
  serviceName: z.string().min(2).max(200),
  isActive: z.boolean().default(true),
  templateId: z.string(),
  businessId: z.string().min(24).max(24),
  buttonMappings: z.array(hotelTemplateButtonMapping).default([]),
});

export const hotelServiceTemplateMappingArray = z.object({
  data: z.array(hotelServiceTemplateMapping),
});

export const updateHotelServiceTemplateMapping = z.object({
  isActive: z.boolean().optional(),
  templateId: z.string().optional(),
  buttonMappings: z.array(hotelTemplateButtonMapping).optional(),
});

export type HotelServiceTemplateMappingType = z.infer<
  typeof hotelServiceTemplateMapping
>;
