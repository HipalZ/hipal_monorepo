// books.ts
import {
  Business,
  BusinessPosConfig,
  Category,
  Dish,
  Menu,
  Table,
  Zone,
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
import indianHoursInMinutes from "../../utils/indianHoursInMinutes";
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
          menuId,
        } = requestData;
        const business = await Business.findOne({ businessId });

        if (!business) return respond(c, "Business not found", true, 404, {});

        const businessPosConfig = await BusinessPosConfig.findOne({
          businessId,
          isDeleted: false,
          active: true,
          posName: {
            $ne: "HIPAL_Z",
          },
        });

        if (businessPosConfig) {
          return respond(
            c,
            "pos is enabled for this business you can't create category",
            true,
            400,
            {},
          );
        }
        const hipalZPos = await BusinessPosConfig.findOne({
          businessId: businessId,
          isDeleted: false,
          active: true,
          posName: "HIPAL_Z",
        });

        const alreadyExist = await Category.findOne({
          name: requestData.name,
          menuId: requestData.menuId,
        });

        if (alreadyExist) {
          return respond(c, "Category already exist", true, 409, {});
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
              menuId: menuId,
              pos: !!hipalZPos,
              timings: requestData.timings,
              active: true,
              categoryInfo: requestData.categoryInfo,
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
          businessId,
        } = requestData;

        const businessPosConfig = await BusinessPosConfig.findOne({
          businessId,
          isDeleted: false,
          active: true,
          posName: {
            $ne: "HIPAL_Z",
          },
        });

        if (businessPosConfig) {
          return respond(
            c,
            "pos is enabled for this business you can't update category",
            true,
            400,
            {},
          );
        }

        const updatedCategory = await Category.findByIdAndUpdate(
          id,
          {
            name: requestData.name,
            coverImage: requestData.coverImage,
            visibility: requestData.visibility,
            availability: requestData.availability,
            timings: requestData.timings,
            categoryInfo: requestData.categoryInfo,
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

        const fetchCategory = await Category.findById(id);
        if (!fetchCategory) {
          return respond(c, "not found", true, 404, {});
        }

        const businessPosConfig = await BusinessPosConfig.findOne({
          businessId: fetchCategory.businessId,
          isDeleted: false,
          active: true,
          posName: {
            $ne: "HIPAL_Z",
          },
        });

        if (businessPosConfig) {
          return respond(
            c,
            "pos is enabled for this business you can't delete category",
            true,
            400,
            {},
          );
        }

        const deletedCategory = await Category.findByIdAndUpdate(id, {
          isDeleted: true,
        });
        if (!deletedCategory) return respond(c, "Not found", true, 404, {});

        await Category.updateMany(
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

        await Dish.updateMany(
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
        menuId: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, menu, menuId, parent, tableName, child, dishes } =
        c.req.query();
      const businessPosConfig = await BusinessPosConfig.findOne({
        businessId,
        isDeleted: false,
        active: true,
      });

      if (menu) {
        const { currentDay, currentTimeInMinutes } = indianHoursInMinutes();
        const query = {
          businessId,
          isDeleted: false,
          pos: !!businessPosConfig,
          active: true,
          ...(menuId ? { menuId: menuId } : {}),
          timings: {
            $elemMatch: {
              day: { $in: [currentDay, -1] },
              start: { $lte: currentTimeInMinutes },
              end: { $gt: currentTimeInMinutes },
            },
          },
        };

        const existingCategories = await Category.find(query).select(
          "_id name visibility availability dishIds parentCategoryIds subCategoryIds coverImage sequence categoryInfo createdAt updatedAt",
        );

        // const existingCategoriesWithTiming =
        //   buildActiveCategories(existingCategories);

        return respond(
          c,
          "fetched successfully",
          false,
          200,
          existingCategories,
        );
      }
      if (parent) {
        // Find the table by name and businessId
        const tableData = await Table.findOne({
          name: tableName,
          businessId,
          active: true,
        }).lean();

        // Find the associated zone using either internalZoneId or zoneId
        const zone = await Zone.findOne({
          $or: [
            { _id: tableData?.internalZoneId, businessId, active: true },
            { zoneId: tableData?.zoneId, businessId, active: true },
          ],
        });

        const { currentDay, currentTimeInMinutes } = indianHoursInMinutes();

        // Find the active menu for the zone and business
        const menu = await Menu.findOne({
          zoneIds: tableName ? zone?._id : undefined,
          businessId,
          isActive: true,
          ...(tableName ? {} : { default: true }),
          $or: [
            {
              days: { $in: [currentDay] },
              startTime: { $lte: currentTimeInMinutes },
              endTime: { $gte: currentTimeInMinutes },
            },
            {
              days: { $in: [currentDay] },
              $expr: { $eq: ["$startTime", { $add: ["$endTime", 1] }] },
            },
          ],
        }).lean();
        const query = {
          businessId,
          hierarchy: "PARENT",
          isDeleted: false,
          pos: !!businessPosConfig,
          active: true,
          ...(menuId || tableName ? { menuId: menuId ?? menu?._id } : {}),
        };

        const existingCategories = await Category.find(query)
          .sort({ sequence: 1 })
          .select(
            "_id name visibility availability dishIds parentCategoryIds subCategoryIds coverImage sequence categoryInfo createdAt updatedAt",
          );

        return respond(
          c,
          "fetched successfully",
          false,
          200,
          existingCategories,
        );
      }

      if (dishes) {
        const tableData = await Table.findOne({
          name: tableName,
          businessId,
          active: true,
        }).lean();

        // Find the associated zone using either internalZoneId or zoneId
        const zone = await Zone.findOne({
          $or: [
            { _id: tableData?.internalZoneId, businessId, active: true },
            { zoneId: tableData?.zoneId, businessId, active: true },
          ],
        });

        const { currentDay, currentTimeInMinutes } = indianHoursInMinutes();

        // Find the active menu for the zone and business
        const menu = await Menu.findOne({
          ...(tableName ? { zoneIds: zone?._id } : {}), // Conditionally include zoneIds
          businessId,
          isActive: true,
          ...(tableName ? {} : { default: true }), // Conditionally include default
          $or: [
            {
              days: { $in: [currentDay] },
              startTime: { $lte: currentTimeInMinutes },
              endTime: { $gte: currentTimeInMinutes },
            },
            {
              days: { $in: [currentDay] },
              $expr: { $eq: ["$startTime", { $add: ["$endTime", 1] }] },
            },
          ],
        }).lean();

        const query = {
          businessId,
          hierarchy: "CHILD",
          isDeleted: false,
          menuId: menuId || menu?._id,
          pos: !!businessPosConfig,
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
          .populate({
            path: "dishIds",
            match: {
              businessId: businessId,
              isDeleted: false,
              visibility: true,
            },
            populate: { path: "addOnIds" },
          })
          .sort(businessPosConfig ? { rank: 1 } : {});

        return respond(
          c,
          "fetched successfully",
          false,
          200,
          existingCategories,
        );
      }

      if (child) {
        if (!menuId) {
          return respond(c, "MenuId is required", true, 400, {});
        }
        const { currentDay, currentTimeInMinutes } = indianHoursInMinutes();

        const query = {
          businessId,
          hierarchy: "CHILD",
          isDeleted: false,
          menuId: menuId,
          pos: !!businessPosConfig,
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
            "_id name visibility availability dishIds parentCategoryIds subCategoryIds coverImage sequence categoryInfo hierarchy businessId timings createdAt updatedAt",
          )
          .sort({ sequence: 1 });

        return respond(
          c,
          "fetched successfully",
          false,
          200,
          existingCategories,
        );
      }
      const { currentDay, currentTimeInMinutes } = indianHoursInMinutes();

      const query = {
        businessId,
        isDeleted: false,
        pos: !!businessPosConfig,
        active: true,
        ...(menuId ? { menuId: menuId } : {}),
        timings: {
          $elemMatch: {
            day: { $in: [currentDay, -1] },
            start: { $lte: currentTimeInMinutes },
            end: { $gt: currentTimeInMinutes },
          },
        },
      };

      const existingCategories = await Category.find(query);

      return respond(c, "fetched successfully", false, 200, existingCategories);
    },
  )

  .get(
    "/menu",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        menuId: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, menuId } = c.req.query();
      const { currentDay, currentTimeInMinutes } = indianHoursInMinutes();
      const query = {
        businessId,
        isDeleted: false,
        hierarchy: "CHILD",
        active: true,
        ...(menuId ? { menuId: menuId } : {}),
        timings: {
          $elemMatch: {
            day: { $in: [currentDay, -1] },
            start: { $lte: currentTimeInMinutes },
            end: { $gt: currentTimeInMinutes },
          },
        },
      };

      const existingCategories = await Category.find(query).populate("dishIds");

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
        active: true,
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
      const { currentDay, currentTimeInMinutes } = indianHoursInMinutes();
      const existingCategories = await Category.find({
        businessId,
        hierarchy: "CHILD",
        isDeleted: false,
        dishIds: { $ne: [] },
        active: true,
        timings: {
          $elemMatch: {
            day: { $in: [currentDay, -1] },
            start: { $lte: currentTimeInMinutes },
            end: { $gt: currentTimeInMinutes },
          },
        },
      }).select("_id name coverImage");

      return respond(c, "fetched successfully", false, 200, existingCategories);
    },
  )
  .post(
    "/sequence/:businessId",
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

      for (let i = 0; i < requestData.length; i++) {
        const res = await Category.findOneAndUpdate(
          {
            _id: requestData[i].categoryId,
            businessId,
            hierarchy: requestData[i]?.hierarchy || "PARENT",
          },
          { $set: { sequence: requestData[i].sequence } },
          { new: true },
        );
      }

      return respond(c, "sequence updated successfully", false, 200, {});
    },
  );

export default categoriesRouter;
