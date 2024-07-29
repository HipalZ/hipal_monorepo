import mongoose from "mongoose";
import { z } from "zod";
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);

export const ExploreLayout = ["BUTTER", "SUNFLOWER"] as const;
export const MenuLayout = ["MAIN_CATEGORY", "MAIN_AND_SUB_CATEGORY"] as const;
export const BusinessEnumType = ["FOOD", "OTHER"] as const;
export const BusinessSchema = z.object({
  name: z.string().min(4).max(50),
  businessType: z.enum(BusinessEnumType),
  customLink: z.string().min(3).max(30),
  staffIds: z.array(ObjectIdSchema),
  status: z.boolean().optional().default(false),
  //TODO : CREATE NEW LIASENCE
  exploreLayout: z.enum(ExploreLayout).optional(),
  menuLayout: z.enum(MenuLayout).optional(),
  primaryColor: z.string().min(5).max(30).optional(),
  secondaryColor: z.string().min(4).max(30).optional(),
  parentOutLetId: ObjectIdSchema.optional(),
  outlet: z.boolean().optional().default(true),
  themeApplied: z.boolean().optional().default(false),
  logo: z.string().optional(),
  address: z.string().optional(),
});

export const BranchSchema = z.object({
  name: z.string().min(4).max(50),
  parentOutLetId: ObjectIdSchema.optional(),
  outlet: z.boolean().optional().default(true),
  businessType: z.enum(BusinessEnumType).optional(),
  customLink: z.string().min(3).max(30),
  staffIds: z.array(ObjectIdSchema),
  status: z.boolean().optional().default(false),
  multiple: z.boolean().optional().default(false),
  menu: z.boolean().optional().default(false),
  themes: z.boolean().optional().default(false),
  rewards: z.boolean().optional().default(false),
  paymentAndBusinessSettings: z.boolean().optional().default(false),
  logo: z.string().optional(),
  address: z.string().optional(),
});

export const UpdateBusinessSchema = z.object({
  name: z.string().min(4).max(50).optional(),
  staffIds: z.array(ObjectIdSchema).optional(),

  businessType: z.enum(["FOOD", "OTHER"]),
  exploreLayout: z.enum(ExploreLayout).optional(),
  menuLayout: z.enum(MenuLayout).optional(),
  primaryColor: z.string().min(5).max(30).optional(),
  secondaryColor: z.string().min(5).max(30).optional(),
  logo: z.string().optional(),
  address: z.string().optional(),
});
export type BusinessType = z.infer<typeof BusinessSchema>;
