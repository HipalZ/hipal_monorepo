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
        let { businessId, subCategoryIds, parentCategoryIds, dishIds } =
          requestData;

        if (!parentCategoryIds) parentCategoryIds = [];
        if (!subCategoryIds) subCategoryIds = [];
        if (!dishIds) dishIds = [];

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
        let { parentCategoryIds, subCategoryIds, dishIds } = requestData;
        if (!requestData.parentCategoryIds) parentCategoryIds = [];
        if (!requestData.subCategoryIds) subCategoryIds = [];
        if (!requestData.dishIds) dishIds = [];

        if (requestData.name) {
          const existingCategory = await Category.findOne({
            name: requestData.name,
          }).select("_id");

          if (existingCategory)
            return respond(c, "Category already exists", true, 409, {});
        }

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

        const allDishIds = requestData.dishIds || [];

        // const findDishes = await Dish.find({
        //   _id: { $in: allDishIds },
        // }).select("_id categoryIds");

        // const removeDishesIds: string[] = [];

        // const filterDishes = findDishes.filter((dish) =>
        //   dish.categoryIds?.includes(new ObjectId(id)),
        // );

        // for (const dish of filterDishes) {
        //   removeDishesIds.push(dish._id.toString());
        // }

        // const filteredDishesIds = allDishIds.filter(
        //   (id: string) => !removeDishesIds.includes(id),
        // );

        // await Dish.updateMany(
        //   { _id: { $in: removeDishesIds } },
        //   { $pull: { categoryIds: id } },
        //   { session },
        // );

        // await Dish.updateMany(
        //   { _id: { $in: filteredDishesIds } },
        //   { $addToSet: { categoryIds: id } },
        //   { session },
        // );

        if (parentCategoryIds.length > 0) {
          const findOnes =
            await Category.findById(id).select("parentCategoryIds");

          let a = findOnes?.parentCategoryIds;
          let b = parentCategoryIds;

          let uniqueFromB = b.filter((item) => !a.includes(item));

          await Category.findByIdAndUpdate(
            id,
            { parentCategoryIds: uniqueFromB },
            { session },
          );
        }

        if (subCategoryIds.length > 0) {
          /////////////////////////////////////////////////////////////////
          const findCategory = await Category.find({
            _id: { $in: subCategoryIds },
          }).select("_id parentCategoryIds");

          console.log("findCategory", findCategory);

          const removeCategoriesIds: string[] = [];

          const filter = findCategory.filter((category) =>
            category.parentCategoryIds
              .map((id) => id.toString())
              .includes(id.toString()),
          );

          console.log("filter", filter);

          for (const category of filter) {
            removeCategoriesIds.push(category._id.toString());
          }

          const filteredCategoryIds = subCategoryIds.filter(
            (id: string) => !removeCategoriesIds.includes(id),
          );

          await Category.updateMany(
            { _id: { $in: removeCategoriesIds } },
            { $pull: { parentCategoryIds: id } },
            { session },
          );

          await Category.updateMany(
            { _id: { $in: filteredCategoryIds } },
            { $addToSet: { parentCategoryIds: id } },
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
      const { id } = c.req.param();

      const deletedCategory = await Category.findByIdAndUpdate(id, {
        isDeleted: true,
      });

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

      if (!deletedCategory)
        return respond(c, "Category not found", true, 404, {});

      return respond(
        c,
        "Category deleted successfully",
        false,
        200,
        deletedCategory,
      );
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
        })
          .select("_id name")
          .populate({
            path: "dishIds", // Populate dishes
            populate: {
              path: "addOns", // Within each dish, populate extras
            },
          });

        return respond(
          c,
          "Categories fetched successfully",
          false,
          200,
          existingCategories,
        );
      }

      if (child) {
        const existingCategories = await Category.find({
          businessId,
          hierarchy: "CHILD",
          isDeleted: false,
        })
          .select("_id name")
          .populate({
            path: "dishIds", // Populate dishes
            populate: {
              path: "addOns", // Within each dish, populate extras
            },
          });

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
        })
          .select("_id name")
          .populate({
            path: "dishIds", // Populate dishes
            populate: {
              path: "addOns", // Within each dish, populate extras
            },
          });

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
      }).populate({
        path: "dishIds", // Populate dishes
        populate: {
          path: "addOns", // Within each dish, populate extras
        },
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
    "/:id",

    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const { id } = c.req.param();

      const existingCategory = await Category.findById(id).populate({
        path: "dishIds", // Populate dishes
        populate: {
          path: "addOns", // Within each dish, populate extras
        },
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
