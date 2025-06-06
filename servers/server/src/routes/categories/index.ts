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
import axios from "axios";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { z } from "zod";
import {
  ClientRoles,
  requireAuthorization,
} from "../../../middleware/authorization";
import { authTokenValidator } from "../../../middleware/tokenValidator";
import { transformData, transformParentCategories } from "../../utils/helper";
import { posApiPaths } from "../../utils/posConfig/petPooja";
import {
  getMenuByBId,
  setPosConfigTransfer,
} from "../../utils/posTransferCache";
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

        const existingCategory = await Category.findOne({
          name: requestData.name,
          businessId,
          isDeleted: false,
        }).select("_id");
        if (existingCategory)
          return respond(c, "Already exists", true, 409, {});

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
        menuId: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, menu, child, parent, dishes, tableName, menuId } =
        c.req.query();

      if (menu) {
        let query = {
          businessId,
          isDeleted: false,
        };

        if (menuId) {
          query["menuId"] = menuId;
        }
        const existingCategories = await Category.find(query).select(
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
        if (!menuId) {
          return respond(c, "MenuId is required", true, 400, {});
        }
        let query = {
          businessId,
          hierarchy: "CHILD",
          isDeleted: false,
          menuId: menuId,
        };

        const existingCategories = await Category.find(query)
          .select(
            "_id name visibility availability dishIds parentCategoryIds subCategoryIds coverImage sequence hierarchy businessId",
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
      if (parent) {
        // Find the table by name and businessId
        const tableData = await Table.findOne({
          name: tableName,
          businessId,
        }).lean();

        // Find the associated zone using either internalZoneId or zoneId
        const zone = await Zone.findOne({
          $or: [
            { _id: tableData?.internalZoneId, businessId },
            { zoneId: tableData?.zoneId, businessId },
          ],
        });

        const indianDate = new Date(
          new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        );

        let currentDay = indianDate.getDay();
        currentDay = currentDay === 0 ? 7 : currentDay;

        const currentTimeInMinutes =
          indianDate.getHours() * 60 + indianDate.getMinutes();

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
        let query = {
          businessId,
          hierarchy: "PARENT",
          isDeleted: false,
        };

        if (menuId || tableName) {
          query["menuId"] = menuId || menu?._id;
        }
        const existingCategories = await Category.find(query)
          .sort({ sequence: 1 })
          .select(
            "_id name visibility availability dishIds parentCategoryIds subCategoryIds coverImage sequence",
          );

        const isHasPos = await BusinessPosConfig.findOne({
          businessId,
          isDeleted: false,
        });

        if (isHasPos) {
          const table = await Table.findOne({
            businessId,
          }).select("name");
          const getCache = await getMenuByBId(`${businessId}+parent`);

          if (getCache) {
            const parentCategories = transformParentCategories(
              getCache.group_categories || [],
              getCache.categories || [],
              businessId,
            );

            return respond(
              c,
              "fetched successfully",
              false,
              200,
              parentCategories || [],
            );
          }

          const Config = {
            "app-key": isHasPos.accessKey,
            "app-secret": isHasPos.secretKey,
            "access-token": isHasPos.authToken,
            restID: isHasPos.restId,
            tableNo: table?.name,
          };

          const menu = await axios.post(posApiPaths.fetchMenu, Config);
          await setPosConfigTransfer(`${businessId}+parent`, menu.data);

          const parentCategories = transformParentCategories(
            menu.data.group_categories || [],
            menu.data.categories || [],
            businessId,
          );

          return respond(
            c,
            "fetched successfully",
            false,
            200,
            parentCategories || [],
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

      if (dishes) {
        const isHasPos = await BusinessPosConfig.findOne({
          businessId,
          isDeleted: false,
        });

        if (isHasPos) {
          const table = await Table.findOne({
            businessId,
          }).select("name");

          const getCache = await getMenuByBId(businessId);
          if (getCache) {
            const transformedCategories = transformData(getCache);
            return c.json(
              {
                message: "Data fetched successfully",
                err: false,
                data: transformedCategories,
              },
              200,
            );
          }

          const Config = {
            "app-key": isHasPos.accessKey,
            "app-secret": isHasPos.secretKey,
            "access-token": isHasPos.authToken,
            restID: isHasPos.restId,
            tableNo: table?.name,
          };

          const menu = await axios.post(posApiPaths.fetchMenu, Config);
          await setPosConfigTransfer(businessId, menu.data);
          const transformedCategories = transformData(menu.data);

          return c.json(
            {
              message: "Data fetched successfully",
              err: false,
              data: transformedCategories,
            },
            200,
          );
        }

        // Find the table by name and businessId
        const tableData = await Table.findOne({
          name: tableName,
          businessId,
        }).lean();

        // Find the associated zone using either internalZoneId or zoneId
        const zone = await Zone.findOne({
          $or: [
            { _id: tableData?.internalZoneId, businessId },
            { zoneId: tableData?.zoneId, businessId },
          ],
        });

        const indianDate = new Date(
          new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        );

        let currentDay = indianDate.getDay();
        currentDay = currentDay === 0 ? 7 : currentDay;

        const currentTimeInMinutes =
          indianDate.getHours() * 60 + indianDate.getMinutes();

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

        if (!menu) {
          return respond(c, "Menu not found", true, 404, []);
        }

        const query = {
          businessId,
          hierarchy: "CHILD",
          isDeleted: false,
          menuId: menuId || menu?._id,
        };

        const existingCategories = await Category.find(query).populate({
          path: "dishIds",
          match: { businessId: businessId, isDeleted: false, visibility: true },
          populate: { path: "addOnIds" },
        });

        return respond(
          c,
          "fetched successfully",
          false,
          200,
          existingCategories,
        );
      }

      let query = {
        businessId,
        isDeleted: false,
      };

      if (menuId) {
        query["menuId"] = menuId;
      }

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

      let query = {
        businessId,
        isDeleted: false,
        hierarchy: "CHILD",
      };
      if (menuId) {
        query["menuId"] = menuId;
      }

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
