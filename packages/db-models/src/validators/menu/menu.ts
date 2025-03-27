import mongoose from "mongoose";
import { z } from "zod";

// Optimized ObjectId schema using a union of a valid instance and a valid string
export const objectIdSchema = z.union([
  z.instanceof(mongoose.Types.ObjectId),
  z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
]);

export const MENU_TYPES = { MAIN_SUB_DISH: 1, SUB_DISH: 2 } as const;
export type MenuType = (typeof MENU_TYPES)[keyof typeof MENU_TYPES];

export const MENU_DAYS = {
  SUNDAY: 1,
  MONDAY: 2,
  TUESDAY: 3,
  WEDNESDAY: 4,
  THURSDAY: 5,
  FRIDAY: 6,
  SATURDAY: 7,
} as const;
export type MenuDay = (typeof MENU_DAYS)[keyof typeof MENU_DAYS];

export const CATEGORY_LAYOUT_TYPES = {
  EDGE: 1,
  CLASSIC: 2,
} as const;
export type CategoryLayout =
  (typeof CATEGORY_LAYOUT_TYPES)[keyof typeof CATEGORY_LAYOUT_TYPES];

export const CARD_LAYOUT_TYPES = {
  GRID: 1,
  HORIZONTAL: 2,
} as const;
export type CardLayout =
  (typeof CARD_LAYOUT_TYPES)[keyof typeof CARD_LAYOUT_TYPES];

export const MenuSchema = z
  .object({
    name: z.string().min(1).max(50),
    businessId: objectIdSchema,
    zoneIds: z
      .array(objectIdSchema)
      .nonempty({ message: "zoneIds cannot be empty" }),
    menuType: z.nativeEnum(MENU_TYPES).default(MENU_TYPES.MAIN_SUB_DISH),
    days: z
      .nativeEnum(MENU_DAYS)
      .array()
      .default([
        MENU_DAYS.SUNDAY,
        MENU_DAYS.MONDAY,
        MENU_DAYS.TUESDAY,
        MENU_DAYS.WEDNESDAY,
        MENU_DAYS.THURSDAY,
        MENU_DAYS.FRIDAY,
        MENU_DAYS.SATURDAY,
      ]),
    categoryLayout: z
      .nativeEnum(CATEGORY_LAYOUT_TYPES)
      .default(CATEGORY_LAYOUT_TYPES.EDGE),
    cardLayout: z.nativeEnum(CARD_LAYOUT_TYPES).default(CARD_LAYOUT_TYPES.GRID),
    startTime: z.coerce.number().optional(),
    endTime: z.coerce.number().optional(),
    extendTime: z.coerce.number().optional(),
    sourceMenuId: objectIdSchema.optional(),
    isActive: z.boolean().optional().default(false),
    isDeleted: z.boolean().optional().default(false),
    dishIds: z.array(objectIdSchema).optional().default([]),
    categoryIds: z.array(objectIdSchema).optional().default([]),
    copyCompleteMenu: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      const dishCount = data.dishIds.length;
      const categoryCount = data.categoryIds.length;
      const hasDish = dishCount > 0;
      const hasCategory = categoryCount > 0;
      const hasSource =
        data.sourceMenuId !== undefined && data.sourceMenuId !== null;

      if (hasDish && hasCategory) return false;

      if (data.copyCompleteMenu) {
        if (hasDish || hasCategory) return false;
        if (!hasSource) return false;
      }

      if ((hasDish || hasCategory) && !hasSource) return false;

      if (!hasSource) {
        if (hasDish || hasCategory) return false;
        if (data.copyCompleteMenu === true) return false;
      }
      return true;
    },
    {
      message:
        "Invalid combination: Provide either dishIds or categoryIds exclusively with a required sourceMenuId; if copyCompleteMenu is true, dishIds and categoryIds must be empty and sourceMenuId must be provided; if sourceMenuId is undefined, then one of dishIds or categoryIds must be empty and copyCompleteMenu must be false.",
      path: ["dishIds", "categoryIds", "sourceMenuId", "copyCompleteMenu"],
    },
  );

export const UpdateMenuSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  zoneIds: z.array(objectIdSchema).optional(),

  menuType: z.nativeEnum(MENU_TYPES).optional(),
  days: z.nativeEnum(MENU_DAYS).array().optional(),
  categoryLayout: z.nativeEnum(CATEGORY_LAYOUT_TYPES).optional(),

  cardLayout: z.nativeEnum(CARD_LAYOUT_TYPES).optional(),
  startTime: z.coerce.number().optional(),
  endTime: z.coerce.number().optional(),
  extendTime: z.coerce.number().optional(),
  isActive: z.boolean().optional().default(false),
  isDeleted: z.boolean().optional().default(false),
  menuId: objectIdSchema,
});

// Export the inferred Menu type
export type MenuTypeValidator = z.infer<typeof MenuSchema>;
