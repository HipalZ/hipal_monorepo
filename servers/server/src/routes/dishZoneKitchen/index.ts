// books.ts
import { Business, Dish, DishZoneKitchen, Kitchen, Zone } from "@hi/db-models";
import {
  type DishZoneKitchenType,
  dishZoneKitchenSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import z from "zod";
import { respond } from "../../utils/response";
//
const dishZoneKitchenRouter = new Hono()
  .get(
    "/business/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      // Fetch all DishZoneKitchen mappings for this business
      const dishZoneKitchens = await DishZoneKitchen.find({
        businessId,
      })
        .lean()
        .select({
          dishId: 1,
          zoneId: 1,
          kitchenId: 1,
          businessId: 1,
          createdAt: 1,
          updatedAt: 1,
        });

      // Format response to match client-side structure
      const formattedData = dishZoneKitchens.map((item: any) => ({
        dishId: item.dishId?.toString() || item.dishId,
        zoneId: item.zoneId?.toString() || item.zoneId,
        kitchenId: item.kitchenId?.toString() || item.kitchenId,
        businessId: item.businessId?.toString() || item.businessId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      return respond(c, "Fetched successfully", false, 200, formattedData);
    },
  )
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        dishZoneKitches: z.array(dishZoneKitchenSchema),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const { dishZoneKitches } = await c.req.json();

        const dishIds = Array.from(
          new Set(
            dishZoneKitches.map((item: DishZoneKitchenType) => item.dishId),
          ),
        );
        const kitchenIds = Array.from(
          new Set(
            dishZoneKitches.map((item: DishZoneKitchenType) => item.kitchenId),
          ),
        );
        const zoneIds = Array.from(
          new Set(
            dishZoneKitches.map((item: DishZoneKitchenType) => item.zoneId),
          ),
        );
        const businessIds = Array.from(
          new Set(
            dishZoneKitches.map((item: DishZoneKitchenType) => item.businessId),
          ),
        );

        const [dishes, kitchens, zones, businesses] = await Promise.all([
          Dish.find({ _id: { $in: dishIds }, isDeleted: false })
            .select("_id")
            .lean(),
          Kitchen.find({ _id: { $in: kitchenIds } })
            .select("_id")
            .lean(),
          Zone.find({ _id: { $in: zoneIds }, isDeleted: false })
            .select("_id")
            .lean(),
          Business.find({ _id: { $in: businessIds } })
            .select("_id")
            .lean(),
        ]);

        const dishSet = new Set(dishes.map((d) => d._id.toString()));
        const kitchenSet = new Set(kitchens.map((k) => k._id.toString()));
        const zoneSet = new Set(zones.map((z) => z._id.toString()));
        const businessSet = new Set(businesses.map((b) => b._id.toString()));

        for (const item of dishZoneKitches) {
          if (!dishSet.has(item.dishId.toString())) {
            return respond(c, `Dish not found: ${item.dishId}`, true, 404, {});
          }
          if (!kitchenSet.has(item.kitchenId.toString())) {
            return respond(
              c,
              `Kitchen not found: ${item.kitchenId}`,
              true,
              404,
              {},
            );
          }
          if (!zoneSet.has(item.zoneId.toString())) {
            return respond(c, `Zone not found: ${item.zoneId}`, true, 404, {});
          }
          if (!businessSet.has(item.businessId.toString())) {
            return respond(
              c,
              `Business not found: ${item.businessId}`,
              true,
              404,
              {},
            );
          }
        }

        const bulkOps = dishZoneKitches.map((item: DishZoneKitchenType) => ({
          updateOne: {
            filter: {
              dishId: item.dishId,
              zoneId: item.zoneId,
            },
            update: {
              $set: {
                kitchenId: item.kitchenId,
                businessId: item.businessId,
              },
            },
            upsert: true,
          },
        }));

        await DishZoneKitchen.bulkWrite(bulkOps, { session });

        return respond(c, "Records updated successfully", false, 200, {});
      });
    },
  )
  .get(
    "/:dishId",
    zValidator(
      "param",
      z.object({
        dishId: z.string(),
      }),
    ),
    async (c) => {
      const { dishId } = c.req.param();

      const dishZoneKitchens = await DishZoneKitchen.find({
        dishId,
      })
        .populate("dishId", "name")
        .populate("kitchenId", "name")
        .populate("zoneId", "name")
        .lean();

      const formattedData = dishZoneKitchens.map((item: any) => ({
        dishId: item.dishId?._id || item.dishId,
        dishName: item.dishId?.name || "",
        kitchenId: item.kitchenId?._id || item.kitchenId,
        kitchenName: item.kitchenId?.name || "",
        zoneId: item.zoneId?._id || item.zoneId,
        zoneName: item.zoneId?.name || "",
      }));

      return respond(c, "Fetched successfully", false, 200, formattedData);
    },
  )

  .get(
    "/:dishId/:zoneId",
    zValidator(
      "param",
      z.object({
        dishId: z.string(),
      }),
    ),
    async (c) => {
      const { dishId, zoneId } = c.req.param();

      const dishZoneKitchens = await DishZoneKitchen.find({
        dishId,
        zoneId,
      })
        .populate("dishId", "name")
        .populate("kitchenId", "name")
        .populate("zoneId", "name")
        .lean();

      const formattedData = dishZoneKitchens.map((item: any) => ({
        dishId: item.dishId?._id || item.dishId,
        dishName: item.dishId?.name || "",
        kitchenId: item.kitchenId?._id || item.kitchenId,
        kitchenName: item.kitchenId?.name || "",
        zoneId: item.zoneId?._id || item.zoneId,
        zoneName: item.zoneId?.name || "",
      }));

      return respond(c, "Fetched successfully", false, 200, formattedData);
    },
  )
  .get(
    "/dishes/:businessId/:zoneId",
    zValidator(
      "param",
      z.object({
        zoneId: z.string(),
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { zoneId, businessId } = c.req.param();

      const dishZoneKitchens = await DishZoneKitchen.find({
        zoneId,
        businessId,
      })
        .populate("dishId", "name")
        .populate("kitchenId", "name")
        .populate("zoneId", "name")
        .lean();

      const formattedData = dishZoneKitchens.map((item: any) => ({
        dishId: item.dishId?._id || item.dishId,
        dishName: item.dishId?.name || "",
        kitchenId: item.kitchenId?._id || item.kitchenId,
        kitchenName: item.kitchenId?.name || "",
        zoneId: item.zoneId?._id || item.zoneId,
        zoneName: item.zoneId?.name || "",
      }));

      return respond(c, "Fetched successfully", false, 200, formattedData);
    },
  );

export default dishZoneKitchenRouter;
