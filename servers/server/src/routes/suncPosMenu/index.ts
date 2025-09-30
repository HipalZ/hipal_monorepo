// books.ts
import {
  AddOn,
  Business,
  Category,
  Dish,
  Menu,
  Table,
  UrlModel,
  Zone,
} from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import { transformData, transformParentCategories } from "../../utils/helper";
import { posApiPaths } from "../../utils/posConfig/petPooja";

const syncPosMenuRouter = new Hono().post(
  "/",
  zValidator(
    "json",
    z.object({
      businessId: z.string().min(1).max(50),
      restId: z.string().min(1).max(50),
      tableName: z.string().min(1).max(50),
    }),
  ),
  async (c) => {
    //@ts-ignore  // runInTransaction handles rollback/commit + error propagation
    return runInTransaction(async (session) => {
      const { businessId, restId, tableName } = await c.req.json();

      const business = await Business.findById(businessId).session(session);
      if (!business) throw new Error("Business not found");

      await Dish.updateMany(
        { businessId, active: true, isDeleted: false },
        {
          active: false,
        },
        { session },
      );
      await Category.updateMany(
        { businessId, active: true, isDeleted: false },
        {
          active: false,
        },
        { session },
      );

      await AddOn.updateMany(
        { businessId, active: true, isDeleted: false },
        {
          active: false,
        },
        { session },
      );
      await Zone.updateMany(
        {
          businessId,
          active: true,
        },
        {
          active: false,
        },
        { session },
      );

      await Table.updateMany(
        {
          businessId,
          active: true,
        },
        {
          active: false,
        },
        { session },
      );

      let dishSyncCount = 0;
      let categorySyncCount = 0;
      let addOnSyncCount = 0;
      let zoneSyncCount = 0;
      let tableSyncCount = 0;

      const { data: areaTableRes } = await axios.post(
        posApiPaths.fetchAreaAndTables,
        {
          "app-key": "6jh08fc457wp2qkv1dntbrma3yeouxig",
          "app-secret": "26669606e665e4a014ca1d426ff2d643551ed21a",
          "access-token": "9aeec28f3aab55dd23033194beb39972d7ff6890",
          restID: restId,
          tableNo: tableName,
        },
      );

      if (areaTableRes.success !== "1")
        throw new Error("POS area/table fetch failed");

      const areas = areaTableRes.areas || [];
      const tables = areaTableRes.tables || [];

      let defaultZone = null;

      if (areas.length === 0) {
        defaultZone = new Zone({
          businessId,
          name: "POS",
          zoneId: nanoid(5),
          active: true,
          tableIds: [],
          visibility: true,
          pos: false,
        });
        await defaultZone.save({ session });
      }

      for (const area of areas) {
        defaultZone = await Zone.findOneAndUpdate(
          { zoneId: area.restaurantareaid },
          {
            businessId,
            name: area.displayname,
            zoneId: area.restaurantareaid,
            active: area.active === "1",
            rank: area.rank,
            tableIds: [],
            pos: false,
          },
          { upsert: true, new: true, session },
        );
        zoneSyncCount += 1;
      }

      for (const table of tables) {
        tableSyncCount += 1;

        const zoneIdToLink =
          areas.length === 0 ? defaultZone?.zoneId : table.restaurantareaid;

        const tableDoc = await Table.findOneAndUpdate(
          { tableId: table.id },
          {
            name: table.table_no,
            businessId,
            zoneId: zoneIdToLink,
            active: table.active === "1",
            rank: table.rank,
            tableId: table.id,
            internalZoneId: defaultZone?._id,
            pos: false,
          },
          { upsert: true, new: true, session },
        );

        // make sure zone has reference
        await Zone.findOneAndUpdate(
          { zoneId: zoneIdToLink },
          { $addToSet: { tableIds: tableDoc._id } },
          { session },
        );

        // create short URL once per table
        const longUrl = `https://hipal-test.hipalz.com/${business.customLink}/explore?tableName=${tableDoc.name}`;
        const existingShort = await UrlModel.exists({
          businessId,
          longUrl,
        }).session(session);
        if (!existingShort) {
          const shortCode = nanoid(5);
          const [{ shortUrl }] = await UrlModel.create(
            [
              {
                businessId,
                longUrl,
                shortUrl: `https://api.test.hipalz.com/surl/${shortCode}`,
                urlCode: shortCode,
              },
            ],
            { session },
          );
          await Table.findOneAndUpdate(
            { _id: tableDoc._id },
            { tableLink: shortUrl },
            { session },
          );
        }
      }

      const zoneIds = (await Zone.find({ businessId }).session(session)).map(
        (z) => z._id.toString(),
      );

      let menuUpdate = await Menu.findOneAndUpdate(
        { businessId, isActive: true },
        { zoneIds },
        { session },
      );
      if (!menuUpdate) {
        [menuUpdate] = await Menu.create(
          [
            {
              name: "Default",
              businessId,
              zoneIds,
              menuType: 2,
              days: [1, 2, 3, 4, 5, 6, 7],
              startTime: 240,
              endTime: 239,
              isActive: true,
              isDeleted: false,
              categoryLayout: 2,
              cardLayout: 2,
              primaryColor: "#ec4899",
              secondaryColor: "#fce7f3",
              default: true,
              pos: false,
            },
          ],
          { session },
        );
      }

      const { data: menuRes } = await axios.post(posApiPaths.fetchMenu, {
        "app-key": "6jh08fc457wp2qkv1dntbrma3yeouxig",
        "app-secret": "26669606e665e4a014ca1d426ff2d643551ed21a",
        "access-token": "9aeec28f3aab55dd23033194beb39972d7ff6890",
        restID: restId,
        tableNo: tableName,
      });

      const parentCategories = transformParentCategories(
        menuRes.group_categories || [],
        menuRes.categories || [],
        businessId,
      );
      const transformedCategories = transformData(menuRes);

      for (const pc of parentCategories) {
        await Category.findOneAndUpdate(
          { businessId, posCategoryId: pc?._id },
          {
            businessId,
            visibility: true,
            availability: true,
            name: pc?.name,
            hierarchy: "PARENT",
            posCategoryId: pc?._id,
            parentCategoryIds: [],
            subCategoryIds: [],
            dishIds: [],
            coverImage: pc?.coverImage,
            menuId: menuUpdate._id,
            rank: pc?.rank,
            active: pc?.active === "1",
          },
          { upsert: true, new: true, session },
        );
      }

      for (const cat of transformedCategories) {
        categorySyncCount += 1;
        const childCat = await Category.findOneAndUpdate(
          { businessId, posCategoryId: cat._id },
          {
            name: cat.name,
            visibility: cat.visibility,
            availability: cat.availability,
            rank: cat.categoryrank,
            businessId,
            coverImage: cat.coverImage,
            hierarchy: cat.hierarchy,
            menuId: menuUpdate._id,
            parentCategoryIds: [], // we fill below
            subCategoryIds: [],
            dishIds: [],
            active: cat.active === "1",
            timings: cat.timings,
            pos: false,
          },
          { upsert: true, new: true, session },
        );

        for (const pId of cat.parentCategoryIds || []) {
          const parentCat = await Category.findOne({
            businessId,
            posCategoryId: pId,
          });
          if (parentCat) {
            await Category.findOneAndUpdate(
              { _id: parentCat._id },
              { $addToSet: { subCategoryIds: childCat._id } },
              { session },
            );
            await Category.findOneAndUpdate(
              { _id: childCat._id },
              { $addToSet: { parentCategoryIds: parentCat._id } },
              { session },
            );
          }
        }

        // 10‑c. upsert dishes in this category
        for (const dish of cat.dishIds || []) {
          dishSyncCount += 1;
          const dishDoc = await Dish.findOneAndUpdate(
            { businessId, posDishId: dish._id },
            {
              visibility: dish.visibility,
              availability: dish.availability,
              name: dish.name,
              price: dish.price,
              description: dish.description,
              dishTypes: dish.dishTypes,
              images: dish.images,
              portions: dish.portions,
              rank: dish.itemrank,
              ignoreDiscount: dish.ignoreDiscount,
              ignoreTax: dish.ignoreTax,
              posDishId: dish._id,
              menuId: menuUpdate._id,
              categoryIds: [],
              addOnIds: [],

              businessId,
              posTax: dish.posTax,
              active: dish.active === "1",
              pos: false,
            },
            { upsert: true, new: true, session },
          );

          await Dish.findByIdAndUpdate(
            dishDoc._id,
            { $addToSet: { categoryIds: childCat._id } },
            { session },
          );
          await Category.findByIdAndUpdate(
            childCat._id,
            { $addToSet: { dishIds: dishDoc._id } },
            { session },
          );

          for (const addOn of dish.addOnIds || []) {
            addOnSyncCount += 1;
            const addOnDoc = await AddOn.findOneAndUpdate(
              { businessId, posAddOnId: addOn._id },
              {
                posAddOnId: addOn._id,
                businessId,
                name: addOn.name,
                visibility: addOn.visibility,
                availability: addOn.availability,
                addOnMaxQuantity: addOn.addOnMaxQuantity,
                compulsory: addOn.addon_item_selection_min === "1" ? 1 : 0,
                choiceType: addOn.choiceType,
                choices: addOn.choices,
                menuId: menuUpdate._id,
                dishIds: [],
                active: addOn.active === "1",
              },
              { upsert: true, new: true, session },
            );

            await Dish.findByIdAndUpdate(
              dishDoc._id,
              { $addToSet: { addOnIds: addOnDoc._id } },
              { session },
            );
            await AddOn.findByIdAndUpdate(
              addOnDoc._id,
              { $addToSet: { dishIds: dishDoc._id } },
              { session },
            );
          }
        }
      }

      return c.json({
        message: "POS Config saved successfully",
        err: false,
        data: {
          dishSyncCount,
          categorySyncCount,
          addOnSyncCount,
          zoneSyncCount,
          tableSyncCount,
        },
      });
    });
  },
);

export default syncPosMenuRouter;
