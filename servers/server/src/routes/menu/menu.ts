import {
  AddOn,
  BusinessPosConfig,
  Category,
  Dish,
  Menu,
  Table,
  Zone,
} from "@hi/db-models";
import { MenuSchema, UpdateMenuSchema } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import mongoose, { type ClientSession } from "mongoose";
import { z } from "zod";
import { respond } from "../../utils/response";

function arraysEqual<T>(a: T[], b: T[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => String(val) === String(sortedB[index]));
}

async function validateActiveMenus(
  businessId: string,
  days: number[],
  zoneIds: string[],
  session: ClientSession,
) {
  const activeMenus = await Menu.find({ businessId, isActive: true }).session(
    session,
  );
  for (const activeMenu of activeMenus) {
    if (
      arraysEqual(activeMenu.days, days) &&
      arraysEqual(activeMenu.zoneIds.map(String), zoneIds.map(String))
    ) {
      return false;
    }
  }
  return true;
}

async function processCompleteMenu(
  sourceMenuId: string,
  menuId: string,
  session: ClientSession,
) {
  const newCategoryIdsMap = new Map<string, mongoose.Types.ObjectId>();
  const newCategoryDocs = new Map<string, InstanceType<typeof Category>>();
  const newDishes: InstanceType<typeof Dish>[] = [];
  const newAddOns: InstanceType<typeof AddOn>[] = [];

  // Step 1: Fetch categories and dishes
  const sourceCategories = await Category.find({ menuId: sourceMenuId }).lean();
  const allDishIds = sourceCategories
    .flatMap((c) => c.dishIds || [])
    .map((id) => String(id));

  const sourceDishes = await Dish.find({ _id: { $in: allDishIds } }).lean();
  const dishById = new Map(sourceDishes.map((d) => [String(d._id), d]));

  // Step 2: Fetch related add-ons
  const allAddOnIds = sourceDishes
    .flatMap((dish) => dish.addOnIds || [])
    .map((id) => String(id));

  const sourceAddOns = await AddOn.find({ _id: { $in: allAddOnIds } }).lean();
  const addOnById = new Map(sourceAddOns.map((a) => [String(a._id), a]));

  const newAddOnIdsMap = new Map<string, mongoose.Types.ObjectId>();

  for (const category of sourceCategories) {
    const newCategoryId = new mongoose.Types.ObjectId();
    const newCategory = new Category({
      ...category,
      _id: newCategoryId,
      menuId,
      dishIds: [],
      subCategoryIds: [],
    });

    newCategoryIdsMap.set(String(category._id), newCategoryId);
    newCategoryDocs.set(String(category._id), newCategory);
  }

  for (const category of sourceCategories) {
    const originalCategoryId = String(category._id);
    const newCategory = newCategoryDocs.get(originalCategoryId)!;

    if (category.hierarchy === "CHILD") {
      newCategory.parentCategoryIds = (category.parentCategoryIds || []).map(
        (parentId) => {
          return newCategoryIdsMap.get(String(parentId)) || parentId;
        },
      );

      for (const parentId of category.parentCategoryIds || []) {
        const newParentId = newCategoryIdsMap.get(String(parentId));
        if (newParentId) {
          const parentDoc = newCategoryDocs.get(String(parentId));
          if (parentDoc) {
            parentDoc.subCategoryIds.push(newCategory._id);
          }
        }
      }
    }
  }

  const dishIdMap = new Map<string, mongoose.Types.ObjectId>();

  for (const category of sourceCategories) {
    const originalCategoryId = String(category._id);
    const newCategoryId = newCategoryIdsMap.get(originalCategoryId)!;
    const newDishIds: mongoose.Types.ObjectId[] = [];

    for (const dishId of category.dishIds || []) {
      const dish = dishById.get(String(dishId));
      if (!dish) continue;

      const newDishId = new mongoose.Types.ObjectId();
      dishIdMap.set(String(dish._id), newDishId);

      const newDish = new Dish({
        ...dish,
        _id: newDishId,
        menuId,
        categoryIds: (dish.categoryIds || []).map((catId) => {
          const catIdStr = String(catId);
          return catIdStr === originalCategoryId
            ? newCategoryId
            : newCategoryIdsMap.get(catIdStr) || catId;
        }),
        addOnIds: [], // will fill later
      });

      newDishes.push(newDish);
      newDishIds.push(newDishId);
    }

    const newCategory = newCategoryDocs.get(originalCategoryId)!;
    newCategory.dishIds = newDishIds;
  }

  // Step 5: Clone add-ons
  for (const addOn of sourceAddOns) {
    const newAddOnId = new mongoose.Types.ObjectId();
    newAddOnIdsMap.set(String(addOn._id), newAddOnId);

    const updatedDishIds = (addOn.dishIds || []).map(
      (dId) => dishIdMap.get(String(dId)) || dId,
    );

    const newAddOn = new AddOn({
      ...addOn,
      menuId,
      _id: newAddOnId,
      businessId: addOn.businessId,
      dishIds: updatedDishIds,
    });

    newAddOns.push(newAddOn);
  }

  // Step 6: Update cloned dishes with new addOnIds
  for (const newDish of newDishes) {
    let originalDishId: string | undefined;

    for (const [key, val] of Array.from(dishIdMap.entries())) {
      if (String(val) === String(newDish._id)) {
        originalDishId = key;
        break;
      }
    }

    if (!originalDishId) continue;

    const originalDish = dishById.get(originalDishId);
    if (!originalDish) continue;

    newDish.addOnIds = (originalDish.addOnIds || []).map(
      (addOnId) => newAddOnIdsMap.get(String(addOnId)) || addOnId,
    );
  }

  // Step 7: Save everything in the session
  for (const newCategory of Array.from(newCategoryDocs.values())) {
    await newCategory.save({ session });
  }

  for (const newAddOn of newAddOns) {
    await newAddOn.save({ session });
  }

  for (const newDish of newDishes) {
    await newDish.save({ session });
  }

  return true;
}

