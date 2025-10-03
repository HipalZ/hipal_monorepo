import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const staffshiftBreakSchema = z.object({
  startTime: z.number().default(Date.now()),
  endTime: z.number().default(Date.now()),
});

export const staffAttendenceSchema = z.object({
  staffId: ObjectIdSchema,
  createdAt: z.number().default(Date.now()),
  activeHrs: z.number().default(0),
  lastActiveAt: z.number().default(Date.now()),
  shiftBreaks: z.array(staffshiftBreakSchema).default([]),
  action: z.enum(["IN", "OUT"]),
  businessId: ObjectIdSchema,
});

export type StaffAttendenceTypeValidator = z.infer<
  typeof staffAttendenceSchema
>;

export type StaffshiftBreakTypeValidator = z.infer<
  typeof staffshiftBreakSchema
>;
