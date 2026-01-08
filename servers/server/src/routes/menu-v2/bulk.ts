/**
 * Menu V2 Bulk Update Routes
 *
 * Provides bulk update endpoints for dishes, categories, and addons.
 * Designed for offline-first Menu V2 module that accumulates draft operations.
 */

import { AddOn, Category, Dish } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { z } from "zod";
import { respond } from "../../utils/response";

// Common schemas
const uuidSchema = z.string().uuid();
const mongoIdSchema = z.string().min(1);

// Dish patch schema (only allowed fields for fast updates)
const dishPatchSchema = z
  .object({
    name: z.string().min(1).optional(),
    availability: z.boolean().optional(),
    visibility: z.boolean().optional(),
    price: z.number().min(0).optional(),
    images: z.array(z.string()).max(3).optional(),
    portions: z
      .array(
        z.object({
          _id: z.string().optional(),
          name: z.string().optional(),
          price: z.number().min(0).optional(),
          portionTypes: z.array(z.string()).optional(),
          default: z.boolean().optional(),
        }),
      )
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided in patch",
  });

// Category patch schema
const categoryPatchSchema = z
  .object({
    name: z.string().min(1).optional(),
    visibility: z.boolean().optional(),
    availability: z.boolean().optional(),
    sequence: z.number().optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided in patch",
  });

// Addon patch schema
const addonPatchSchema = z
  .object({
    name: z.string().min(1).optional(),
    availability: z.boolean().optional(),
    visibility: z.boolean().optional(),
    compulsory: z.coerce.number().min(0).max(1).optional(),
    addOnMaxQuantity: z.number().min(1).optional(),
    choiceType: z.enum(["SINGLE", "MULTIPLE"]).optional(),
    choices: z
      .array(
        z.object({
          _id: z.string().optional(),
          name: z.string().optional(),
          price: z.number().optional(),
          visibility: z.boolean().optional(),
          availability: z.boolean().optional(),
          max: z.number().optional(),
        }),
      )
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided in patch",
  });

// Bulk update request schemas
const bulkDishUpdateSchema = z.object({
  businessId: mongoIdSchema,
  requestId: uuidSchema,
  updates: z
    .array(
      z.object({
        id: mongoIdSchema,
        menuId: mongoIdSchema,
        patch: dishPatchSchema,
        clientUpdatedAt: z.number().optional(),
      }),
    )
    .min(1)
    .max(200),
});

const bulkCategoryUpdateSchema = z.object({
  businessId: mongoIdSchema,
  requestId: uuidSchema,
  updates: z
    .array(
      z.object({
        id: mongoIdSchema,
        menuId: mongoIdSchema,
        patch: categoryPatchSchema,
        clientUpdatedAt: z.number().optional(),
      }),
    )
    .min(1)
    .max(200),
});

const bulkAddonUpdateSchema = z.object({
  businessId: mongoIdSchema,
  requestId: uuidSchema,
  updates: z
    .array(
      z.object({
        id: mongoIdSchema,
        menuId: mongoIdSchema,
        patch: addonPatchSchema,
        clientUpdatedAt: z.number().optional(),
      }),
    )
    .min(1)
    .max(200),
});

