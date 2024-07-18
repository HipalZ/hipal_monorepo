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
        }).select(" _id businessId name dishType images");
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
          " _id businessId name availability dishType visibility price ",
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
      }).populate(["categories", "extras", "filters.dishes"]);

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
          categoryIds,
          addOnIds,
          recommendationIds,
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

        const existingCategoryIds = existingDish.categoryIds || [];
        const updatedCategoryIds = categoryIds || [];

        const existingAddOnIds = existingDish.addOnIds || [];
        const updatedAddOnIds = addOnIds || [];

        const existingRecommendationIds = existingDish.recommendationIds || [];
        const updatedRecommendationIds = recommendationIds || [];

        if (updatedCategoryIds.length > 0) {
          const uniqueFromUpdatedCategoryIds = updatedCategoryIds.filter(
            (id: string) =>
              !existingCategoryIds.map((eid) => eid.toString()).includes(id),
          );
          const sameFromUpdatedCategoryIds = updatedCategoryIds.filter(
            (id: string) =>
              existingCategoryIds.map((eid) => eid.toString()).includes(id),
          );
          await Dish.findByIdAndUpdate(
            id,
            { categoryIds: uniqueFromUpdatedCategoryIds },
            { session },
          );

          await Category.updateMany(
            { _id: { $in: sameFromUpdatedCategoryIds } },
            { $pull: { dishIds: updatedDish._id } },
            { session },
          );

          await Category.updateMany(
            { _id: { $in: uniqueFromUpdatedCategoryIds } },
            { $push: { dishIds: updatedDish._id } },
            { session },
          );
        }

        if (updatedAddOnIds?.length > 0) {
          // Convert existingAddOnIds to a Set for efficient lookup
          const addOnIdsSet = new Set(
            existingAddOnIds.map((eid) => eid.toString()),
          );

          // Iterate over updatedAddOnIds to toggle their presence
          updatedAddOnIds.forEach((id) => {
            if (addOnIdsSet.has(id)) {
              // If ID exists, remove it (toggle off)
              addOnIdsSet.delete(id);
            } else {
              // If ID doesn't exist, add it (toggle on)
              addOnIdsSet.add(id);
            }
          });

          // Convert the Set back to an array
          const finalAddOnIds = Array.from(addOnIdsSet);

          console.log("addOnIdsSet", finalAddOnIds);

          // Update the Dish with the new set of addOnIds
          await Dish.findByIdAndUpdate(
            id,
            { addOnIds: finalAddOnIds },
            { session },
          );
        }

        if (updatedRecommendationIds.length > 0) {
          const updatedRecommendationIdsSet = new Set(
            updatedDish?.recommendationIds.map((eid) => eid.toString()),
          );

          // Step 2: Filter out existing IDs from parentCategoryIds
          const filteredRecommendationIds = updatedRecommendationIds.filter(
            (id) => !updatedRecommendationIdsSet.has(id),
          );

          // Step 3: Add new IDs from updatedCategory.parentCategoryIds that are not in the original parentCategoryIds
          const newRecommendationIds = updatedDish?.recommendationIds.filter(
            (id) => !updatedRecommendationIds.includes(id.toString()),
          );

          // Combine the filtered list with the new IDs
          const finalRecommendationIds = [
            ...filteredRecommendationIds,
            ...newRecommendationIds,
          ];

          await Dish.updateOne(
            { _id: id },
            { recommendationIds: finalRecommendationIds },
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
      const existingDish = await Dish.findById(id).populate("categoryIds");
      if (!existingDish) return respond(c, "Dish not found", true, 404, {});
      return respond(c, "Dish fetched successfully", false, 200, existingDish);
    },
  );

export default dishesRouter;
