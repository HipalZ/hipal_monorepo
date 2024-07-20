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
import {
  ClientRoles,
  requireAuthorization,
} from "../../../middleware/authorization";
import { authTokenValidator } from "../../../middleware/tokenValidator";
import { respond } from "../../utils/response";
const addonRouter = new Hono()
  .post(
    "/",

    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.CO_OWNER]),
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

        return respond(c, "addon created successFully !", false, 201, addon);
      });
    },
  )
  .put(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    zValidator("json", updateAddOnSchema),
    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const { id } = c.req.param();
        const requestData = await c.req.json();
        const { dishIds = [], removeDishIds = [] } = requestData;

        const addOn = await AddOn.findById(id);

        if (!addOn) return respond(c, "not found", true, 404, {});

        const updatedAddOn = await AddOn.findByIdAndUpdate(
          id,
          {
            visibility: requestData.visibility,
            availability: requestData.availability,
            name: requestData.name,
            choices: requestData.choices,
            choiceType: requestData.choiceType,
          },
          {
            session,
          },
        );

        if (!updatedAddOn) return respond(c, "failed", true, 400, {});

        if (removeDishIds.length > 0) {
          await Dish.updateMany(
            { _id: { $in: removeDishIds } },
            { $pull: { addOnIds: id } },
            { session },
          );
        }

        if (dishIds.length > 0) {
          await Dish.updateMany(
            { _id: { $in: dishIds } },
            { $push: { addOnIds: id } },
            { session },
          );
        }
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
