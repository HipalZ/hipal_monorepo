import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const TableStatusEnum = ["ACTIVE", "EMPTY", "BILL"] as const;
export const tableSchema = z.object({
  name: z
    .string({
      message: "name is required",
    })
    .min(1, {
      message: "name must be atleast 3 characters long",
    })
    .max(100, {
      message: "name must be atmost 100 characters long",
    }),

  visibility: z.boolean().default(true).optional(),
  businessId: ObjectIdSchema,
  zoneId: z.string().min(4).max(100).optional(),
  staffIds: z.array(ObjectIdSchema).optional(),
  capacity: z.number().optional(),
  displayForCaptains: z.boolean().default(true).optional(),

  tableId: z.string().min(3).max(100).optional(),
  hiCode: z.string().min(3).max(100).optional(),

  active: z.boolean().default(true).optional(),
  rank: z.string().min(1).max(30).optional(),
  status: z.enum(TableStatusEnum).default("EMPTY"),
  totalItemCount: z.number().default(0).optional(),
  userIds: z.array(ObjectIdSchema).default([]).optional(),
  currentTableAmount: z.number().default(0).optional(),
  date: z.number().optional(),
  isDeleted: z.boolean().default(false).optional(),
  isTransfer: z.boolean().default(false).optional(),
  edited: z.boolean().default(false).optional(),
  editedBy: ObjectIdSchema.optional(),
  internalZoneId: ObjectIdSchema.optional(),
  tableLink: z.string().min(3).max(60).optional(),
  pos: z.boolean().default(false).optional(),
});

export const createTableSchema = z.object({
  name: z
    .string({
      message: "name is required",
    })
    .min(1, {
      message: "name must be atleast 3 characters long",
    })
    .max(100, {
      message: "name must be atmost 100 characters long",
    })
    .trim(),
  businessId: ObjectIdSchema,
  staffIds: z.array(ObjectIdSchema).optional(),
  capacity: z.number().optional(),
  visibility: z.boolean().default(true),

  internalZoneId: ObjectIdSchema,
});

export const updateTableSchema = z.object({
  name: z
    .string({
      message: "name is required",
    })
    .min(1, {
      message: "name must be atleast 3 characters long",
    })
    .max(100, {
      message: "name must be atmost 100 characters long",
    }),
  businessId: ObjectIdSchema,
  staffIds: z.array(ObjectIdSchema).optional(),
  capacity: z.number().optional(),
  visibility: z.boolean().default(true),
  tableId: z.string().min(3).max(100).optional(),

  internalZoneId: ObjectIdSchema,
});

export type TableType = z.infer<typeof tableSchema>;
