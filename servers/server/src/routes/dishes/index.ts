// books.ts
import { Category, Dish, UniquelyYours } from "@hi/db-models";
import { dishSchema, uniquelyYoursSchema } from "@hi/db-models/src/validators";
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
    "/",
    zValidator("json", dishSchema),
    zValidator("param", z.object({ id: z.string() })),

    async (c) => {},
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
      const existingDish = await Dish.findById(id).populate([
        "categoryIds",
        "addOnIds",
      ]);
      if (!existingDish) return respond(c, "Dish not found", true, 404, {});
      return respond(c, "Dish fetched successfully", false, 200, existingDish);
    },
  );

export default dishesRouter;
