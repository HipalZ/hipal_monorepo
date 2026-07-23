import { z } from "zod";
import { ObjectIdSchema } from "../common";

/**
 * Room-checkout automation.
 *
 * Deliberately separate from the guest alert flow: these tasks are raised by
 * the system after a guest has left, so there is no guest to attribute them to,
 * no room chat to post into, and the audience is a floor rather than a room.
 */

/** A service in the checkout group, with the SLA this module applies to it. */
export const checkoutGroupService = z.object({
  serviceId: ObjectIdSchema,
  acceptMins: z.number().min(1).max(120).default(2),
  completeMins: z.number().min(1).max(600).default(45),
});

export const hotelCheckoutGroup = z.object({
  businessId: ObjectIdSchema,
  name: z.string().min(1).max(60).default("Room checkout"),
  isActive: z.boolean().default(true),
  services: z.array(checkoutGroupService).default([]),
  /** How long the floor's own staff get before the task widens or escalates. */
  floorWindowMins: z.number().min(1).max(120).default(2),
  /** Off by default: work stays with the floor, then goes to the manager. */
  widenToOtherFloors: z.boolean().default(false),
  otherFloorsWindowMins: z.number().min(1).max(120).default(2),
  notifyManager: z.boolean().default(true),
});

export const upsertHotelCheckoutGroup = hotelCheckoutGroup.partial().extend({
  businessId: ObjectIdSchema,
});

export const checkoutTaskStatusEnum = [
  "PENDING",
  "ACCEPTED",
  "COMPLETED",
  "CANCELLED",
] as const;

/** Who the task is currently being offered to. */
export const checkoutTaskStageEnum = ["FLOOR", "ALL_FLOORS", "MANAGER"] as const;

export const hotelCheckoutTask = z.object({
  businessId: ObjectIdSchema,
  roomId: ObjectIdSchema,
  zoneId: ObjectIdSchema.optional(),
  groupId: ObjectIdSchema,
  serviceId: ObjectIdSchema,
  /** `${roomId}:${checkoutAt}` — unique, so a retried trigger cannot duplicate. */
  checkoutRef: z.string().min(1),
  // Copied from the group at creation: editing config later must not rewrite
  // the SLA a past task was judged against.
  acceptMins: z.number(),
  completeMins: z.number(),
  // The guest who just checked out — captured at trigger time, because the
  // room's occupant list is already cleared by then. Lets the report show who
  // stayed, not just the front-office person who pressed checkout.
  guestName: z.string().optional(),
  guestPhone: z.string().optional(),
  // Ordered occupant snapshot: [0] is the primary guest, the rest companions.
  guests: z
    .array(
      z.object({
        userId: ObjectIdSchema.optional(),
        name: z.string().optional(),
        phone: z.string().optional(),
      }),
    )
    .default([]),
  status: z.enum(checkoutTaskStatusEnum).default("PENDING"),
  stage: z.enum(checkoutTaskStageEnum).default("FLOOR"),
  audienceStaffIds: z.array(ObjectIdSchema).default([]),
  createdAt: z.number(),
  acceptDueAt: z.number(),
  completeDueAt: z.number().optional(),
  acceptedAt: z.number().optional(),
  acceptedBy: ObjectIdSchema.optional(),
  completedAt: z.number().optional(),
  completedBy: ObjectIdSchema.optional(),
  escalatedAt: z.number().optional(),
  overdueNotifiedAt: z.number().optional(),
  triggeredBy: ObjectIdSchema.optional(),
});

export const triggerCheckoutTasks = z.object({
  businessId: ObjectIdSchema,
  roomId: ObjectIdSchema,
  triggeredBy: ObjectIdSchema.optional(),
  /** Supplied by the caller so a retry produces the same idempotency key. */
  checkoutAt: z.number().optional(),
  // The departing guest, captured before checkout clears the room. `guests`
  // carries every occupant in order (primary first, then companions);
  // guestName/guestPhone remain for callers that only know the primary.
  guestName: z.string().optional(),
  guestPhone: z.string().optional(),
  guests: z
    .array(
      z.object({
        userId: ObjectIdSchema.optional(),
        name: z.string().optional(),
        phone: z.string().optional(),
      }),
    )
    .optional(),
});

export const actOnCheckoutTask = z.object({
  taskId: ObjectIdSchema,
  userId: ObjectIdSchema,
});

export type HotelCheckoutGroupType = z.infer<typeof hotelCheckoutGroup>;
export type HotelCheckoutTaskType = z.infer<typeof hotelCheckoutTask>;
export type CheckoutTaskStatus = (typeof checkoutTaskStatusEnum)[number];
export type CheckoutTaskStage = (typeof checkoutTaskStageEnum)[number];
