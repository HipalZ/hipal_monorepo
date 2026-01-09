import {
  AddOn,
  Business,
  BusinessPosConfig,
  Category,
  Dish,
  Menu,
  Table,
  UrlModel,
  Zone,
} from "@hi/db-models";
import axios from "axios";
import type { ClientSession } from "mongoose";
import { nanoid } from "nanoid";
import {
  transformData,
  transformParentCategories,
} from "../../../utils/helper";
import { posApiPaths } from "../../../utils/posConfig/petPooja";

async function petPoojaPosSyncMenuHandler(payload: {
  businessId: string;
  restId: string;
  session: ClientSession;
}) {
  try {
    const { businessId, restId, session } = payload;

    const businessInfo = await Business.findById(businessId).session(session);
    if (!businessInfo) {
      throw new Error("Business not found");
    }

    const businessPosConfig = await BusinessPosConfig.findOne({
      businessId,
      isDeleted: false,
      active: true,
    });

    const menu = await Menu.findOne({ businessId, isActive: true }).session(
      session,
    );

    if (!menu) {
      throw new Error("Active menu not found for business");
    }

    if (!businessPosConfig) {
      throw new Error("POS not configured for this business");
    }

    const modelsToUpdate = [Dish, Category, AddOn, Zone, Table];
    const updateOps = modelsToUpdate.map((Model) =>
      Model.updateMany(
        { businessId, active: true },
        { $set: { active: false } },
        { session },
      ),
    );
    await Promise.all(updateOps);

    let dishSyncCount = 0;
    let categorySyncCount = 0;
    let addOnSyncCount = 0;
    let zoneSyncCount = 0;
    let tableSyncCount = 0;

    const { data: areaTableRes } = await axios.post(
      posApiPaths.fetchAreaAndTables,
      {
        "app-key": businessPosConfig.accessKey,
        "app-secret": businessPosConfig.secretKey,
        "access-token": businessPosConfig.authToken,
        restID: restId,
        tableNo: "",
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
      });
      await defaultZone.save({ session });
    }

    for (const area of areas) {
      await Zone.findOneAndUpdate(
        { zoneId: area.restaurantareaid },
        {
          businessId,
          name: area.displayname,
          zoneId: area.restaurantareaid,
          active: area.active === "1",
          rank: area.rank,
          tableIds: [],
        },
        { upsert: true, new: true, session },
      );
      zoneSyncCount += 1;
    }

    for (const table of tables) {
      tableSyncCount += 1;

      const zoneIdToLink =
        areas.length === 0 ? defaultZone?.zoneId : table.restaurantareaid;

      const zone = await Zone.findOne({
        businessId,
        zoneId: zoneIdToLink,
      }).session(session);

      const tableDoc = await Table.findOneAndUpdate(
        { tableId: table.id },
        {
          name: table.table_no,
          businessId,
          zoneId: zoneIdToLink,
          active: table.active === "1",
          rank: table.rank,
          tableId: table.id,
          internalZoneId: zone?._id || defaultZone?._id,
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
      const longUrl = `https://hipalz.com/${businessInfo.customLink}/explore?tableName=${tableDoc.name}`;
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
              shortUrl: `https://api.hipalz.com/surl/${shortCode}`,
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

    await Menu.findOneAndUpdate(
      { businessId, isActive: true },
      { zoneIds },
      { session },
    );

    const { data: menuRes } = await axios.post(posApiPaths.fetchMenu, {
      "app-key": businessPosConfig.accessKey,
      "app-secret": businessPosConfig.secretKey,
      "access-token": businessPosConfig.authToken,
      restID: businessPosConfig.restId,
      tableNo: businessPosConfig.defaultTableName,
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
          menuId: menu._id,
          pos: true,
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
          pos: true,
          name: cat.name,
          visibility: cat.visibility,
          availability: cat.availability,
          rank: cat.categoryrank,
          businessId,
          coverImage: cat.coverImage,
          hierarchy: cat.hierarchy,
          menuId: menu._id,
          parentCategoryIds: [], // we fill below
          subCategoryIds: [],
          dishIds: [],
          active: cat.active === "1",
          timings: cat.timings,
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
            pos: true,
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
            menuId: menu._id,
            categoryIds: [],
            addOnIds: [],

            businessId,
            posTax: dish.posTax,
            active: dish.active === "1",
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
              pos: true,
              posAddOnId: addOn._id,
              businessId,
              name: addOn.name,
              visibility: addOn.visibility,
              availability: addOn.availability,
              addOnMaxQuantity: addOn.addOnMaxQuantity,
              compulsory: addOn.addon_item_selection_min === "1" ? 1 : 0,
              choiceType: addOn.choiceType,
              choices: addOn.choices,
              menuId: menu._id,
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
  } catch (error) {
    throw new Error((error as Error).message || "Internal error in POS setup");
  }
}

export { petPoojaPosSyncMenuHandler };
