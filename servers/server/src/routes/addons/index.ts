import { AddOn, Dish } from "@hi/db-models";
import {
  type AddOnType,
  AddOnsAttrs,
  updateAddOnSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
// books.ts
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { z } from "zod";
import { respond } from "../../utils/response";
const addonRouter = new Hono()
  .post(
    "/",

    //   authTokenValidator,
    //   requireAuthorization([ClientRoles.OWNER, ClientRoles.CO_OWNER]),
    zValidator("json", AddOnsAttrs),

    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const requestData = (await c.req.json()) as AddOnType;

        const existingAddon = await AddOn.findOne({
          name: requestData.name,
          businessId: requestData.businessId,
        });

        if (existingAddon) return respond(c, "already exist", true, 409, {});

        const addon = await AddOn.create(requestData);

        if (!addon) return respond(c, "failed", true, 400, addon);

        if (requestData.dishIds && requestData.dishIds.length > 0) {
          await Dish.updateMany(
            { _id: { $in: requestData.dishIds } },
            { $push: { addOnIds: addon._id } },
          );
        }

        return respond(c, "success", false, 201, addon);
      });
    },
  )
  .put(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    zValidator("json", updateAddOnSchema),
    async (c) => {
      return await runInTransaction(async (session: ClientSession) => {
        const { id } = c.req.param();
        const requestData = (await c.req.json()) as AddOnType;

        const { dishIds } = requestData;

        const addOn = await AddOn.findById(id);

        if (dishIds && dishIds.length > 0) {
          const findDishes = await Dish.find({
            _id: { $in: dishIds },
          }).select("_id addOnIds");

          const removeDisheIds: string[] = [];

          const filter = findDishes.filter((dish) =>
            dish.addOnIds.map((id) => id.toString()).includes(id.toString()),
          );

          for (const dish of filter) {
            removeDisheIds.push(dish._id.toString());
          }

          const filteredDishIds = dishIds.filter(
            (id: string) => !removeDisheIds.includes(id),
          );

          await Dish.updateMany(
            { _id: { $in: dishIds } },
            { $pull: { addOnIds: id } },
            { session },
          );

          await Dish.updateMany(
            { _id: { $in: filteredDishIds } },
            { $addToSet: { addOnIds: id } },
            { session },
          );
        }

        return respond(c, "success", false, 200, addOn);
      });
    },
  )
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const { id } = c.req.param();

        const addon = await AddOn.findByIdAndUpdate(id, { isDeleted: true });

        if (!addon) return respond(c, "not found", true, 404, {});

        await Dish.updateMany(
          { addOnIds: id },
          { $pull: { addOnIds: id } },
          { session },
        );

        return respond(c, "success", false, 200, addon);
      });
    },
  )
  .get(
    "/:id",

    zValidator(
      "param",
      z.object({
        id: z.string(),
      }),
    ),

    async (c) => {
      const { id } = c.req.param();

      const addon = await AddOn.findOne({ _id: id, isDeleted: false });

      if (!addon) return respond(c, "not found", true, 404, {});

      return respond(c, "success", false, 200, addon);
    },
  )
  .get(
    "/",

    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        menu: z.string().optional(),
      }),
    ),

    async (c) => {
      const { businessId, menu } = c.req.query();

      if (menu) {
        const addon = await AddOn.find({ businessId, isDeleted: false }).select(
          "_id name choices availability visibility ",
        );
        return respond(c, "success", false, 200, addon);
      }

      const addon = await AddOn.find({ businessId, isDeleted: false });

      return respond(c, "success", false, 200, addon);
    },
  );

export default addonRouter;
