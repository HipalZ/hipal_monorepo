// books.ts
import {
  AddOn,
  BusinessPosConfig,
  Category,
  Dish,
  Kitchen,
  Menu,
  PosDishConfig,
  UniquelyYours,
} from "@hi/db-models";
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
import { addInTempMenuChanges } from "../../services/tempMenuChanges";
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
      const { businessId, menuId, UniquelyYours, menu } = c.req.query();

      const businessPosConfig = await BusinessPosConfig.findOne({
        businessId,
        isDeleted: false,
        active: true,
      });

      if (UniquelyYours) {
        const query = {
          businessId,
          "categoryIds.0": { $exists: true },
          isDeleted: false,
          active: true,
          ...(menuId ? { menuId: menuId } : {}),
          pos: !!businessPosConfig,
        };

        const existingDishes = await Dish.find(query).select(
          "_id name images dishTypes",
        );
        return respond(c, "Fetched successfully", false, 200, existingDishes);
      }

      if (menu) {
        const query = {
          businessId,
          isDeleted: false,
          active: true,
          ...(menuId ? { menuId: menuId } : {}),
          pos: !!businessPosConfig,
        };

        const existingDishes = await Dish.find(query).select(
          " _id businessId name images availability tags dishTypes visibility price categoryIds addOnIds recommendationIds",
        );
        return respond(c, "Fetched successfully", false, 200, existingDishes);
      }

      const query = {
        businessId,
        isDeleted: false,
        active: true,
        ...(menuId ? { menuId: menuId } : {}),
        pos: !!businessPosConfig,
      };

      const existingDishes = await Dish.find(query);

      return respond(c, "Fetched successfully", false, 200, existingDishes);
    },
  )

  .put(
    "/:id",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("json", updateDishSchema),
    zValidator("param", z.object({ id: z.string() })),

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
          kitchenId,
          removeKitchenId,
          timings,
          avgPrepTime,
          gst,
        } = dish;

        const businessPosConfig = await BusinessPosConfig.findOne({
          businessId: dish.businessId,
          isDeleted: false,
          active: true,
          posName: {
            $ne: "HIPAL_Z",
          },
        });

        if (businessPosConfig) {
          const posDishEditFields = await PosDishConfig.findOne({
            businessId: dish.businessId,
          })
            .select(
              "description images visibility recommendationIds availability kitchenId menuId",
            )
            .lean();

          if (!posDishEditFields) {
            return respond(c, "POS dish config not found", true, 400, {});
          }

          const allowedKeys = Object.entries(posDishEditFields)
            .filter(([_, isAllowed]) => isAllowed)
            .map(([key]) => key);

          const extraKeys = Object.keys(dish).filter(
            (key) => key !== "businessId" && !allowedKeys.includes(key),
          );

          if (extraKeys.length) {
            return respond(
              c,
              `Field(s) not permitted by POS configuration: ${extraKeys.join(
                ", ",
              )}`,
              true,
              400,
              {},
            );
          }
        }

        const menu = await Menu.findById(dish.menuId);
        if (!menu) {
          return respond(c, "Menu not found", true, 404, {});
        }
        if (
          menu.serviceType === "BASE" &&
          (removeCategoryIds.length ||
            removeAddOnIds.length ||
            removeRecommendationIds.length ||
            categoryIds.length ||
            addOnIds.length ||
            recommendationIds.length ||
            kitchenId ||
            removeKitchenId)
        ) {
          return respond(c, "linking dish to menu not allowed", true, 400, {});
        }

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
            kitchenId,
            removeKitchenId,
            timings,
            avgPrepTime,
            gst,
          },
          {
            new: true,
            session: session,
          },
        );
        if (!updatedDish) return respond(c, "Error in updating", true, 400, {});

        if (menu.serviceType === "BASE") {
          await addInTempMenuChanges(
            "dish",
            updatedDish._id.toString(),
            menu.businessId,
          );
        }

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

        if (kitchenId) {
          await Kitchen.findByIdAndUpdate(
            { _id: kitchenId },
            { $push: { dishIds: updatedDish._id } },
            { session },
          );
        }

        if (removeKitchenId) {
          await Kitchen.findByIdAndUpdate(
            { _id: removeKitchenId },
            { $pull: { dishIds: updatedDish._id } },
            { session },
          );
        }

        return respond(c, "Updated successfully", false, 200, {});
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

        const fetchDish = await Dish.findById(id);
        if (!fetchDish) {
          return respond(c, "not found", true, 404, {});
        }

        const menu = await Menu.findById(fetchDish.menuId);
        if (!menu) {
          return respond(c, "Menu not found", true, 404, {});
        }

        const businessPosConfig = await BusinessPosConfig.findOne({
          businessId: fetchDish.businessId,
          isDeleted: false,
          active: true,
          posName: {
            $ne: "HIPAL_Z",
          },
        });

        if (businessPosConfig) {
          return respond(
            c,
            "pos is enabled for this business you can't delete dish",
            true,
            400,
            {},
          );
        }

        if (menu.serviceType === "BASE") {
          await addInTempMenuChanges(
            "dish",
            fetchDish._id.toString(),
            menu.businessId,
          );
        }

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

        const businessPosConfig = await BusinessPosConfig.findOne({
          businessId: dish.businessId,
          isDeleted: false,
          active: true,
          posName: {
            $ne: "HIPAL_Z",
          },
        });

        if (businessPosConfig) {
          return respond(c, "You cannot create a dish with POS", true, 400, {});
        }

        const hipalZPos = await BusinessPosConfig.findOne({
          businessId: dish.businessId,
          isDeleted: false,
          active: true,
          posName: "HIPAL_Z",
        });

        const menu = await Menu.findById(dish.menuId);
        if (!menu) {
          return respond(c, "Menu not found", true, 404, {});
        }
        if (
          menu.serviceType === "BASE" &&
          (dish.categoryIds?.length || dish.addOnIds?.length || dish.kitchenId)
        ) {
          return respond(c, "linking dish to menu not allowed", true, 400, {});
        }

        const createDish = await Dish.create([{ ...dish, pos: !!hipalZPos }], {
          session,
        });
        if (!createDish) return respond(c, "Error in creating", true, 400, {});

        if (menu.serviceType === "BASE") {
          await addInTempMenuChanges(
            "dish",
            createDish[0]._id,
            menu.businessId,
          );
        }

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

        if (dish.kitchenId) {
          await Kitchen.findByIdAndUpdate(
            { _id: dish.kitchenId },
            { $push: { dishIds: createDish[0]._id } },
            { session },
          );
        }

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
        active: true,
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

        const businessPosConfig = await BusinessPosConfig.findOne({
          businessId: dishes[0].businessId,
          isDeleted: false,
          active: true,
          posName: {
            $ne: "HIPAL_Z",
          },
        });

        if (businessPosConfig) {
          return respond(
            c,
            "pos is enabled for this business you can't create dish",
            true,
            400,
            {},
          );
        }

        const hipalZPos = await BusinessPosConfig.findOne({
          businessId: dishes[0].businessId,
          isDeleted: false,
          active: true,
          posName: "HIPAL_Z",
        });

        for (const dish of dishes) {
          const createDish = await Dish.create(
            [{ ...dish, pos: !!hipalZPos }],
            { session },
          );
          if (!createDish) {
            return c.json(
              { err: true, message: "Error in creating", data: {} },
              400,
            );
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
  )

  .put(
    "/availability/bulk",
    zValidator(
      "json",
      z.object({
        dishIds: z.array(z.string()).min(1).max(26),
        availability: z.boolean(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { dishIds, availability } = await c.req.json();

        const updateDishes = await Dish.updateMany(
          { _id: { $in: dishIds } },
          { $set: { availability } },
        );

        if (!updateDishes)
          return respond(c, "Error in updating", true, 400, {});
        return respond(c, "Updated successfully", false, 200, {});
      });
    },
  )

  .put(
    "/visibility/bulk",
    zValidator(
      "json",
      z.object({
        dishIds: z.array(z.string()).min(1).max(26),
        visibility: z.boolean(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { dishIds, visibility } = await c.req.json();

        const updateDishes = await Dish.updateMany(
          { _id: { $in: dishIds } },
          { $set: { visibility } },
        );

        if (!updateDishes)
          return respond(c, "Error in updating", true, 400, {});
        return respond(c, "Updated successfully", false, 200, {});
      });
    },
  );

export default dishesRouter;
