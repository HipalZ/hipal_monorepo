import { z } from "zod";

// ==========================================
// SHARED SCHEMAS
// ==========================================

export const PortionSchema = z.object({
  name: z.string().min(1, "Portion name is required"),
  price: z.number().min(0, "Price must be non-negative"),
  default: z.boolean().optional(), // Default portion flag
  portionTypes: z.array(z.string()).optional(), // Dish types for this portion
  _id: z.string().optional(),
});

export const AddonChoiceSchema = z.object({
  name: z.string().min(1, "Choice name is required"),
  price: z.number().min(0, "Price must be non-negative"),
  isDefault: z.boolean().optional(),
  _id: z.string().optional(),
});

// ==========================================
// DISH SCHEMA
// ==========================================

export const DishFormSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").trim(),
    dishType: z.enum(["VEG", "NON_VEG", "EGG", "ALCOHOL", "NON_ALCOHOL"]),
    kitchenId: z.string().optional(), // Optional because it's hidden in merge mode

    // Price rules: if portions exist, basePrice is ignored/calculated
    price: z.number().min(0).optional(),
    portions: z.array(PortionSchema).optional(),
    avgPrepTime: z.number().min(0).max(1440).optional(),

    description: z.string().optional(),

    // Linking - only for individual menu
    categoryIds: z.array(z.string()).optional(),
    addonIds: z.array(z.string()).optional(),

    // Images (limit 3)
    images: z.array(z.string()).max(3, "Maximum 3 images allowed").optional(),

    // Misc
    availability: z.boolean().default(true),
    visibility: z.boolean().default(true),
    tags: z.array(z.string()).optional(),
    recommendedDishIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // If no portions, price is required
      if (
        (!data.portions || data.portions.length === 0) &&
        (data.price === undefined || data.price === null)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Base price is required if no portions are added",
      path: ["price"],
    },
  );

export type DishFormValues = z.infer<typeof DishFormSchema>;

// ==========================================
// CATEGORY SCHEMA
// ==========================================

export const CategoryFormSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  hierarchy: z.enum(["PARENT", "CHILD"]),

  // For Child categories, linking to Parent is required
  parentId: z.string().optional(),

  // For Parent categories, linking Children is optional
  childCategoryIds: z.array(z.string()).optional(),

  // Misc
  images: z
    .array(z.string())
    .max(1, "Only 1 image allows for categories")
    .optional(), // Usually 1 like cover
  categoryTimings: z.string().optional(), // Cron or JSON string, keeping generic for now
  visibility: z.boolean().default(true),
});
// .refine((data) => {
//   if (data.hierarchy === "CHILD" && !data.parentId) {
//     return false;
//   }
//   return true;
// }, {
//   message: "Main Category is required for sub-categories",
//   path: ["parentId"],
// });

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

// ==========================================
// ADDON SCHEMA
// ==========================================

export const AddonFormSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim(),
    minChoice: z.number().min(0),
    maxChoice: z.number().min(1),

    choiceType: z.enum(["NUMBER", "CHECKBOX"]), // Derived usually, or explicit
    choices: z.array(AddonChoiceSchema).min(1, "At least 1 choice is required"),

    compulsory: z.number().optional(), // Older field, maybe map minChoice to this?
  })
  .refine(
    (data) => {
      return data.maxChoice >= data.minChoice;
    },
    {
      message: "Max choice must be greater than or equal to Min choice",
      path: ["maxChoice"],
    },
  );

export type AddonFormValues = z.infer<typeof AddonFormSchema>;

export const BulkAddonRowSchema = z.object({
  name: z.string().min(1),
  min: z.number().min(0),
  max: z.number().min(1),
  type: z.enum(["NUMBER", "CHECKBOX"]),
  choices: z.array(AddonChoiceSchema).min(1),
});
