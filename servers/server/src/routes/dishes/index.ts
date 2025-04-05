// books.ts
import {
  AddOn,
  Business,
  Category,
  Dish,
  Pos,
  Table,
  UniquelyYours,
} from "@hi/db-models";
import {
  dishSchema,
  uniquelyYoursSchema,
  updateDishSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { z } from "zod";
import {
  ClientRoles,
  requireAuthorization,
} from "../../../middleware/authorization";
import { authTokenValidator } from "../../../middleware/tokenValidator";
import { posApiPaths } from "../../utils/posConfig/petPooja";
import { respond } from "../../utils/response";
//
const dishesRouter = new Hono()
  .get(
    "/",

    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        UniquelyYours: z.string().optional(),
        menu: z.string().optional(),
        menuId: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, UniquelyYours, menu, menuId } = c.req.query();
      if (UniquelyYours) {
        const isHasPos = await Pos.findOne({
          businessId,
        });

        if (isHasPos) {
          const table = await Table.findOne({
            businessId,
          }).select("name");

          const posDishes = await axios.post(posApiPaths.fetchMenu, {
            "app-key": isHasPos.accessKey,
            "app-secret": isHasPos.secretKey,
            "access-token": isHasPos.authToken,
            restID: isHasPos.restId,
            tableNo: table?.name,
          });

          if (posDishes.data.success === "1") {
            const posDishesData = posDishes.data.items.map((item: any) => {
              return {
                _id: item.itemid,
                name: item.itemname,
                dishTypes: ["VEG"],
                images: [item.item_image_url],
              };
            });

            return respond(
              c,
              "Dishes fetched successfully",
              false,
              200,
              posDishesData,
            );
          }

          return respond(c, "unable to fetch dishes", false, 400, {});
        }

        let query = {
          businessId,
          "categoryIds.0": { $exists: true },
          isDeleted: false,
        };

        if (menuId) {
          query["menuId"] = menuId;
        }

        const existingDishes = await Dish.find(query).select(
          "_id name images dishTypes",
        );
        return respond(c, "Fetched successfully", false, 200, existingDishes);
      }

      if (menu) {
        let query = {
          businessId,
          isDeleted: false,
        };

        if (menuId) {
          query["menuId"] = menuId;
        }
        const existingDishes = await Dish.find(query).select(
          " _id businessId name images availability tags dishTypes visibility price categoryIds addOnIds recommendationIds",
        );
        return respond(c, "Fetched successfully", false, 200, existingDishes);
      }

      let query = {
        businessId,
        isDeleted: false,
      };

      if (menuId) {
        query["menuId"] = menuId;
      }

      const existingDishes = await Dish.find(query);

      return respond(c, "Fetched successfully", false, 200, existingDishes);
    },
  )
  .put(
    "/:id",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
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
        if (!updatedDish) return respond(c, "Error in updating", true, 400, {});

        if (removeCategoryIds.length) {
          await Category.updateMany(
            { _id: { $in: removeCategoryIds } },
            { $pull: { dishIds: id } },
            { session },
          );

          await Dish.findByIdAndUpdate(
            id,
            {
              $pull: { categoryIds: { $in: removeCategoryIds } },
            },
            { session },
          );
        }

        if (removeAddOnIds.length) {
          await AddOn.updateMany(
            { _id: { $in: removeAddOnIds } },
            { $pull: { dishIds: id } },
            { session },
          );

          await Dish.findByIdAndUpdate(
            id,
            {
              $pull: { addOnIds: { $in: removeAddOnIds } },
            },
            { session },
          );
        }

        if (removeRecommendationIds.length) {
          await Dish.findByIdAndUpdate(
            id,
            {
              $pull: { recommendationIds: { $in: removeRecommendationIds } },
            },
            { session },
          );
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
          await AddOn.updateMany(
            { _id: { $in: addOnIds } },
            { $addToSet: { dishIds: id } },
            { session },
          );

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

        return respond(c, "Updated successfully", false, 200, updatedDish);
      });
    },
  )
  .delete(
    "/:id",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { id } = c.req.param();

        const existingDish = await Dish.findByIdAndUpdate(id, {
          isDeleted: true,
        });
        if (!existingDish) return respond(c, "Not found", true, 404, {});

        await Category.updateMany(
          { _id: { $in: existingDish.categoryIds ?? [] } },
          { $pull: { dishIds: id } },
        );

        await AddOn.updateMany(
          { _id: { $in: existingDish.addOnIds ?? [] } },
          { $pull: { dishIds: id } },
        );

        return respond(c, "Deleted successfully", false, 200, {});
      });
    },
  )
  .post(
    "/",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("json", dishSchema),
    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const dish = await c.req.json();

        const dishAlreadyExists = await Dish.findOne({
          businessId: dish.businessId,
          name: dish.name,
          isDeleted: false,
        });
        if (dishAlreadyExists)
          return respond(c, "Already exists", true, 400, {});
        const menuLayout = await Business.findOne({
          businessId: dish.businessId,
        });
        if (!menuLayout) return respond(c, "Business not found", true, 404, {});
        const createDish = await Dish.create([dish], { session });
        if (!createDish) return respond(c, "Error in creating", true, 400, {});

        await Category.updateMany(
          { _id: { $in: dish.categoryIds ?? [] } },
          { $push: { dishIds: createDish[0]._id } },
          { session },
        );

        await AddOn.updateMany(
          { _id: { $in: dish.addOnIds ?? [] } },
          { $push: { dishIds: createDish[0]._id } },
          { session },
        );

        return respond(c, "Created successfully", false, 201, createDish);
      });
    },
  )
  .post(
    "/uniquelyYours/:businessId",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator(
      "json",
      z.object({
        dishArray: z.array(uniquelyYoursSchema),
      }),
    ),
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(24),
      }),
    ),

    async (c) => {
      const { dishArray } = await c.req.json();
      const { businessId } = c.req.param();

      console.log("businessId", businessId);

      const removeOldDishes = await UniquelyYours.updateMany(
        { businessId },
        { isDeleted: true },
      );
      if (!removeOldDishes)
        return respond(c, "Error in updating", true, 400, {});
      const createUniquelyYours = await UniquelyYours.insertMany(dishArray);
      if (!createUniquelyYours)
        return respond(c, "Error in updating", true, 400, {});

      return respond(
        c,
        "Updated successfully",
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

      return respond(c, "fetched successfully", false, 200, dishes);
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
      if (id.length !== 24) {
        return respond(c, "Not found", true, 404, {});
      }
      const existingDish = await Dish.findOne({
        _id: id,
        isDeleted: false,
      }).populate({
        path: "recommendationIds",
        select: "name price images dishTypes _id",
      });
      if (!existingDish) return respond(c, "Not found", true, 404, {});
      return respond(c, "Fetched successfully", false, 200, existingDish);
    },
  )
  .post(
    "/:businessId/bulkUpload",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("param", z.object({ businessId: z.string() })),
    zValidator("json", z.array(dishSchema)),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const dishes = await c.req.json();

        for (const dish of dishes) {
          const dishAlreadyExists = await Dish.findOne({
            businessId: dish.businessId,
            name: dish.name,
            isDeleted: false,
          });
          if (!dishAlreadyExists) {
            const createDish = await Dish.create([dish], { session });
            if (!createDish) {
              return c.json(
                { err: true, message: "Error in creating", data: {} },
                400,
              );
            }
          }
        }
        return c.json({
          err: false,
          message: "Created successfully",
          data: {},
        });
      });
    },
  )
  .post(
    "/:businessId/bulkUpload/dishes",

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        return c.json({
          err: false,
          message: "Created successfully",
          data: {},
        });
      });
    },
  );

export default dishesRouter;
