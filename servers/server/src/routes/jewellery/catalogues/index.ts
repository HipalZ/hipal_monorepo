// books.ts
import { Business, Category, Dish } from "@hi/db-models";

import {
  catalogueSchema,
  updateCatalogueSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import indianHoursInMinutes from "../../../utils/indianHoursInMinutes";
import { respond } from "../../../utils/response";

//updateCategories

const cataloguesRouter = new Hono()
  .post(
    "/",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

    zValidator("json", catalogueSchema),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const {
          businessId,
          subCategoryIds = [],
          parentCategoryIds = [],
          dishIds = [],
          menuId,
        } = requestData;
        const businessData = await Business.findOne({ businessId });

        if (!businessData)
          return respond(c, "Business not found", true, 404, {});

        const existingCatalogue = await Category.findOne({
          name: requestData.name,
          businessId,
          isDeleted: false,
          active: true,
        }).select("_id");
        if (existingCatalogue)
          return respond(c, "Already exists", true, 409, {});

        const creatingCatalogue = await Category.create(
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
              menuId: menuId,
            },
          ],
          {
            session: session,
          },
        );

        if (!creatingCatalogue)
          return respond(c, "Creation failed", true, 400, {});

        if (subCategoryIds.length > 0) {
          await Category.updateMany(
            { _id: { $in: subCategoryIds } },
            { $addToSet: { parentCategoryIds: creatingCatalogue[0]._id } },
            { session: session },
          );
        }
        if (parentCategoryIds.length > 0) {
          await Category.updateMany(
            { _id: { $in: parentCategoryIds } },
            { $addToSet: { subCategoryIds: creatingCatalogue[0]._id } },
            { session: session },
          );
        }
        if (dishIds.length > 0) {
          await Dish.updateMany(
            { _id: { $in: dishIds } },
            { $addToSet: { categoryIds: creatingCatalogue[0]._id } },
            { session: session },
          );
        }

        return respond(c, "created successfully", false, 201, {
          _id: creatingCatalogue[0]._id,
        });
      });
    },
  )

  .post(
    "/:businessId/sequence",
    zValidator(
      "param",
      z.object({
        businessId: z.string(),
      }),
    ),
    zValidator(
      "json",
      z.array(
        z.object({
          categoryId: z.string(),
          sequence: z.number(),
          hierarchy: z.string().optional(),
        }),
      ),
    ),
    async (c) => {
      const { businessId } = c.req.param();
      const requestData = await c.req.json();

      for (const item of requestData) {
        await Category.findOneAndUpdate(
          {
            _id: item.categoryId,
            businessId,
            hierarchy: item?.hierarchy || "PARENT",
          },
          { $set: { sequence: item.sequence } },
          { new: true },
        );
      }

      return respond(c, "sequence updated successfully", false, 200, {});
    },
  )
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        // menuId: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();

      const { currentDay, currentTimeInMinutes } = indianHoursInMinutes();

      const query = {
        businessId,
        hierarchy: "CHILD",
        isDeleted: false,

        active: true,
        timings: {
          $elemMatch: {
            day: { $in: [currentDay, -1] },
            start: { $lte: currentTimeInMinutes },
            end: { $gt: currentTimeInMinutes },
          },
        },
      };

      const existingCategories = await Category.find(query)
        .select(
          "_id name visibility availability dishIds parentCategoryIds subCategoryIds coverImage sequence hierarchy businessId timings",
        )
        .sort({ sequence: 1 });

      return respond(c, "fetched successfully", false, 200, existingCategories);
    },
  )
  .get(
    "/:businessId/dishes",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();
      console.log("businessId", businessId);

      const { currentDay, currentTimeInMinutes } = indianHoursInMinutes();

      const query = {
        businessId,
        hierarchy: "CHILD",
        isDeleted: false,
        active: true,
        timings: {
          $elemMatch: {
            day: { $in: [currentDay, -1] },
            start: { $lte: currentTimeInMinutes },
            end: { $gt: currentTimeInMinutes },
          },
        },
      };

      const existingCatalogue = await Category.find(query).populate({
        path: "dishIds",
        match: { businessId: businessId, isDeleted: false, visibility: true },
        populate: { path: "addOnIds" },
      });

      return respond(c, "fetched successfully", false, 200, existingCatalogue);
    },
  )
  .put(
    "/:catalogueId",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

    zValidator("json", updateCatalogueSchema),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { catalogueId } = c.req.param();
        const {
          parentCategoryIds = [],
          subCategoryIds = [],
          dishIds = [],
          removeSubCategoryIds = [],
          removeDishIds = [],
          removeParentCategoryIds = [],
          businessId,
        } = requestData;

        const updatedCatalogue = await Category.findByIdAndUpdate(
          catalogueId,
          {
            name: requestData.name,
            coverImage: requestData.coverImage,
            visibility: requestData.visibility,
            availability: requestData.availability,
            timings: requestData.timings,
          },
          { session },
        );
        if (!updatedCatalogue) return respond(c, "Not found", true, 404, {});

        if (removeSubCategoryIds.length > 0) {
          //extra check for subCategoryIds
          await Category.findByIdAndUpdate(
            catalogueId,
            { $pull: { subCategoryIds: { $in: removeSubCategoryIds } } },
            { session },
          );
          await Category.updateMany(
            { _id: { $in: removeSubCategoryIds } },
            { $pull: { parentCategoryIds: catalogueId } },
            { session },
          );
        }

        if (removeDishIds.length > 0) {
          await Dish.updateMany(
            { _id: { $in: removeDishIds } },
            { $pull: { categoryIds: catalogueId } },
            { session },
          );
          await Category.findByIdAndUpdate(
            catalogueId,
            { $pull: { dishIds: { $in: removeDishIds } } },
            { session },
          );
        }

        if (removeParentCategoryIds.length > 0) {
          await Category.findByIdAndUpdate(
            catalogueId,
            { $pull: { parentCategoryIds: { $in: removeParentCategoryIds } } },
            { session },
          );
        }

        if (parentCategoryIds.length > 0) {
          await Category.updateMany(
            { _id: { $in: parentCategoryIds } },
            { $addToSet: { subCategoryIds: catalogueId } },
            { session },
          );

          await Category.findByIdAndUpdate(
            catalogueId,
            { $addToSet: { parentCategoryIds: { $each: parentCategoryIds } } },
            { session },
          );
        }

        if (subCategoryIds.length > 0) {
          //extra check for subCategoryIds
          await Category.findByIdAndUpdate(
            catalogueId,
            { $addToSet: { subCategoryIds: { $each: subCategoryIds } } },
            { session },
          );
          await Category.updateMany(
            { _id: { $in: subCategoryIds } },
            { $addToSet: { parentCategoryIds: catalogueId } },
            { session },
          );
        }

        if (dishIds.length > 0) {
          await Dish.updateMany(
            { _id: { $in: dishIds } },
            { $addToSet: { categoryIds: catalogueId } },
            { session },
          );
          await Category.findByIdAndUpdate(
            catalogueId,
            { $addToSet: { dishIds: { $each: dishIds } } },
            { session },
          );
        }

        return respond(c, "Updated successfully", false, 200, {
          _id: updatedCatalogue._id,
        });
      });
    },
  )
  .delete(
    "/:catalogueId",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const { catalogueId } = c.req.param();

        const fetchCatalogue = await Category.findById(catalogueId);
        if (!fetchCatalogue) {
          return respond(c, "not found", true, 404, {});
        }

        const deleteCatalogue = await Category.findByIdAndUpdate(catalogueId, {
          isDeleted: true,
        });
        if (!deleteCatalogue) return respond(c, "Not found", true, 404, {});

        await Category.updateMany(
          {
            parentCategoryIds: catalogueId,
          },
          {
            $pull: { parentCategoryIds: catalogueId },
          },
        );

        await Category.updateMany(
          {
            subCategoryIds: catalogueId,
          },
          {
            $pull: { subCategoryIds: catalogueId },
          },
        );

        await Dish.updateMany(
          {
            categoryIds: catalogueId,
          },
          {
            $pull: { categoryIds: catalogueId },
          },
        );

        return respond(c, "Deleted successfully", false, 200, {
          _id: deleteCatalogue._id,
        });
      });
    },
  );

export default cataloguesRouter;