const menuRouter = new Hono()

  .get(
    "/fetch_menu",
    zValidator(
      "query",
      z.object({
        menuId: z.string().min(1).max(36),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const menuId = c.req.query("menuId");
        const menu = await Menu.findById(menuId);
        if (!menu) {
          return respond(c, "Menu not found", true, 404);
        }
        return respond(c, "Menu fetched successfully", false, 200, menu);
      });
    },
  )

  .get(
    "/fetch_menus",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(1).max(36),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const businessId = c.req.query("businessId");
        const menus = await Menu.find({ businessId }).lean();

        return respond(c, "Menus fetched successfully", false, 200, menus);
      });
    },
  )

  .get(
    "/fetch_table_menu",
    zValidator(
      "query",
      z.object({
        tableName: z.string().min(1).max(30),
        businessId: z.string().min(1).max(36),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { tableName, businessId } = c.req.query();

        // Find the table by name and businessId
        const tableData = await Table.findOne({
          name: tableName,
          businessId,
        }).lean();

        if (!tableData) {
          const findDefaultZone = await Zone.findOne({
            businessId,
            name: "Default",
          });

          const createTable = new Table({
            name: tableName,
            businessId,
            zoneId: findDefaultZone?._id,
            internalZoneId: findDefaultZone?._id,
            status: "EMPTY",
            date: Date.now(),
            visibility: true,
          });

          await createTable.save({ session });

          const updateZone = await Zone.findByIdAndUpdate(
            findDefaultZone?._id,
            {
              $push: {
                tableIds: createTable._id,
              },
            },
            { session },
          );
        }

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
        let menu = await Menu.findOne({
          zoneIds: zone?._id,
          businessId,
          isActive: true,
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
        })
          .lean()
          .select(
            "menuType categoryLayout cardLayout primaryColor secondaryColor",
          );

        if (!menu) return respond(c, "Menu not found", true, 404);

        return respond(c, "Menu fetched successfully", false, 200, menu);
      });
    },
  )

  .post("/add_menu", zValidator("json", MenuSchema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const {
        name,
        businessId,
        zoneIds,
        days,

        sourceMenuId,
      } = requestData;

      if (sourceMenuId && (await BusinessPosConfig.exists({ businessId }))) {
        return respond(
          c,
          "You cannot create a menu with sourceMenuId as this business has POS",
          true,
          400,
        );
      }

      const existingMenu = await Menu.exists({ name, businessId });
      if (existingMenu) {
        return respond(c, "Menu already exists", true, 409);
      }

      const isUnique = await validateActiveMenus(
        businessId,
        days,
        zoneIds,
        session,
      );
      if (!isUnique) {
        return respond(
          c,
          "An active menu with the same days and zoneIds already exists ,please deactivate it first",
          true,
          409,
        );
      }

      const menu = new Menu({ ...requestData });

      if (sourceMenuId) {
        const sourceMenu = await Menu.findById(sourceMenuId);
        if (!sourceMenu) {
          return respond(c, "Source menu not found", true, 404);
        }
        const createMenu = await processCompleteMenu(
          sourceMenuId,
          menu._id.toString(),
          session,
        );

        if (!createMenu) {
          return respond(c, "Failed to create menu", true, 400);
        }
      }

      await menu.save({ session });
      if (!menu) {
        throw new Error("Menu not created");
      }

      return respond(c, "Menu created successfully", false, 201, {
        _id: menu._id,
      });
    });
  })

  .put("/update_menu", zValidator("json", UpdateMenuSchema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { menuId, businessId, zoneIds, days } = requestData;

      const menu = await Menu.findById(menuId);
      if (!menu) {
        return respond(c, "Menu not found", true, 404);
      }

      const activeMenus = await Menu.find({
        businessId: businessId || menu.businessId,
        isActive: true,
        _id: { $ne: menuId },
      });
      for (const activeMenu of activeMenus) {
        if (
          arraysEqual(activeMenu.days, days || menu.days) &&
          arraysEqual(
            activeMenu.zoneIds.map(String),
            (zoneIds || menu.zoneIds).map(String),
          )
        ) {
          return respond(
            c,
            "An active menu with the same days and zoneIds already exists",
            true,
            409,
          );
        }
      }

      const updatedMenu = await Menu.findByIdAndUpdate(
        menuId,
        {
          ...requestData,
        },
        { new: true, session },
      );

      if (!updatedMenu) {
        return respond(c, "Menu not updated", true, 404);
      }

      return respond(c, "Menu updated successfully", false, 200, {
        _id: updatedMenu._id,
      });
    });
  });

export default menuRouter;
