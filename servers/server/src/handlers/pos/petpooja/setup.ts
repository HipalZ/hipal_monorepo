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
import { POS_NAME } from "../../../constants/posName";
import {
  transformData,
  transformParentCategories,
} from "../../../utils/helper";
import {
  petpoojaPosConfig,
  posApiPaths,
} from "../../../utils/posConfig/petPooja";

async function petPoojaPosSetupHandler(payload: {
  businessId: string;
  restId: string;
  orderVerificationType: string;
  posId: string;
  session: ClientSession;
}) {
  try {
    const { businessId, restId, orderVerificationType, posId, session } =
      payload;

    await Menu.deleteMany({
      businessId,
    });

    let businessPosConfig = await BusinessPosConfig.findOne({
      businessId,
      isDeleted: false,
      active: true,
    });

    if (businessPosConfig) {
      throw new Error("Business already configured for this POS");
    }

    const businessInfo = await Business.findById(businessId).session(session);
    if (!businessInfo) {
      throw new Error("Business not found");
    }
    const modelsToUpdate = [Dish, Category, AddOn, Zone, Table];
    const updateOps = modelsToUpdate.map((Model) =>
      Model.updateMany(
        { businessId },
        { $set: { isDeleted: true } },
        { session },
      ),
    );
    await Promise.all(updateOps);

    let zoneSyncCount = 0;
    let tableSyncCount = 0;

    if (!businessPosConfig) {
      businessPosConfig = new BusinessPosConfig({
        businessId,
        orderMode: "WITH_ORDER",
        accessKey: petpoojaPosConfig.accessKey,
        secretKey: petpoojaPosConfig.secretKey,
        authToken: petpoojaPosConfig.authToken,
        restId,
        orderVerificationType,
        posName: POS_NAME.PETPOOJA,
        posId,
        isDeleted: false,
        date: Date.now(),
        active: true,
      });
      await businessPosConfig.save({ session });
    }

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
        pos: true,
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
          pos: true,
        },
        { upsert: true, new: true, session },
      );

      zoneSyncCount += 1;
    }

    for (const table of tables) {
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
          pos: true,
        },
        { upsert: true, new: true, session },
      );

      tableSyncCount += 1;

      await BusinessPosConfig.findOneAndUpdate(
        { businessId },
        { $set: { defaultTableName: tableDoc.name } },
        { session },
      );

      // make sure zone has reference
      await Zone.findOneAndUpdate(
        { zoneId: zoneIdToLink },
        { $addToSet: { tableIds: tableDoc._id } },
        { session },
      );

      // create short URL once per table
      const longUrl = `https://hipal-test.hipalz.com/${businessInfo.customLink}/explore?tableName=${tableDoc.name}`;
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

    const [menuDoc] = await Menu.create(
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
        },
      ],
      { session },
    );

    const dtableName = await Table.findOne({
      businessId: businessId,
    }).session(session);

    const { data: menuRes } = await axios.post(posApiPaths.fetchMenu, {
      "app-key": businessPosConfig.accessKey,
      "app-secret": businessPosConfig.secretKey,
      "access-token": businessPosConfig.authToken,
      restID: businessPosConfig.restId,
      tableNo: dtableName?.name,
    });
    let dishSyncCount = 0;
    let categorySyncCount = 0;
    let addOnSyncCount = 0;

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
          pos: true,
          rank: pc?.rank,
          active: pc?.active === "1",
        },
        { upsert: true, new: true, session },
      );
    }

    for (const cat of transformedCategories) {
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
          menuId: menuDoc._id,
          parentCategoryIds: [], // we fill below
          subCategoryIds: [],
          dishIds: [],
          active: cat.active === "1",
          timings: cat.timings,
        },
        { upsert: true, new: true, session },
      );

      categorySyncCount += 1;

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

      for (const dish of cat.dishIds || []) {
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
            menuId: menuDoc._id,
            categoryIds: [],
            addOnIds: [],
            recommendationIds: [],
            businessId,
            posTax: dish.posTax,
            active: dish.active === "1",
          },
          { upsert: true, new: true, session },
        );

        dishSyncCount += 1;

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
              menuId: menuDoc._id,
              dishIds: [],
              active: addOn.active === "1",
            },
            { upsert: true, new: true, session },
          );

          addOnSyncCount += 1;

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
    return true;
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message || "Internal error in POS setup",
    };
  }
}