const bulkRouter = new Hono()
  .post("/dishes", zValidator("json", bulkDishUpdateSchema), async (c) => {
    //@ts-ignore
    return await runInTransaction(async (session: ClientSession) => {
      const { businessId, requestId, updates } = await c.req.json();

      const results: Array<{
        index: number;
        id: string;
        ok: boolean;
        error?: string;
      }> = [];

      // Build bulkWrite operations
      const bulkOps = updates.map((update) => {
        const { id, menuId, patch } = update;

        // Handle portions update specially (nested array update)
        const updateFields: Record<string, unknown> = {};
        if (patch.portions !== undefined) {
          // If portions provided, replace entire array or update specific portions
          updateFields.portions = patch.portions;
        }

        // Add other fields
        if (patch.availability !== undefined)
          updateFields.availability = patch.availability;
        if (patch.visibility !== undefined)
          updateFields.visibility = patch.visibility;
        if (patch.price !== undefined) updateFields.price = patch.price;
        if (patch.images !== undefined) updateFields.images = patch.images;

        return {
          updateOne: {
            filter: {
              _id: id,
              businessId: businessId,
              menuId: menuId,
              isDeleted: false,
            },
            update: {
              $set: updateFields,
            },
          },
        };
      });

      // Execute bulkWrite
      try {
        const bulkResult = await Dish.bulkWrite(bulkOps, { session });

        // Map results - bulkWrite doesn't provide per-item success/failure
        // So we need to verify each update separately
        for (let i = 0; i < updates.length; i++) {
          const update = updates[i];

          // Verify the document exists and matches criteria
          const doc = await Dish.findOne({
            _id: update.id,
            businessId: businessId,
            menuId: update.menuId,
            isDeleted: false,
          }).session(session);

          if (doc) {
            results.push({
              index: i,
              id: update.id,
              ok: true,
            });
          } else {
            results.push({
              index: i,
              id: update.id,
              ok: false,
              error: "not_found",
            });
          }
        }
      } catch (error: unknown) {
        // If bulkWrite fails completely, mark all as failed
        const errorMessage =
          error instanceof Error ? error.message : "bulk_write_error";
        for (let i = 0; i < updates.length; i++) {
          results.push({
            index: i,
            id: updates[i].id,
            ok: false,
            error: errorMessage,
          });
        }
      }

      const okCount = results.filter((r) => r.ok).length;
      const failCount = results.filter((r) => !r.ok).length;

      return respond(
        c,
        `Bulk update completed: ${okCount} succeeded, ${failCount} failed`,
        failCount > 0,
        failCount === updates.length ? 400 : 200,
        {
          requestId,
          okCount,
          failCount,
          results,
        },
      );
    });
  })

  .post(
    "/categories",
    zValidator("json", bulkCategoryUpdateSchema),
    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const { businessId, requestId, updates } = await c.req.json();

        const results: Array<{
          index: number;
          id: string;
          ok: boolean;
          error?: string;
        }> = [];

        const bulkOps = updates.map((update) => {
          const { id, menuId, patch } = update;

          const updateFields: Record<string, unknown> = {};
          if (patch.name !== undefined) updateFields.name = patch.name;
          if (patch.visibility !== undefined)
            updateFields.visibility = patch.visibility;
          if (patch.availability !== undefined)
            updateFields.availability = patch.availability;
          if (patch.sequence !== undefined)
            updateFields.sequence = patch.sequence;
          if (patch.active !== undefined) updateFields.active = patch.active;

          return {
            updateOne: {
              filter: {
                _id: id,
                businessId: businessId,
                menuId: menuId,
                isDeleted: false,
              },
              update: {
                $set: updateFields,
              },
            },
          };
        });

        try {
          await Category.bulkWrite(bulkOps, { session });

          // Verify each update
          for (let i = 0; i < updates.length; i++) {
            const update = updates[i];
            const doc = await Category.findOne({
              _id: update.id,
              businessId: businessId,
              menuId: update.menuId,
              isDeleted: false,
            }).session(session);

            if (doc) {
              results.push({
                index: i,
                id: update.id,
                ok: true,
              });
            } else {
              results.push({
                index: i,
                id: update.id,
                ok: false,
                error: "not_found",
              });
            }
          }
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "bulk_write_error";
          for (let i = 0; i < updates.length; i++) {
            results.push({
              index: i,
              id: updates[i].id,
              ok: false,
              error: errorMessage,
            });
          }
        }

        const okCount = results.filter((r) => r.ok).length;
        const failCount = results.filter((r) => !r.ok).length;

        return respond(
          c,
          `Bulk update completed: ${okCount} succeeded, ${failCount} failed`,
          failCount > 0,
          failCount === updates.length ? 400 : 200,
          {
            requestId,
            okCount,
            failCount,
            results,
          },
        );
      });
    },
  )

  .post("/addons", zValidator("json", bulkAddonUpdateSchema), async (c) => {
    //@ts-ignore
    return await runInTransaction(async (session: ClientSession) => {
      const { businessId, requestId, updates } = await c.req.json();

      const results: Array<{
        index: number;
        id: string;
        ok: boolean;
        error?: string;
      }> = [];

      const bulkOps = updates.map((update) => {
        const { id, menuId, patch } = update;

        const updateFields: Record<string, unknown> = {};
        if (patch.name !== undefined) updateFields.name = patch.name;
        if (patch.availability !== undefined)
          updateFields.availability = patch.availability;
        if (patch.visibility !== undefined)
          updateFields.visibility = patch.visibility;
        if (patch.compulsory !== undefined)
          updateFields.compulsory = patch.compulsory;
        if (patch.addOnMaxQuantity !== undefined)
          updateFields.addOnMaxQuantity = patch.addOnMaxQuantity;
        if (patch.choiceType !== undefined)
          updateFields.choiceType = patch.choiceType;
        if (patch.choices !== undefined) updateFields.choices = patch.choices;

        return {
          updateOne: {
            filter: {
              _id: id,
              businessId: businessId,
              menuId: menuId,
              isDeleted: false,
            },
            update: {
              $set: updateFields,
            },
          },
        };
      });

      try {
        await AddOn.bulkWrite(bulkOps, { session });

        // Verify each update
        for (let i = 0; i < updates.length; i++) {
          const update = updates[i];
          const doc = await AddOn.findOne({
            _id: update.id,
            businessId: businessId,
            menuId: update.menuId,
            isDeleted: false,
          }).session(session);

          if (doc) {
            results.push({
              index: i,
              id: update.id,
              ok: true,
            });
          } else {
            results.push({
              index: i,
              id: update.id,
              ok: false,
              error: "not_found",
            });
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "bulk_write_error";
        for (let i = 0; i < updates.length; i++) {
          results.push({
            index: i,
            id: updates[i].id,
            ok: false,
            error: errorMessage,
          });
        }
      }

      const okCount = results.filter((r) => r.ok).length;
      const failCount = results.filter((r) => !r.ok).length;

      return respond(
        c,
        `Bulk update completed: ${okCount} succeeded, ${failCount} failed`,
        failCount > 0,
        failCount === updates.length ? 400 : 200,
        {
          requestId,
          okCount,
          failCount,
          results,
        },
      );
    });
  });

export default bulkRouter;
