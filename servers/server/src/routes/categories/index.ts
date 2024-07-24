// books.ts
import { Business, Category, Dish } from "@hi/db-models";

import {
  categorySchema,
  updateCategorySchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { z } from "zod";
import { respond } from "../../utils/response";

//updateCategories

const categoriesRouter = new Hono()
  .post(
    "/",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

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
        }).select("_id");
        if (existingCategory)
          return respond(c, "Category already exists", true, 409, {});

        const menuType =
          await Business.findById(businessId).select("menuLayout");
        if (!menuType) return respond(c, "Business not found", true, 404, {});

        if (
          (parentCategoryIds.length > 0 || subCategoryIds.length > 0) &&
          menuType.menuLayout !== "MAIN_AND_SUB_CATEGORY"
        ) {
          return respond(
            c,
            "MAIN_AND_SUB_CATEGORY menuLayout is not enabled for this business",
            true,
            400,
            {},
          );
        }

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
          return respond(c, "Category creation failed", true, 400, {});

        if (subCategoryIds.length > 0) {
          await Category.updateMany(
            { _id: { $in: subCategoryIds } },
            { $addToSet: { parentCategoryIds: creatingCategory[0]._id } },
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

        return respond(
          c,
          "Category created successfully",
          false,
          201,
          creatingCategory,
        );
      });
    },
  )
  .put(
    "/:id",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

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

        // if (requestData.name) {
        //   const existingCategory = await Category.findOne({
        //     name: requestData.name,
        //     _id: { $ne: id },
        //   }).select("_id");

        //   if (existingCategory)
        //     return respond(c, "Category already exists", true, 409, {});
        // }

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
        if (!updatedCategory)
          return respond(c, "Category not found", true, 404, {});

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

        return respond(
          c,
          "Category updated successfully",
          false,
          200,
          updatedCategory,
        );
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

        const deletedCategory = await Category.findByIdAndUpdate(id, {
          isDeleted: true,
        });
        if (!deletedCategory)
          return respond(c, "Category not found", true, 404, {});

        const pullCategory = await Category.updateMany(
          {
            parentCategoryIds: id,
          },
          {
            $pull: { parentCategoryIds: id },
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

        return respond(
          c,
          "Category deleted successfully",
          false,
          200,
          deletedCategory,
        );
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
      }),
    ),
    async (c) => {
      const { businessId, menu, child, parent } = c.req.query();

      if (menu) {
        const existingCategories = await Category.find({
          businessId,
          isDeleted: false,
        }).select(
          "_id name visibility availability dishIds parentCategoryIds subCategoryIds coverImage",
        );

        return respond(
          c,
          "Categories fetched successfully",
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
          "Categories fetched successfully",
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
        }).select(
          "_id name visibility availability dishIds parentCategoryIds subCategoryIds coverImage",
        );

        return respond(
          c,
          "Categories fetched successfully",
          false,
          200,
          existingCategories,
        );
      }

      const existingCategories = await Category.find({
        businessId,
        isDeleted: false,
      });

      return respond(
        c,
        "Categories fetched successfully",
        false,
        200,
        existingCategories,
      );
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

      return respond(
        c,
        "Categories fetched successfully",
        false,
        200,
        existingCategories,
      );
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

      if (!existingCategory)
        return respond(c, "Category not found", true, 404, {});

      return respond(
        c,
        "Categories fetched successfully",
        false,
        200,
        existingCategory,
      );
    },
  );

export default categoriesRouter;
