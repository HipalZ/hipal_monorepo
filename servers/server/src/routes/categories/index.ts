// books.ts
import {
  Business,
  BusinessPosConfig,
  Category,
  Dish,
  Table,
} from "@hi/db-models";

import {
  categorySchema,
  updateCategorySchema,
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
import { petPoojaCateAndDish, transformData } from "../../utils/helper";
import { respond } from "../../utils/response";

//updateCategories

const categoriesRouter = new Hono()
  .post(
    "/",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

    zValidator("json", categorySchema),
    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const {
          businessId,
          subCategoryIds = [],
          parentCategoryIds = [],
          dishIds = [],
        } = requestData;

        const existingCategory = await Category.findOne({
          name: requestData.name,
          businessId,
          isDeleted: false,
        }).select("_id");
        if (existingCategory)
          return respond(c, "Already exists", true, 409, {});

        const menuType = await Business.findOne({ businessId });
        console.log("menuType", menuType);
        if (!menuType) return respond(c, "Business not found", true, 404, {});

        const creatingCategory = await Category.create(
          [
            {
              businessId: businessId,
              visibility: true,
              availability: true,
              name: requestData.name,
              hierarchy: requestData.hierarchy,
              coverImage: requestData.coverImage,
              parentCategoryIds: parentCategoryIds || [],
              dishIds: dishIds || [],
              subCategoryIds: subCategoryIds || [],
            },
          ],
          {
            session: session,
          },
        );

        if (!creatingCategory)
          return respond(c, "Creation failed", true, 400, {});

        if (subCategoryIds.length > 0) {
          await Category.updateMany(
            { _id: { $in: subCategoryIds } },
            { $addToSet: { parentCategoryIds: creatingCategory[0]._id } },
            { session: session },
          );
        }
        if (parentCategoryIds.length > 0) {
          await Category.updateMany(
            { _id: { $in: parentCategoryIds } },
            { $addToSet: { subCategoryIds: creatingCategory[0]._id } },
            { session: session },
          );
        }
        if (dishIds.length > 0) {
          await Dish.updateMany(
            { _id: { $in: dishIds } },
            { $addToSet: { categoryIds: creatingCategory[0]._id } },
            { session: session },
          );
        }

        return respond(c, "created successfully", false, 201, creatingCategory);
      });
    },
  )
  .put(
    "/:id",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

    zValidator("json", updateCategorySchema),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { id } = c.req.param();
        const {
          parentCategoryIds = [],
          subCategoryIds = [],
          dishIds = [],
          removeSubCategoryIds = [],
          removeDishIds = [],
          removeParentCategoryIds = [],
        } = requestData;

        const existingCategory = await Category.findOne({
          name: requestData.name,
          businessId: requestData.businessId,
          _id: { $ne: id },
          isDeleted: false,
        }).select("_id");

        if (existingCategory)
          return respond(c, "Already exists", true, 409, {});

        const updatedCategory = await Category.findByIdAndUpdate(
          id,
          {
            name: requestData.name,
            coverImage: requestData.coverImage,
            visibility: requestData.visibility,
            availability: requestData.availability,
          },
          { session },
        );
        if (!updatedCategory) return respond(c, "Not found", true, 404, {});

        if (removeSubCategoryIds.length > 0) {
          //extra check for subCategoryIds
          await Category.findByIdAndUpdate(
            id,
            { $pull: { subCategoryIds: { $in: removeSubCategoryIds } } },
            { session },
          );
          await Category.updateMany(
            { _id: { $in: removeSubCategoryIds } },
            { $pull: { parentCategoryIds: id } },
            { session },
          );
        }

        if (removeDishIds.length > 0) {
          await Dish.updateMany(
            { _id: { $in: removeDishIds } },
            { $pull: { categoryIds: id } },
            { session },
          );
          await Category.findByIdAndUpdate(
            id,
            { $pull: { dishIds: { $in: removeDishIds } } },
            { session },
          );
        }

        if (removeParentCategoryIds.length > 0) {
          await Category.findByIdAndUpdate(
            id,
            { $pull: { parentCategoryIds: { $in: removeParentCategoryIds } } },
            { session },
          );
        }

        if (parentCategoryIds.length > 0) {
          await Category.updateMany(
            { _id: { $in: parentCategoryIds } },
            { $addToSet: { subCategoryIds: id } },
            { session },
          );

          await Category.findByIdAndUpdate(
            id,
            { $addToSet: { parentCategoryIds: { $each: parentCategoryIds } } },
            { session },
          );
        }

        if (subCategoryIds.length > 0) {
          //extra check for subCategoryIds
          await Category.findByIdAndUpdate(
            id,
            { $addToSet: { subCategoryIds: { $each: subCategoryIds } } },
            { session },
          );
          await Category.updateMany(
            { _id: { $in: subCategoryIds } },
            { $addToSet: { parentCategoryIds: id } },
            { session },
          );
        }

        if (dishIds.length > 0) {
          await Dish.updateMany(
            { _id: { $in: dishIds } },
            { $addToSet: { categoryIds: id } },
            { session },
          );
          await Category.findByIdAndUpdate(
            id,
            { $addToSet: { dishIds: { $each: dishIds } } },
            { session },
          );
        }

        return respond(c, "Updated successfully", false, 200, updatedCategory);
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
      return await runInTransaction(async (session: ClientSession) => {
        const { id } = c.req.param();

        const deletedCategory = await Category.findByIdAndUpdate(id, {
          isDeleted: true,
        });
        if (!deletedCategory) return respond(c, "Not found", true, 404, {});

        const pullCategory = await Category.updateMany(
          {
            parentCategoryIds: id,
          },
          {
            $pull: { parentCategoryIds: id },
          },
        );

        await Category.updateMany(
          {
            subCategoryIds: id,
          },
          {
            $pull: { subCategoryIds: id },
          },
        );

        const pullDish = await Dish.updateMany(
          {
            categoryIds: id,
          },
          {
            $pull: { categoryIds: id },
          },
        );

        return respond(c, "Deleted successfully", false, 200, deletedCategory);
      });
    },
  )

  .get(
    "/",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        menu: z.string().optional(),
        parent: z.string().optional(),
        child: z.string().optional(),
        dishes: z.string().optional(),
        tableName: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, menu, child, parent, dishes, tableName } =
        c.req.query();

      if (menu) {
        const existingCategories = await Category.find({
          businessId,
          isDeleted: false,
        }).select(
          "_id name visibility availability dishIds parentCategoryIds subCategoryIds coverImage",
        );

        return respond(
          c,
          "fetched successfully",
          false,
          200,
          existingCategories,
        );
      }

      if (child) {
        const menuType =
          await Business.findById(businessId).select("menuLayout");
        if (!menuType) return respond(c, "Business not found", true, 404, {});
        let hierarchy = "CHILD";
        if (menuType.menuLayout !== "MAIN_AND_SUB_CATEGORY") {
          hierarchy = "PARENT";
        }
        const existingCategories = await Category.find({
          businessId,
          hierarchy: hierarchy,
          isDeleted: false,
        }).select(
          "_id name visibility availability dishIds parentCategoryIds subCategoryIds coverImage",
        );

        return respond(
          c,
          "fetched successfully",
          false,
          200,
          existingCategories,
        );
      }
      if (parent) {
        const existingCategories = await Category.find({
          businessId,
          isDeleted: false,
          hierarchy: "PARENT",
        })
          .sort({ sequence: 1 })
          .select(
            "_id name visibility availability dishIds parentCategoryIds subCategoryIds coverImage sequence",
          );

        const isHasPos = await BusinessPosConfig.findOne({
          businessId,
        });

        if (isHasPos) {
          return respond(c, "fetched successfully", false, 200, []);
        }

        return respond(
          c,
          "fetched successfully",
          false,
          200,
          existingCategories,
        );
      }

      if (dishes) {
        const existingCategories = await Category.find({
          businessId,
          isDeleted: false,
          hierarchy: "CHILD",
        }).populate({
          path: "dishIds",
          match: { businessId: businessId, isDeleted: false, visibility: true },
          populate: { path: "addOnIds" },
        });

        const isHasPos = await BusinessPosConfig.findOne({
          businessId,
        });

        if (isHasPos) {
          const table = await Table.findOne({
            businessId,
          }).select("name");

          const transformedCategories = transformData(petPoojaCateAndDish);

          return c.json(
            {
              message: "Data fetched successfully",
              err: false,
              data: transformedCategories,
            },
            200,
          );
        }

        return respond(
          c,
          "fetched successfully",
          false,
          200,
          existingCategories,
        );
      }

      const existingCategories = await Category.find({
        businessId,
        isDeleted: false,
      });

      return respond(c, "fetched successfully", false, 200, existingCategories);
    },
  )
  .get(
    "/menu",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();

      const existingCategories = await Category.find({
        businessId,
        isDeleted: false,
        hierarchy: "CHILD",
      }).populate("dishIds");

      return respond(c, "fetched successfully", false, 200, existingCategories);
    },
  )
  .get(
    "/:id",

    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const { id } = c.req.param();

      const existingCategory = await Category.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!existingCategory) return respond(c, "Not found", true, 404, {});

      return respond(c, "Fetched successfully", false, 200, existingCategory);
    },
  )
  .post(
    "/:businessId/parentCategorySequence",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

    zValidator(
      "json",
      z.object({ sequenceOfParentCategoryIds: z.array(z.string()) }),
    ),

    async (c) => {
      const requestData = await c.req.json();
      const { sequenceOfParentCategoryIds } = requestData;

      for (let i = 0; i < sequenceOfParentCategoryIds.length; i++) {
        await Category.updateOne(
          { _id: sequenceOfParentCategoryIds[i] },
          { $set: { sequence: i + 1 } },
        );
      }

      return respond(c, "sequence updated successfully", false, 200, {});
    },
  )
  .get(
    "/all/subCategories",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();

      const existingCategories = await Category.find({
        businessId,
        hierarchy: "CHILD",
        isDeleted: false,
        dishIds: { $ne: [] },
      }).select("_id name coverImage");

      return respond(c, "fetched successfully", false, 200, existingCategories);
    },
  );

export default categoriesRouter;
