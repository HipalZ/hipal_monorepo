import { z } from "zod";
import { ObjectIdSchema } from "../common";

// Optimized ObjectId schema using a union of a valid instance and a valid string

export const serviceTypeEnum = [
  "DINE_IN",
  "TAKE_AWAY",
  "DELIVERY",
  "BASE",
] as const;

export type ServiceType =
  (typeof serviceTypeEnum)[keyof typeof serviceTypeEnum];

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
  COLLAPSE: 3,
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
    businessId: ObjectIdSchema,
    zoneIds: z.array(ObjectIdSchema),

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
    isActive: z.boolean().optional().default(false),
    isDeleted: z.boolean().optional().default(false),
    primaryColor: z.string().min(1).max(7),
    secondaryColor: z.string().min(1).max(7),
    default: z.boolean().optional().default(false),
    // serviceType: z.enum(serviceTypeEnum),
    baseMenuId: ObjectIdSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // if (data.serviceType === "BASE") {
    //   // BASE: zoneIds and baseMenuId are not required
    //   if (data.zoneIds && data.zoneIds.length > 0) {
    //     ctx.addIssue({
    //       code: z.ZodIssueCode.custom,
    //       message: "zoneIds are not allowed for BASE service type",
    //       path: ["zoneIds"],
    //     });
    //   }
    //   if (data.baseMenuId) {
    //     ctx.addIssue({
    //       code: z.ZodIssueCode.custom,
    //       message: "baseMenuId is not allowed for BASE service type",
    //       path: ["baseMenuId"],
    //     });
    //   }
    // } else if (
    //   data.serviceType === "DINE_IN" ||
    //   data.serviceType === "TAKE_AWAY"
    // ) {
    //   // DINE_IN / TAKE_AWAY: zoneIds required, baseMenuId required
    //   if (!data.zoneIds || data.zoneIds.length === 0) {
    //     ctx.addIssue({
    //       code: z.ZodIssueCode.custom,
    //       message: "zoneIds are required for DINE_IN or TAKE_AWAY service type",
    //       path: ["zoneIds"],
    //     });
    //   }
    // }
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
  primaryColor: z.string().min(1).max(7).optional(),
  secondaryColor: z.string().min(1).max(7).optional(),
});

export const pushMenuSchema = z.object({
  baseMenuId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  pushTo: z.enum(["DINE_IN", "TAKE_AWAY"]),
});

// Export the inferred Menu type
export type MenuTypeValidator = z.infer<typeof MenuSchema>;
