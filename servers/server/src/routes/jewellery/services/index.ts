// books.ts
import { Category, Dish, UniquelyYours } from "@hi/db-models";

import {
  serviceChema,
  updateServiceSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { z } from "zod";
import { respond } from "../../../utils/response";
//
const serviceRouter = new Hono()
  .post(
    "/",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("json", serviceChema),
    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const serviceData = await c.req.json();

        const serviceAlreadyExists = await Dish.findOne({
          businessId: serviceData.businessId,
          name: serviceData.name,
          isDeleted: false,
          active: true,
        });
        if (serviceAlreadyExists)
          return respond(c, "Already exists", true, 400, {});

        const createService = await Dish.create([serviceData], { session });
        if (!createService)
          return respond(c, "Error in creating", true, 400, {});

        await Category.updateMany(
          { _id: { $in: serviceData.categoryIds ?? [] } },
          { $push: { dishIds: createService[0]._id } },
          { session },
        );

        return respond(c, "Created successfully", false, 201, {
          _id: createService[0]._id,
        });
      });
    },
  )
  .get(
    "/",

    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        // menuId: z.string(),
      }),
    ),
    async (c) => {
      const { businessId, menuId } = c.req.query();

      const query = {
        businessId,
        isDeleted: false,
        active: true,
        menuId,
      };

      const existingDishes = await Dish.find(query);

      return respond(c, "Fetched successfully", false, 200, existingDishes);
    },
  )

  .get(
    "/:businessId/special",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("param", z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.param();

      const dishes = await UniquelyYours.find({ businessId, isDeleted: false });

      return respond(c, "fetched successfully", false, 200, dishes);
    },
  )

  .put(
    "/:serviceId",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("json", updateServiceSchema),
    zValidator("param", z.object({ serviceId: z.string() })),

    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const { serviceId } = c.req.param();
        const service = await c.req.json();
        const {
          name,
          dishTypes,
          availability,
          visibility,
          portions,
          price,
          images,
          description,
          tags,
          categoryIds = [],
          recommendationIds = [],
          removeCategoryIds = [],
          removeRecommendationIds = [],
        } = service;

        const updatedService = await Dish.findByIdAndUpdate(
          serviceId,
          {
            name,
            dishTypes,
            availability,
            visibility,
            portions,
            price,
            images,
            description,
            tags,
          },
          {
            new: true,
            session: session,
          },
        );
        if (!updatedService)
          return respond(c, "Error in updating", true, 400, {});

        if (removeCategoryIds.length) {
          await Category.updateMany(
            { _id: { $in: removeCategoryIds } },
            { $pull: { dishIds: serviceId } },
            { session },
          );

          await Dish.findByIdAndUpdate(
            serviceId,
            {
              $pull: { categoryIds: { $in: removeCategoryIds } },
            },
            { session },
          );
        }

        if (removeRecommendationIds.length) {
          await Dish.findByIdAndUpdate(
            serviceId,
            {
              $pull: { recommendationIds: { $in: removeRecommendationIds } },
            },
            { session },
          );
        }

        if (categoryIds.length) {
          await Category.updateMany(
            { _id: { $in: categoryIds } },
            { $addToSet: { dishIds: serviceId } },
            { session },
          );

          await Dish.findByIdAndUpdate(
            serviceId,
            { $addToSet: { categoryIds: { $each: categoryIds } } },
            { session },
          );
        }

        if (recommendationIds.length) {
          await Dish.findByIdAndUpdate(
            serviceId,
            { $addToSet: { recommendationIds: { $each: recommendationIds } } },
            { session },
          );
        }

        return respond(c, "Updated successfully", false, 200, {});
      });
    },
  )
  .delete(
    "/:serviceId",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("param", z.object({ serviceId: z.string() })),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { serviceId } = c.req.param();

        const fetchService = await Dish.findById(serviceId);
        if (!fetchService) {
          return respond(c, "not found", true, 404, {});
        }

        const existingService = await Dish.findByIdAndUpdate(serviceId, {
          isDeleted: true,
        });
        if (!existingService) return respond(c, "Not found", true, 404, {});

        await Category.updateMany(
          { _id: { $in: existingService.categoryIds ?? [] } },
          { $pull: { dishIds: serviceId } },
        );

        return respond(c, "Deleted successfully", false, 200, {});
      });
    },
  );

export default serviceRouter;
