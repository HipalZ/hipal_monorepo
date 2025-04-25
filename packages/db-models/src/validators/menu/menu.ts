import { z } from "zod";

export const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });
export const MENU_TYPES = { MAIN_SUB_DISH: 1, SUB_DISH: 2 } as const;
export type MenuType = (typeof MENU_TYPES)[keyof typeof MENU_TYPES];

export const MENU_DAYS = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
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

export const MenuSchema = z.object({
  name: z.string().min(1).max(50),
  businessId: ObjectIdSchema,
  zoneIds: z
    .array(ObjectIdSchema)
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
  sourceMenuId: ObjectIdSchema.optional(),
  isActive: z.boolean().optional().default(false),
  isDeleted: z.boolean().optional().default(false),
  primaryColor: z.string().min(1).max(7),
  secondaryColor: z.string().min(1).max(7),
  default: z.boolean().optional().default(false),
});

export const UpdateMenuSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  zoneIds: z.array(ObjectIdSchema).optional(),
  menuType: z.nativeEnum(MENU_TYPES).optional(),
  days: z.nativeEnum(MENU_DAYS).array().optional(),
  categoryLayout: z.nativeEnum(CATEGORY_LAYOUT_TYPES).optional(),
  cardLayout: z.nativeEnum(CARD_LAYOUT_TYPES).optional(),
  startTime: z.coerce.number().optional(),
  endTime: z.coerce.number().optional(),
  isActive: z.boolean().optional().default(false),
  isDeleted: z.boolean().optional().default(false),
  menuId: ObjectIdSchema,
  primaryColor: z.string().min(1).max(7).optional(),
  secondaryColor: z.string().min(1).max(7).optional(),
});

// Export the inferred Menu type
export type MenuTypeValidator = z.infer<typeof MenuSchema>;
