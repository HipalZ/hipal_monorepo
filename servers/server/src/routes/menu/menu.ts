import {
  AddOn,
  Business,
  BusinessPosConfig,
  Category,
  Dish,
  Kitchen,
  Menu,
  MenuTempChnages,
  Table,
  Tax,
  Zone,
} from "@hi/db-models";
import {
  MenuSchema,
  UpdateMenuSchema,
  pushMenuSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
import mongoose, { type ClientSession } from "mongoose";
import { z } from "zod";
import { pushToken } from "../../services/token";
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

async function processCompleteMenuWithoutMapping(
  sourceMenuId: string,
  menuId: string,
  session: ClientSession,
) {
  const sourceCategories = await Category.find({ menuId: sourceMenuId }).lean();
  const sourceDishes = await Dish.find({ menuId: sourceMenuId }).lean();
  const sourceAddOns = await AddOn.find({ menuId: sourceMenuId }).lean();
  const sourceTaxes = await Tax.find({ menuId: sourceMenuId }).lean();
  const sourceKitchens = await Kitchen.find({ menuId: sourceMenuId }).lean();

  const newCategories: InstanceType<typeof Category>[] = [];
  const newDishes: InstanceType<typeof Dish>[] = [];
  const newAddOns: InstanceType<typeof AddOn>[] = [];
  const newTaxes: InstanceType<typeof Tax>[] = [];
  const newKitchens: InstanceType<typeof Kitchen>[] = [];

  for (const category of sourceCategories) {
    const newCategory = new Category({
      ...category,
      _id: new mongoose.Types.ObjectId(),
      menuId,
      dishIds: [],
      subCategoryIds: [],
      parentCategoryIds: [],
      baseMenuId: sourceMenuId,
      baseMenuCategoryId: category._id,
    });
    newCategories.push(newCategory);
  }

  for (const dish of sourceDishes) {
    const newDish = new Dish({
      ...dish,
      _id: new mongoose.Types.ObjectId(),
      menuId,
      categoryIds: [],
      addOnIds: [],
      baseMenuId: sourceMenuId,
      baseMenuDishId: dish._id,
    });
    newDishes.push(newDish);
  }

  for (const addOn of sourceAddOns) {
    const newAddOn = new AddOn({
      ...addOn,
      _id: new mongoose.Types.ObjectId(),
      menuId,
      dishIds: [], // clear dish links
      baseMenuId: sourceMenuId,
      baseMenuAddOnId: addOn._id,
    });
    newAddOns.push(newAddOn);
  }

  for (const tax of sourceTaxes) {
    const newTax = new Tax({
      ...tax,
      _id: new mongoose.Types.ObjectId(),
      menuId,
      baseMenuTaxId: tax._id,
      baseMenuId: sourceMenuId,
    });
    newTaxes.push(newTax);
  }
  // ---- Step 3: Copy Kitchens ----
  for (const kitchen of sourceKitchens) {
    const newKitchen = new Kitchen({
      ...kitchen,
      _id: new mongoose.Types.ObjectId(),
      menuId,
      baseMenuKitchenId: kitchen._id,
      baseMenuId: sourceMenuId,
    });
    newKitchens.push(newKitchen);
  }

  if (newCategories.length)
    await Category.insertMany(newCategories, { session });
  if (newDishes.length) await Dish.insertMany(newDishes, { session });
  if (newAddOns.length) await AddOn.insertMany(newAddOns, { session });

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
        const menus = await Menu.find({ businessId }).populate({
          path: "baseMenuId",
          select: "name serviceType",
        });

        return respond(c, "Menus fetched successfully", false, 200, menus);
      });
    },
  )

  .get(
    "/fetch_table_menu",
    zValidator(
      "query",
      z.object({
        tableName: z.string().min(1).max(30).optional(),
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

        pushToken(c);

        if (!tableData) {
          const findDefaultZone = await Zone.findOne({
            businessId,
            name: "Default",
          });

          if (findDefaultZone) {
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
        const menu = await Menu.findOne({
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

        if (!menu) {
          const defaultMenuLayout = await Menu.findOne({
            businessId,
            isActive: true,
          }).select(
            "menuType categoryLayout cardLayout primaryColor secondaryColor",
          );

          return c.json(
            {
              message: "No active menu found for this zone",
              err: false,
              data: defaultMenuLayout,
            },
            200,
          );
        }

        return respond(c, "Menu fetched successfully", false, 200, menu);
      });
    },
  )

  .post("/add_menu", zValidator("json", MenuSchema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { name, businessId, zoneIds, days, baseMenuId } = requestData;

      if (
        await BusinessPosConfig.exists({
          businessId,
          isDeleted: false,
          posName: {
            $ne: "HIPAL_Z",
          },
        })
      ) {
        return respond(
          c,
          "You cannot create a menu as this business has POS enabled",
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

      const isBaseMenuAlreadyExists = await Menu.exists({
        businessId,
        serviceType: "BASE",
      });

      if (isBaseMenuAlreadyExists) {
        return respond(
          c,
          "A base menu with the same businessId already exists",
          true,
          409,
        );
      }

      const isTakeAwayMenuAlreadyExists = await Menu.exists({
        businessId,
        serviceType: "TAKE_AWAY",
      });

      if (isTakeAwayMenuAlreadyExists) {
        return respond(
          c,
          "A take away menu with the same businessId already exists",
          true,
          409,
        );
      }

      const menu = new Menu({ ...requestData, default: true });

      if (baseMenuId) {
        const sourceMenu = await Menu.findById(baseMenuId);
        if (!sourceMenu) {
          return respond(c, "Source menu not found", true, 404);
        }

        if (sourceMenu.serviceType === "BASE") {
          const createMenu = await processCompleteMenuWithoutMapping(
            baseMenuId,
            menu._id.toString(),
            session,
          );

          if (!createMenu) {
            return respond(c, "Failed to create menu", true, 400);
          }
        } else {
          const createMenu = await processCompleteMenu(
            baseMenuId,
            menu._id.toString(),
            session,
          );

          if (!createMenu) {
            return respond(c, "Failed to create menu", true, 400);
          }
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

  .post(
    "/customlink",
    zValidator(
      "json",
      z.object({
        customLink: z.string().min(1).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const requestData = await c.req.json();
        const { customLink } = requestData;

        const businessExists = await Business.exists({ customLink });

        if (!businessExists) {
          return respond(c, "Business not found", true, 404);
        }

        const menus = await Menu.find({
          businessId: businessExists._id,
          isActive: true,
        }).lean();

        if (menus.length === 0) {
          return respond(c, "No menus found", true, 404);
        }

        const api_token = jwt.sign(
          {
            hipalz_id: 1,
          },
          "014f6bc236f2ba1cc2c85cb4a7e723ac7fb46fcc5cbd41c382cdf5495eb72d34",
        );

        setCookie(c, "api_token", api_token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });

        return respond(c, "Menus fetched successfully", false, 200, menus);
      });
    },
  )

  .put("/update_menu", zValidator("json", UpdateMenuSchema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { menuId, businessId, zoneIds, days } = requestData;

      const menu = await Menu.findById(menuId);
      if (!menu) {
        return respond(c, "Menu not found", true, 404);
      }

      const businessPosConfig = await BusinessPosConfig.findOne({
        businessId: businessId,
        isDeleted: false,
        active: true,
        posName: {
          $ne: "HIPAL_Z",
        },
      });

      const isBaseMenu = menu.serviceType === "BASE";

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

      if (businessPosConfig) {
        if (requestData.categoryLayout === 3) {
          const currentMenuType = menu.menuType;
          if (currentMenuType === 2) {
            return respond(
              c,
              "You cannot change the category layout for this menu required for main sub category",
              true,
              400,
            );
          }
        }
        const updatedMenu = await Menu.findByIdAndUpdate(
          menuId,
          {
            name: requestData.name,
            categoryLayout: requestData.categoryLayout,
            cardLayout: requestData.cardLayout,
            primaryColor: requestData.primaryColor,
            secondaryColor: requestData.secondaryColor,
          },
          { new: true, session },
        );

        if (!updatedMenu) {
          return respond(c, "Menu not updated", true, 404);
        }

        return respond(c, "Menu updated successfully", false, 200, {
          _id: updatedMenu._id,
        });
      }

      const updatedMenu = await Menu.findByIdAndUpdate(
        menuId,
        {
          ...requestData,
          zoneIds: isBaseMenu ? [] : requestData.zoneIds,
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
  })

  .put("/push", zValidator("json", pushMenuSchema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { baseMenuId, businessId, pushTo } = requestData;

      const menu = await Menu.findById(baseMenuId);
      if (!menu) return respond(c, "Menu not found", true, 404);

      const tempChanges = await MenuTempChnages.findOne({ businessId });
      if (!tempChanges) return respond(c, "changes not found", true, 404);

      const pushMenus = await Menu.find({ businessId, serviceType: pushTo });
      if (!pushMenus?.length)
        return respond(c, "No target menus found", true, 404);

      const pushMenuIds = pushMenus.map((m) => m._id);

      const {
        changedCategoryIds = [],
        changedAddOnIds = [],
        changedTaxIds = [],
        changedKitchenIds = [],
        changedDishIds = [],
      } = tempChanges;

      const [categories, addOns, taxes, kitchens, dishes] = await Promise.all([
        Category.find({ _id: { $in: changedCategoryIds } }),
        AddOn.find({ _id: { $in: changedAddOnIds } }),
        Tax.find({ _id: { $in: changedTaxIds } }),
        Kitchen.find({ _id: { $in: changedKitchenIds } }),
        Dish.find({ _id: { $in: changedDishIds } }),
      ]);

      const buildBulkOps = (sourceArray, baseKey, updateFieldsFn) => {
        const bulkOps = [];
        for (const src of sourceArray) {
          for (const menuId of pushMenuIds) {
            bulkOps.push({
              updateOne: {
                filter: {
                  [`${baseKey}`]: src._id,
                  businessId,
                  menuId,
                  baseMenuId,
                },
                update: {
                  $set: updateFieldsFn(src),
                },
                upsert: true,
              },
            });
          }
        }
        return bulkOps;
      };

      const categoryOps = buildBulkOps(
        categories,
        "baseMenuCategoryId",
        (c) => ({
          name: c.name,
          visibility: c.visibility,
          availability: c.availability,
          isDeleted: c.isDeleted,
          coverImage: c.coverImage,
          categoryTimings: c.categoryTimings,
          sequence: c.sequence,
          rank: c.rank,
          active: c.active,
        }),
      );

      const addOnOps = buildBulkOps(addOns, "baseMenuAddOnId", (a) => ({
        name: a.name,
        visibility: a.visibility,
        availability: a.availability,
        isDeleted: a.isDeleted,
        active: a.active,
        addOnMaxQuantity: a.addOnMaxQuantity,
        choiceType: a.choiceType,
        choices: a.choices,
        compulsory: a.compulsory,
      }));

      const taxOps = buildBulkOps(taxes, "baseMenuTaxId", (t) => ({
        name: t.name,
        value: t.value,
        isDeleted: t.isDeleted,
        isActive: t.isActive,
      }));

      const kitchenOps = buildBulkOps(kitchens, "baseMenuKitchenId", (k) => ({
        name: k.name,
        description: k.description,
      }));

      const dishOps = buildBulkOps(dishes, "baseMenuDishId", (d) => ({
        name: d.name,
        price: d.price,
        visibility: d.visibility,
        availability: d.availability,
        isDeleted: d.isDeleted,
        active: d.active,
        description: d.description,
        images: d.images,
        portions: d.portions,
        calories: d.calories,
        timings: d.timings,
        dishTypes: d.dishTypes,
        rank: d.rank,
        avgPrepTime: d.avgPrepTime,
      }));

      await Promise.all([
        categoryOps.length && Category.bulkWrite(categoryOps, { session }),
        addOnOps.length && AddOn.bulkWrite(addOnOps, { session }),
        taxOps.length && Tax.bulkWrite(taxOps, { session }),
        kitchenOps.length && Kitchen.bulkWrite(kitchenOps, { session }),
        dishOps.length && Dish.bulkWrite(dishOps, { session }),
      ]);

      await MenuTempChnages.deleteOne({ _id: tempChanges._id }, { session });

      return respond(c, "Menu pushed successfully", false, 200, {
        _id: menu._id,
      });
    });
  });

export default menuRouter;
