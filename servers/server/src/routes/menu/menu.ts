import { Category, Dish, Menu, OutLetInfo } from "@hi/db-models";
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
async function processCategories(
  categoryIds: string[],
  menuId: string,
  sourceMenuId: string,
  session: ClientSession,
) {
  const newCategoryIds = [];
  const categories = await Category.find({
    _id: { $in: categoryIds, menuId: sourceMenuId },
  }).lean();

  for (const category of categories) {
    const relatedDishes = await Dish.find({
      _id: { $in: category.dishIds },
    }).lean();

    const newCategory = new Category({
      ...category,
      menuId: menuId,
      dishIds: [],
    });

    const newDishIds = [];

    for (const dish of relatedDishes) {
      const newDish = new Dish({
        ...dish,
      });

      newDish.categoryIds = newDish?.categoryIds?.map((catId) =>
        String(catId) === String(category._id) ? newCategory._id : catId,
      );

      await newDish.save({ session });
      newDishIds.push(newDish._id);
    }

    newCategory.dishIds = newDishIds;
    await newCategory.save({ session });
    newCategoryIds.push(newCategory._id);
  }

  return newCategoryIds;
}

async function processDishes(
  dishIds: string[],
  sourceMenuId: string,
  session: ClientSession,
) {
  const newDishIds = [];
  const dishes = await Dish.find({
    _id: { $in: dishIds },
    menuId: sourceMenuId,
  }).lean();
  for (const dish of dishes) {
    const newDish = new Dish({
      ...dish,
    });
    await newDish.save({ session });
    newDishIds.push(newDish._id);
  }
  return newDishIds;
}

async function processCompleteMenu(
  sourceMenuId: string,
  menuId: string,
  session: ClientSession,
) {
  const newCategoryIds = [];
  const sourceCategories = await Category.find({
    menuId: sourceMenuId,
  }).lean();
  for (const category of sourceCategories) {
    const sourceDishes = await Dish.find({
      _id: { $in: category.dishIds },
    }).lean();
    const newCategory = new Category({
      ...category,
      _id: new mongoose.Types.ObjectId(),
      menuId: menuId,
    });
    await newCategory.save({ session });
    newCategoryIds.push(newCategory._id);

    const newDishIds = [];
    for (const dish of sourceDishes) {
      const newDish = new Dish({
        ...dish,
      });
      newDish.categoryIds = newDish?.categoryIds?.map((catId) =>
        String(catId) === String(category._id) ? newCategory._id : catId,
      );
      await newDish.save({ session });
      newDishIds.push(newDish._id);
    }
    newCategory.dishIds = newDishIds;
    await newCategory.save({ session });
  }
  return newCategoryIds;
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

  .post("/add_menu", zValidator("json", MenuSchema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const {
        name,
        businessId,
        zoneIds,
        days,
        categoryIds,
        dishIds,
        copyCompleteMenu,
        sourceMenuId,
      } = requestData;

      // Duplicate check by name and businessId
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

      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        menu.categoryIds = await processCategories(
          categoryIds,
          menu._id.toString(),
          sourceMenuId,
          session,
        );
      }

      // Process dishIds if provided (and categoryIds are not)
      if (Array.isArray(dishIds) && dishIds.length > 0) {
        menu.dishIds = await processDishes(dishIds, sourceMenuId, session);
      }

      // Process complete menu copy if required
      if (copyCompleteMenu === true) {
        menu.categoryIds = await processCompleteMenu(
          sourceMenuId,
          menu._id.toString(),
          session,
        );
      }

      await menu.save({ session });
      if (!menu) {
        throw new Error("Menu not created");
      }

      await OutLetInfo.findByIdAndUpdate(
        businessId,
        {
          $set: {
            menuId: menu._id,
          },
        },
        { session },
      );

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