async function petPoojaPosSyncMenuHandler(payload: {
  businessId: string;
  restId: string;
  orderVerificationType: string;
  posId: string;
  session: ClientSession;
}) {
  try {
    const { businessId, restId, orderVerificationType, posId, session } =
      payload;

    await Menu.deleteMany({
      businessId,
    });

    let businessPosConfig = await BusinessPosConfig.findOne({
      businessId,
      isDeleted: false,
      active: true,
    });

    if (businessPosConfig) {
      throw new Error("Business already configured for this POS");
    }

    const businessInfo = await Business.findById(businessId).session(session);
    if (!businessInfo) {
      throw new Error("Business not found");
    }
    const modelsToUpdate = [Dish, Category, AddOn, Zone, Table];
    const updateOps = modelsToUpdate.map((Model) =>
      Model.updateMany(
        { businessId },
        { $set: { isDeleted: true } },
        { session },
      ),
    );
    await Promise.all(updateOps);

    let zoneSyncCount = 0;
    let tableSyncCount = 0;

    if (!businessPosConfig) {
      businessPosConfig = new BusinessPosConfig({
        businessId,
        orderMode: "WITH_ORDER",
        accessKey: petpoojaPosConfig.accessKey,
        secretKey: petpoojaPosConfig.secretKey,
        authToken: petpoojaPosConfig.authToken,
        restId,
        orderVerificationType,
        posName: POS_NAME.PETPOOJA,
        posId,
        isDeleted: false,
        date: Date.now(),
        active: true,
      });
      await businessPosConfig.save({ session });
    }

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
        pos: true,
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
          pos: true,
        },
        { upsert: true, new: true, session },
      );

      zoneSyncCount += 1;
    }

    for (const table of tables) {
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
          pos: true,
        },
        { upsert: true, new: true, session },
      );

      tableSyncCount += 1;

      await BusinessPosConfig.findOneAndUpdate(
        { businessId },
        { $set: { defaultTableName: tableDoc.name } },
        { session },
      );

      // make sure zone has reference
      await Zone.findOneAndUpdate(
        { zoneId: zoneIdToLink },
        { $addToSet: { tableIds: tableDoc._id } },
        { session },
      );

      // create short URL once per table
      const longUrl = `https://hipal-test.hipalz.com/${businessInfo.customLink}/explore?tableName=${tableDoc.name}`;
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

    const [menuDoc] = await Menu.create(
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
        },
      ],
      { session },
    );

    const dtableName = await Table.findOne({
      businessId: businessId,
    }).session(session);

    const { data: menuRes } = await axios.post(posApiPaths.fetchMenu, {
      "app-key": businessPosConfig.accessKey,
      "app-secret": businessPosConfig.secretKey,
      "access-token": businessPosConfig.authToken,
      restID: businessPosConfig.restId,
      tableNo: dtableName?.name,
    });
    let dishSyncCount = 0;
    let categorySyncCount = 0;
    let addOnSyncCount = 0;

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
          pos: true,
          rank: pc?.rank,
          active: pc?.active === "1",
        },
        { upsert: true, new: true, session },
      );
    }

    for (const cat of transformedCategories) {
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
          menuId: menuDoc._id,
          parentCategoryIds: [], // we fill below
          subCategoryIds: [],
          dishIds: [],
          active: cat.active === "1",
          timings: cat.timings,
        },
        { upsert: true, new: true, session },
      );

      categorySyncCount += 1;

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

      for (const dish of cat.dishIds || []) {
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
            menuId: menuDoc._id,
            categoryIds: [],
            addOnIds: [],
            recommendationIds: [],
            businessId,
            posTax: dish.posTax,
            active: dish.active === "1",
          },
          { upsert: true, new: true, session },
        );

        dishSyncCount += 1;

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
              menuId: menuDoc._id,
              dishIds: [],
              active: addOn.active === "1",
            },
            { upsert: true, new: true, session },
          );

          addOnSyncCount += 1;

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
    return true;
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message || "Internal error in POS setup",
    };
  }
}

export { petPoojaPosSetupHandler, petPoojaPosSyncMenuHandler };
