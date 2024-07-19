// books.ts
import { Category, Dish, UniquelyYours } from "@hi/db-models";
import {
  dishSchema,
  uniquelyYoursSchema,
  updateDishSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { z } from "zod";
import {
  ClientRoles,
  requireAuthorization,
} from "../../../middleware/authorization";
import { authTokenValidator } from "../../../middleware/tokenValidator";
import { respond } from "../../utils/response";

const dishesRouter = new Hono()
  .get(
    "/",

    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        UniquelyYours: z.string().optional(),
        menu: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, UniquelyYours, menu } = c.req.query();
      if (UniquelyYours) {
        const existingDishes = await Dish.find({
          businessId,
          "categoryIds.0": { $exists: true },
        }).select(
          "_id businessId name availability dishTypes visibility price categoryIds addOnIds recommendationIds",
        );
        return respond(
          c,
          "Dishes fetched successfully",
          false,
          200,
          existingDishes,
        );
      }

      if (menu) {
        const existingDishes = await Dish.find({
          businessId,
          isDeleted: false,
        }).select(
          " _id businessId name availability dishTypes visibility price categoryIds addOnIds recommendationIds",
        );
        return respond(
          c,
          "Dishes fetched successfully",
          false,
          200,
          existingDishes,
        );
      }

      const existingDishes = await Dish.find({
        businessId,
      }).populate(["categoryIds", "addOnIds"]);

      return respond(
        c,
        "Dishes fetched successfully",
        false,
        200,
        existingDishes,
      );
    },
  )
  .put(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    zValidator("json", updateDishSchema),
    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const { id } = c.req.param();
        const dish = await c.req.json();
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
          addOnIds = [],
          recommendationIds = [],
          removeCategoryIds = [],
          removeAddOnIds = [],
          removeRecommendationIds = [],
        } = dish;
        const existingDish = await Dish.findById(id);
        if (!existingDish) return respond(c, "Dish not found", true, 404, {});
        const updatedDish = await Dish.findByIdAndUpdate(
          id,
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
        if (!updatedDish)
          return respond(c, "Error in updating dish", true, 400, {});

        if (removeCategoryIds.length) {
          await Category.updateMany(
            { _id: { $in: removeCategoryIds } },
            { $pull: { dishIds: id } },
          );

          await Dish.findByIdAndUpdate(id, {
            $pull: { categoryIds: { $in: removeCategoryIds } },
          });
        }

        if (removeAddOnIds.length) {
          await Dish.findByIdAndUpdate(id, {
            $pull: { addOnIds: { $in: removeAddOnIds } },
          });
        }

        if (removeRecommendationIds.length) {
          await Dish.findByIdAndUpdate(id, {
            $pull: { recommendationIds: { $in: removeRecommendationIds } },
          });
        }

        if (categoryIds.length) {
          await Category.updateMany(
            { _id: { $in: categoryIds } },
            { $addToSet: { dishIds: id } },
            { session },
          );

          await Dish.findByIdAndUpdate(
            id,
            { $addToSet: { categoryIds: { $each: categoryIds } } },
            { session },
          );
        }

        if (addOnIds.length) {
          await Dish.findByIdAndUpdate(
            id,
            { $addToSet: { addOnIds: { $each: addOnIds } } },
            { session },
          );
        }

        if (recommendationIds.length) {
          await Dish.findByIdAndUpdate(
            id,
            { $addToSet: { recommendationIds: { $each: recommendationIds } } },
            { session },
          );
        }

        return respond(c, "Dish updated successfully", false, 200, updatedDish);
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

        const existingDish = await Dish.findByIdAndUpdate(id, {
          isDeleted: true,
        });
        if (!existingDish) return respond(c, "Dish not found", true, 404, {});

        await Category.updateMany(
          { _id: { $in: existingDish.categoryIds ?? [] } },
          { $pull: { dishIds: id } },
        );

        return respond(c, "Dish deleted successfully", false, 200, {});
      });
    },
  )
  .post(
    "/",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("json", dishSchema),
    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const dish = await c.req.json();
        const createDish = await Dish.create([dish], { session });
        if (!createDish)
          return respond(c, "Error in creating dish", true, 400, {});

        await Category.updateMany(
          { _id: { $in: dish.categoryIds ?? [] } },
          { $push: { dishIds: createDish[0]._id } },
          { session },
        );

        return respond(c, "Dish created successfully", false, 201, createDish);
      });
    },
  )
  .post(
    "/uniquelyYours",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator(
      "json",
      z.object({
        dishArray: z.array(uniquelyYoursSchema),
      }),
    ),

    async (c) => {
      const { dishArray } = await c.req.json();
      const businessId = dishArray[0]?.businessId;
      const removeOldDishes = await UniquelyYours.updateMany(
        { businessId },
        { isDeleted: true },
      );
      if (!removeOldDishes)
        return respond(c, "Error in updating dishes", true, 400, {});
      const createUniquelyYours = await UniquelyYours.insertMany(dishArray);
      if (!createUniquelyYours)
        return respond(c, "Error in updating dishes", true, 400, {});

      return respond(
        c,
        "Dishes updated successfully",
        false,
        201,
        createUniquelyYours,
      );
    },
  )
  .get(
    "/uniquelyDishes/:businessId",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("param", z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.param();

      const dishes = await UniquelyYours.find({ businessId, isDeleted: false });

      return respond(c, "Dishes fetched successfully", false, 200, dishes);
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
      const existingDish = await Dish.findOne({ _id: id, isDeleted: false });
      if (!existingDish) return respond(c, "Dish not found", true, 404, {});
      return respond(c, "Dish fetched successfully", false, 200, existingDish);
    },
  );

export default dishesRouter;
