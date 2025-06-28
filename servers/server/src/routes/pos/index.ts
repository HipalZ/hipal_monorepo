import {
  AddOn,
  Business,
  BusinessPosConfig,
  Category,
  Couponz,
  DeviceToken,
  Dish,
  Kitchen,
  KotOrder,
  Menu,
  OutLetInfo,
  Pos,
  Table,
  Tax,
  UrlModel,
  User,
  UserAnalytic,
  UserSession,
  Zone,
} from "@hi/db-models";
import { OrderVerificationTypeEnum } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { nanoid } from "nanoid";
import { z } from "zod";
import { ubacMiddleware } from "../../../middleware/checkPermissions";
import type { KotOrderTypes } from "../../utils/bill";
import {
  calculateBillDishIds,
  calculateBillTotals,
  calculateFinalTotal,
  calculateGst,
  calculateTotalDiscount,
  updateTableSession,
} from "../../utils/bill";
import {
  calculateCartBill,
  convertToPetpoojaCart,
  transformData,
  transformParentCategories,
} from "../../utils/helper";
import { sendBillPrintEvent, sendKOTPrintEvent } from "../../utils/kot";
import { petpoojaPosConfig, posApiPaths } from "../../utils/posConfig/petPooja";
import { respond } from "../../utils/response";
const admin = require("firebase-admin");
export const generateTenDigitCode = (): string => {
  const min = 1000000000; // Minimum 10-digit number
  const max = 9999999999; // Maximum 10-digit number
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
};

const saveKotOrder = async (
  tableName: string,
  businessId: string,
  customerName: string,
  customerPhone: string,
  internalCart: unknown[],
  userId: string,
  accepted: boolean,
  tableId: string,
  edited?: boolean,
  editedBy?: string,
  session?: ClientSession,
) => {
  const saveKot = await KotOrder.create(
    [
      {
        tableName: tableName,
        businessId: businessId,
        phone: customerPhone,
        cart: internalCart,
        date: Date.now(),
        userId: userId,
        name: customerName,
        accepted: accepted,
        tableId: tableId,
        edited: edited,
        editedBy: editedBy,
      },
    ],
    {
      session,
    },
  );

  if (!saveKot) {
    return {};
  }

  return {
    kotId: saveKot[0]._id,
  };
};

export const sendPushNotification = async (
  token: string,
  customerName: string,
  tableName: string,
) => {
  const pushMessage = {
    token: token, // or use 'topic' if you're sending to a topic
    notification: {
      title: "New Order",
      body: `New order received from ${customerName} for table ${tableName}`,
    },
    android: {
      notification: {
        channel_id: "custom_channel_id",
        sound: "order",
      },
    },
  };

  try {
    const response = await admin.messaging().send(pushMessage);
    return { success: true, response };
  } catch (error) {
    console.error("Error sending FCM message:", error);
  }
};

const saveOrder = async (
  tableName: string,
  businessId: string,
  customerName: string,
  customerPhone: string,
  internalCart: unknown[],
  userId: string,
  accepted: boolean,
  tableId: string,
  edited: boolean,
  editedBy: string,
  hiCode: string,
  session: ClientSession,
) => {
  const resData = await saveKotOrder(
    tableName,
    businessId,
    customerName,
    customerPhone,
    internalCart,
    userId,
    true,
    tableId,
    false,
    null,
    session,
  );
  const totalBill = calculateCartBill(internalCart);
  await Table.findOneAndUpdate(
    {
      businessId: businessId,
      name: tableName,
    },
    {
      $inc: {
        totalItemCount: internalCart.length,
        currentTableAmount: totalBill,
      },
      $set: {
        status: "ACTIVE",
        hiCode: hiCode,
        date: Date.now(),
      },
    },
    {
      new: true,
      session,
    },
  );

  return {
    message: "Data fetched successfully",
    err: false,
    data: {
      success: true,
      hiCode: hiCode,
      name: customerName,
      phone: customerPhone,
      kotId: resData?.kotId?.toString(),
    },
  };
};

const posRouter = new Hono()
  .get("/all_pos", async (c) => {
    const allPos = await Pos.find({}).select("name");

    return c.json(
      {
        message: "Data fetched successfully",
        err: false,
        data: allPos,
      },
      200,
    );
  })

  .get(
    "/get_bill",
    ubacMiddleware("bill"),
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
        generatedBy: z.string().min(1).max(200),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName, generatedBy } = c.req.query();
        const kotOrders = (await KotOrder.find({
          tableName,
          settled: false,
          businessId,
        }).lean()) as KotOrderTypes[];

        const cartItems = kotOrders.flatMap((order) =>
          order.cart.filter((item) => !item.isDeleted),
        );

        const { totalDishTotal, totalGst } = calculateBillTotals(kotOrders);

        // Get the table session
        let tableSession = await UserSession.findOne({
          businessId,
          tableName,
        }).populate(
          "discountAppliedBy discountRemovedBy serviceChargeAppliedBy serviceChargeRemovedBy",
        );
        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        // Get service charge info
        const serviceCharge = await Tax.findOne({
          businessId,
          menuId: cartItems[0].dish.menuId,
          isActive: true,
          name: "servicecharge",
        });

        const serviceChargePercentage = serviceCharge?.value || 0;

        // Calculate base amount (totalDishTotal minus discounts)
        const baseAmount =
          totalDishTotal -
          tableSession.claimedCoins -
          tableSession.couponDiscount -
          tableSession.discount;

        let serviceChargeAmount = Math.round(
          (serviceChargePercentage / 100) * baseAmount,
        );
        if (tableSession.isServiceChargeRemoved) serviceChargeAmount = 0;

        // Calculate GST
        let newGst = 0;
        const newSubTotal =
          totalDishTotal -
          tableSession.discount -
          tableSession.claimedCoins -
          tableSession.couponDiscount;

        if (
          tableSession.discountAppliedBy &&
          tableSession.discountAppliedOn === "ON_DISH"
        ) {
          newGst = (tableSession.gstPercentage / 100) * newSubTotal;
          newGst -= tableSession.newDishGst;
        } else if (tableSession.discountAppliedBy) {
          newGst = (tableSession.gstPercentage / 100) * newSubTotal;
        } else {
          newGst = totalGst;
        }

        const totalDis = calculateTotalDiscount(
          tableSession.discount,
          tableSession.claimedCoins,
          tableSession.couponDiscount,
        );

        // Final total
        const newTotal = calculateFinalTotal(
          newSubTotal,
          totalDis,
          newGst,
          serviceChargeAmount,
          tableSession.otherTax,
          tableSession.tips,
        );

        // Update table session with new values
        tableSession = await updateTableSession(
          businessId,
          tableName,
          session,
          {
            gst: Number(newGst).toFixed(2),
            total: newTotal,
            serviceCharge: serviceChargeAmount,
            generatedBy: generatedBy,
          },
        );

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        return c.json(
          {
            message: "Data fetched successfully",
            err: false,
            data: {
              customerName: tableSession.customerName,
              customerPhone: kotOrders[0].phone,
              tableName: tableSession.tableName,
              couponId: tableSession.couponId,
              discountAppliedOn: tableSession.discountAppliedOn,
              reasonOfDiscount: tableSession.reasonOfDiscount,
              reasonOfServiceCharge: tableSession.reasonOfServiceCharge,
              serviceChargeAppliedBy:
                tableSession?.serviceChargeAppliedBy?.name || "",
              serviceChargeRemovedBy:
                tableSession?.serviceChargeRemovedBy?.name || "",
              discountAppliedBy: tableSession?.discountAppliedBy?.name || "",
              discountRemovedBy: tableSession?.discountRemovedBy?.name || "",
              items: cartItems,
              subTotal: totalDishTotal,
              gst: tableSession.gst,
              discount: tableSession.discount,
              claimedCoins: tableSession.claimedCoins,
              couponDiscount: tableSession.couponDiscount,
              serviceCharge: tableSession.serviceCharge,
              otherTax: tableSession.otherTax,
              tips: tableSession.tips,
              total: tableSession.total,
              billId: tableSession._id.toString(),
            },
          },
          200,
        );
      });
    },
  )

  .get(
    "/fetch_pos_config",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(3).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId } = c.req.query();

        const posConfig = await BusinessPosConfig.findOne({
          businessId: businessId,
          isDeleted: false,
          active: true,
        });
        if (!posConfig) {
          return c.json(
            {
              message: "POS not found",
              err: true,
              data: { success: false },
            },
            404,
          );
        }

        return respond(c, "Data fetch", false, 200, posConfig);
      });
    },
  )

  .get(
    "/kitchens",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(3).max(200),
        menuId: z.string().min(3).max(200),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, menuId } = c.req.query();
        const kitchens = await Kitchen.find({
          businessId: businessId,
          menuId: menuId,
          isDeleted: false,
        });

        return respond(c, "Data fetch", false, 200, kitchens);
      });
    },
  )
  .get(
    "/taxes",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(3).max(200),
        menuId: z.string().min(3).max(200),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, menuId } = c.req.query();
        const taxes = await Tax.find({
          businessId: businessId,
          menuId: menuId,
          isDeleted: false,
        });

        return respond(c, "Data fetch", false, 200, taxes);
      });
    },
  )

  .post(
    "/configure",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(1).max(50),
        restId: z.string().min(1).max(50),
        posId: z.string().min(1).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { businessId, restId } = await c.req.json();

        // Remove old menus
        await Menu.deleteMany({ businessId }, { session });

        // Fetch custom link
        const business = await Business.findById(businessId)
          .select("customLink")
          .session(session);

        // Fetch areas and tables from POS
        const fetchAreaAndTable = await axios.post(
          posApiPaths.fetchAreaAndTables,
          {
            "app-key": petpoojaPosConfig.accessKey,
            "app-secret": petpoojaPosConfig.secretKey,
            "access-token": petpoojaPosConfig.authToken,
            restID: restId,
            tableNo: "",
          },
        );

        if (fetchAreaAndTable.data.success !== "1") {
          throw new Error("area and table not fetched");
        }

        // Active areas and tables
        const areas = fetchAreaAndTable.data.areas.filter(
          (a) => a.active === "1",
        );
        const tables = fetchAreaAndTable.data.tables.filter(
          (t) => t.active === "1",
        );

        // Ensure at least one zone
        let zone = null;
        if (areas.length === 0) {
          // Create fallback zone within the transaction
          zone = new Zone({
            businessId,
            name: "POS",
            zoneId: nanoid(5),
            active: true,
            tableIds: [],
            visibility: true,
          });
          await zone.save({ session });
        }

        // Upsert each area as a zone
        for (const area of areas) {
          zone = await Zone.findOneAndUpdate(
            { zoneId: area.restaurantareaid },
            {
              name: area.displayname,
              businessId,
              zoneId: area.restaurantareaid,
              active: area.active,
              rank: area.rank,
            },
            { upsert: true, new: true, session },
          );
        }

        // Create/update tables and link to zones
        for (const table of tables) {
          const currentZoneId =
            areas.length === 0 ? zone?.zoneId : table.restaurantareaid;

          // Upsert table
          const creatingTable = await Table.findOneAndUpdate(
            { tableId: table.id },
            {
              name: table.table_no,
              businessId,
              zoneId: currentZoneId,
              active: table.active,
              rank: table.rank,
              tableId: table.id,
              internalZoneId: zone?._id,
            },
            { upsert: true, new: true, session },
          );

          // Add table to zone.tableIds
          await Zone.findOneAndUpdate(
            { zoneId: currentZoneId },
            { $addToSet: { tableIds: creatingTable._id } },
            { new: true, session },
          );

          // Create short URL if not exists
          const longUrl = `https://hipal-test.hipalz.com/${business?.customLink}/explore?tableName=${creatingTable.name}`;
          const exists = await UrlModel.findOne({
            businessId,
            longUrl,
          }).session(session);
          if (!exists) {
            const shortCode = nanoid(5);
            const createShortUrl = await UrlModel.create(
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
              { tableId: table.id },
              { tableLink: createShortUrl[0].shortUrl },
              { new: true, session },
            );
          }
        }

        const zones = await Zone.find({ businessId }).session(session);
        const zoneIds = zones.map((z) => z._id.toString());

        await Menu.create(
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
            },
          ],
          { session },
        );

        return c.json(
          {
            message: "POS Config saved successfully",
            err: false,
            data: { success: true },
          },
          200,
        );
      });
    },
  )

  .post(
    "/setup",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(1).max(50),
        restId: z.string().min(1).max(50),
        posId: z.string().min(1).max(50),
        orderVerificationType: z.enum(OrderVerificationTypeEnum),
      }),
    ),
    async (c) => {
      //@ts-ignore  // runInTransaction handles rollback/commit + error propagation
      return runInTransaction(async (session) => {
        const { businessId, restId, orderVerificationType, posId } =
          await c.req.json();

        const business = await Business.findById(businessId).session(session);
        if (!business) throw new Error("Business not found");

        let businessPosConfig = await BusinessPosConfig.findOne({
          businessId,
          isDeleted: false,
          active: true,
        });

        if (businessPosConfig) {
          return respond(c, "POS already configured", true, 400, {});
        }

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
        let zoneSyncCount = 0;
        let tableSyncCount = 0;

        if (!businessPosConfig) {
          if (!petpoojaPosConfig)
            throw new Error("Petpooja keys missing in env/config");

          businessPosConfig = new BusinessPosConfig({
            businessId,
            branchId: business._id,
            restName: business.name,
            orderMode: "WITH_ORDER",
            accessKey: petpoojaPosConfig.accessKey,
            secretKey: petpoojaPosConfig.secretKey,
            authToken: petpoojaPosConfig.authToken,
            restId,
            orderVerificationType,
            posName: "Petpooja",
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

        const { data: menuRes } = await axios.post(posApiPaths.fetchMenu, {
          "app-key": businessPosConfig.accessKey,
          "app-secret": businessPosConfig.secretKey,
          "access-token": businessPosConfig.authToken,
          restID: businessPosConfig.restId,
          tableNo: businessPosConfig.defaultTableName,
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

          // 10‑c. upsert dishes in this category
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
  )

  .post(
    "/sync_menu",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(1).max(50),
        restId: z.string().min(1).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore  // runInTransaction handles rollback/commit + error propagation
      return runInTransaction(async (session) => {
        const { businessId, restId } = await c.req.json();

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

        const businessPosConfig = await BusinessPosConfig.findOne({
          businessId,
          isDeleted: false,
          active: true,
        });

        const menu = await Menu.findOne({ businessId, isActive: true }).session(
          session,
        );

        if (!menu) {
          throw new Error("Menu not found");
        }

        if (!businessPosConfig) {
          throw new Error("BusinessPosConfig not found");
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
  )

  .post(
    "/save_kot",
    zValidator(
      "json",
      z.object({
        tableName: z.string().max(30),
        internalCart: z.array(z.object({})),
        businessId: z.string().min(1).max(50),
        userId: z.string().min(1).max(100),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { internalCart, tableName, businessId, userId } =
          await c.req.json();
        //  table info
        const tableData = await Table.findOne({
          businessId: businessId,
          name: tableName,
        });

        if (!tableData) {
          return respond(c, "Table not found", true, 404, {});
        }

        const userData = await User.findById(userId);
        if (!userData) {
          return respond(c, "User not found", true, 404, {});
        }

        const posConfigData = await BusinessPosConfig.findOne({
          businessId: businessId,
          isDeleted: false,
          active: true,
        });

        if (!posConfigData) {
          return respond(c, "POS not found", true, 404, {});
        }

        const registrationToken = await DeviceToken.find({
          businessId: businessId,
        });

        if (registrationToken.length > 0) {
          for (const obj of registrationToken) {
            if (obj.notification) {
              sendPushNotification(
                obj.token,
                userData.name as string,
                tableName,
              );
            }
          }
        }

        const userTableSession = await UserSession.findOne({
          tableName: tableName,
          businessId: businessId,
        });

        if (userTableSession && userTableSession?.tableName !== tableName) {
          return c.json(
            {
              message: `User already active on table ${userTableSession.tableName} please close that table first`,
              err: true,
              data: {
                success: false,
                data: {
                  tableName: userTableSession.tableName,
                  hiCode: userTableSession.hiCode,
                },
              },
            },
            409,
          );
        }

        if (userTableSession) {
          if (
            !userTableSession.phoneNumbers.includes(userData.phone) &&
            // if captain place the order then we need to check if the table is already occupied by user
            userTableSession.phoneNumbers.length > 0
          ) {
            return c.json(
              {
                message: `this table is already occupied by ${userTableSession.customerName} please ask them to place the order`,
                err: true,
                data: {
                  success: false,
                  name: userTableSession.customerName,
                  phone: userTableSession.pin,
                },
              },
              403,
            );
          }
        }

        if (!userTableSession) {
          const tenDigitCode = generateTenDigitCode();
          const hiCode = Math.floor(1000 + Math.random() * 9000).toString();
          // Generate the hicode and save it in the user session
          await Table.findOneAndUpdate(
            {
              businessId: businessId,
              name: tableName,
            },
            {
              hiCode: hiCode,
              $addToSet: {
                userIds: userData._id,
              },
            },
            { session },
          );

          const userSession = new UserSession(
            {
              businessId: businessId,
              hiCode: hiCode,
              pin: tenDigitCode,
              tableName: tableName,
              customerName: userData.name,
              phoneNumbers: [userData.phone],
              customerIds: [userData._id],
              performedBy: "user",
              date: Date.now(),
            },
            {
              session,
            },
          );
          await userSession.save();
          if (posConfigData.orderVerificationType === "USER") {
            const result = await saveOrder(
              tableName,
              businessId,
              userData.name as string,
              userData.phone as string,
              internalCart,
              userData._id,
              true,
              tableData?._id.toString(),
              false,
              null,
              hiCode,
              session,
            );

            sendKOTPrintEvent({
              tableName,
              businessId,
              customerName: userData.name as string,
              customerPhone: userData.phone as string,
              cart: internalCart,
              acceptedBy: "direct_user",
              kotId: result?.data?.kotId?.toString() ?? "",
              date: Date.now(),
              posRestName: posConfigData?.restName,
            });

            return c.json(result, 200);
          }

          await saveKotOrder(
            tableName,
            businessId,
            userData.name as string,
            userData.phone as string,
            internalCart,
            userData._id,
            false,
            tableData._id.toString(),
            false,
            null,
            session,
          );

          return c.json(
            {
              message: "Data fetched successfully",
              err: false,
              data: {
                success: true,
                hiCode: hiCode,
                name: userData.name,
                phone: userData.phone,
              },
            },
            200,
          );
        }

        if (posConfigData.orderVerificationType === "USER") {
          const result = await saveOrder(
            tableName,
            businessId,
            userData.name as string,
            userData.phone as string,
            internalCart,
            userData._id,
            true,
            tableData._id.toString(),
            false,
            null,
            userTableSession.hiCode,
            session,
          );

          const res = sendKOTPrintEvent({
            tableName,
            businessId,
            customerName: userData.name as string,
            customerPhone: userData.phone as string,
            cart: internalCart,
            acceptedBy: "direct_user",
            kotId: result?.data?.kotId?.toString() ?? "",
            date: Date.now(),
            posRestName: posConfigData?.restName,
          });

          return c.json(result, 200);
        }

        await saveKotOrder(
          tableName,
          businessId,
          userData.name as string,
          userData.phone as string,
          internalCart,
          userData._id,
          false,
          tableData._id.toString(),
          false,
          null,
          session,
        );
        return c.json(
          {
            message: "Data fetched successfully",
            err: false,
            data: {
              success: true,
              hiCode: userTableSession?.hiCode,
            },
          },
          200,
        );
      });
    },
  )
  .post(
    "/validate_hicode",

    zValidator(
      "json",
      z.object({
        hiCode: z.string().min(4).max(200),
        customerPhone: z.string().min(4).max(200),
        businessId: z.string().min(4).max(200),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { hiCode, customerPhone, businessId } = await c.req.json();

        const userData = await User.findOne({ phone: customerPhone });

        if (!userData) {
          return respond(c, "User not found", true, 404, {});
        }

        const userTableSession = await UserSession.findOne({
          hiCode: hiCode,
          businessId: businessId,
        });

        if (!userTableSession) {
          return respond(c, "Invalid HiCode", true, 400, {});
        }

        await UserSession.findOneAndUpdate(
          {
            businessId: businessId,
            tableName: userTableSession.tableName,
          },
          {
            $addToSet: {
              phoneNumbers: customerPhone,
              customerIds: userData?._id,
            },
          },
          {
            session,
            new: true,
          },
        );

        await Table.findOneAndUpdate(
          {
            businessId: businessId,
            name: userTableSession.tableName,
          },
          {
            $addToSet: {
              userIds: userData?._id,
            },
          },
          {
            session,
            new: true,
          },
        );

        return c.json(
          {
            message: "HiCode validated successfully",
            err: false,
            data: {
              success: true,
              hiCode: userTableSession.hiCode,
              pin: userTableSession.pin,
            },
          },
          200,
        );
      });
    },
  )

  .post(
    "/captain/save_kot",
    ubacMiddleware("place_order"),
    zValidator(
      "json",
      z.object({
        tableName: z.string().min(1).max(200),
        internalCart: z.array(z.object({})),
        businessId: z.string().min(24).max(24),
        userId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { internalCart, tableName, businessId, userId } =
          await c.req.json();
        const tableInfo = await Table.findOne({
          businessId: businessId,
          name: tableName,
        });

        if (!tableInfo) {
          return respond(c, "Table not found", true, 404, {});
        }

        const user = await User.findById(userId);
        if (!user) {
          return respond(c, "User not found", true, 404, {});
        }

        // find posconfig for a place order
        const pos = await BusinessPosConfig.findOne({
          businessId: businessId,
          isDeleted: false,
          active: true,
        });

        if (!pos) {
          return respond(c, "POS not found", true, 404, {});
        }

        const tableSession = await UserSession.findOne({
          tableName: tableName,
          businessId: businessId,
        });

        const tenDigitCode = generateTenDigitCode();
        if (!tableSession) {
          const hiCode = Math.floor(1000 + Math.random() * 9000).toString();
          const userSession = new UserSession(
            {
              businessId: businessId,
              hiCode: hiCode,
              pin: tenDigitCode,
              tableName: tableName,
              customerName: user.name as string,
              phoneNumbers: [user.phone],
              performedBy: "captain",
              date: Date.now(),
            },
            {
              session,
            },
          );
          await userSession.save();

          const res = await saveKotOrder(
            tableName,
            businessId,
            user.name as string,
            user.phone as string,
            internalCart,
            user._id,
            true,
            tableInfo?._id.toString(),
            false,
            null,
            session,
          );
          const totalBill = calculateCartBill(internalCart);
          await Table.findOneAndUpdate(
            {
              businessId: businessId,
              name: tableName,
            },
            {
              $inc: {
                totalItemCount: internalCart.length,
                currentTableAmount: totalBill,
              },
              $set: {
                status: "ACTIVE",
                hiCode: hiCode,
                date: Date.now(),
              },
            },
            {
              new: true,
              session,
            },
          );

          sendKOTPrintEvent({
            tableName,
            businessId,
            customerName: user.name as string,
            customerPhone: user.phone as string,
            cart: internalCart,
            acceptedBy: user.name as string,
            kotId: res?.kotId?.toString() ?? "",
            date: Date.now(),
            posRestName: pos?.restName,
          });

          return respond(c, "Data fetched successfully", false, 200, {
            success: true,
          });
        }

        const res = await saveKotOrder(
          tableName,
          businessId,
          tableInfo?.edited ? tableSession.customerName : (user.name as string),
          user.phone as string,
          internalCart,
          user._id,
          true,
          tableInfo?._id.toString(),
          tableInfo?.edited,
          tableInfo?.editedBy?.toString(),
          session,
        );
        const totalBill = calculateCartBill(internalCart);
        await Table.findOneAndUpdate(
          {
            businessId: businessId,
            name: tableName,
          },
          {
            $inc: {
              totalItemCount: internalCart.length,
              currentTableAmount: totalBill,
            },
            $set: {
              status: "ACTIVE",
              date: Date.now(),
              edited: false,
              editedBy: null,
            },
          },
          {
            new: true,
            session,
          },
        );

        sendKOTPrintEvent({
          tableName,
          businessId,
          customerName: user.name as string,
          customerPhone: user.phone as string,
          cart: internalCart,
          acceptedBy: user.name as string,
          kotId: res?.kotId?.toString() ?? "",
          date: Date.now(),
          posRestName: pos?.restName,
        });
        return respond(c, "Data fetched successfully", false, 200, {
          success: true,
          hiCode: tableSession.hiCode,
        });
      });
    },
  )

  .get(
    "/fetch_hicode_by_table",

    zValidator(
      "query",
      z.object({
        tableName: z.string().min(1).max(200),
        businessId: z.string().min(1).max(200),
      }),
    ),

    async (c) => {
      const { tableName, businessId } = c.req.query();
      const tableSession = await UserSession.findOne({
        tableName: tableName,
        businessId: businessId,
      });

      if (!tableSession) {
        return c.json(
          {
            message: "HiCode not found",
            err: true,
            data: {
              success: false,
            },
          },
          404,
        );
      }

      return c.json(
        {
          message: "HiCode fetched successfully",
          err: false,
          data: {
            hiCode: tableSession.hiCode,
          },
        },
        200,
      );
    },
  )

  .get(
    "/fetch_kot_by_table",

    zValidator(
      "query",
      z.object({
        tableName: z.string().min(1).max(200),
        businessId: z.string().min(1).max(200),
        userId: z.string().min(1).max(200),
      }),
    ),

    async (c) => {
      const { tableName, businessId, userId } = c.req.query();

      const tableData = await Table.findOne({
        businessId: businessId,
        name: tableName,
      });

      if (!tableData) {
        return c.json(
          {
            message: "Table not found",
            err: true,
            data: {
              success: false,
            },
          },
          404,
        );
      }

      const userData = await User.findById(userId);

      if (!userData) {
        return c.json(
          {
            message: "User not found",
            err: true,
            data: {
              success: false,
            },
          },
          404,
        );
      }

      const userSession = await UserSession.findOne({
        businessId: businessId,
        phoneNumbers: userData.phone,
      });

      const userKot = await KotOrder.find({
        tableName: userSession?.tableName,
        businessId: businessId,
        settled: false,

        accepted: true,
      })
        .populate({
          path: "transferedBy",
          select: "name phone",
        })
        .populate({
          path: "editedBy",
          select: "name phone",
        });

      return c.json(
        {
          message: "Data fetched successfully",
          err: false,
          data: userKot || [],
        },
        200,
      );
    },
  )

  .post(
    "/table_user_auth/:userId",

    zValidator(
      "json",
      z.object({
        userId: z.string().min(1).max(200),
        businessId: z.string().min(1).max(200),
        tableName: z.string().min(1).max(200),
      }),
    ),

    async (c) => {
      const { userId, businessId, tableName } = await c.req.json();

      const userData = await User.findById(userId);

      if (!userData) {
        return c.json(
          {
            message: "User not found",
            err: true,
            data: {
              success: false,
            },
          },
          404,
        );
      }

      const tableData = await Table.findOne({
        businessId: businessId,
        name: tableName,
      });

      if (!tableData) {
        return c.json(
          {
            message: "Table not found",
            err: true,
            data: {
              success: false,
            },
          },
          404,
        );
      }

      const userTableSession = await UserSession.findOne({
        tableName: tableName,
        businessId: businessId,
      });

      if (
        userTableSession &&
        !userTableSession?.phoneNumbers.includes(userData.phone)
      ) {
        return c.json(
          {
            message: `this table is already occupied by ${userTableSession?.customerName} please ask them to place the order`,
            err: true,
            data: {
              success: false,
            },
          },
          403,
        );
      }

      return c.json(
        {
          message: "User authorized",
          err: false,
          data: {
            success: true,
          },
        },
        200,
      );
    },
  )

  .put(
    "/link_user_to_bill",

    zValidator(
      "json",
      z.object({
        name: z.string().min(1).max(200),
        phone: z.string().min(10).max(10),
        otp: z.string().min(4).max(4),
        tableId: z.string().min(22).max(50),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { phone, name, tableId, otp } = await c.req.json();

        const tableData = await Table.findById(tableId);
        if (!tableData) {
          return respond(c, "table not found", true, 404, {});
        }

        // Verify OTP
        const otpResponse = await axios({
          method: "GET",
          url: `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${phone}`,
          headers: {
            accept: "application/json",
            authkey: "387796AmyGlDBq63b2d75aP1",
          },
        });

        const invalidOtpMessages = [
          "Mobile no. not found",
          "OTP not match",
          "OTP expired",
          "Otp empty or not numeric",
          "Max limit reached for this otp verification",
        ];

        if (invalidOtpMessages.includes(otpResponse?.data?.message)) {
          return respond(c, "Please enter valid Otp !!", true, 400, {});
        }

        const userData = await User.findOne({ phone: phone }).session(session);
        if (!userData) {
          const newUser = new User({
            phone: phone,
            name: name,
          });

          await newUser.save({ session });

          const userSession = await UserSession.findOneAndUpdate(
            {
              tableName: tableData.name,
              businessId: tableData.businessId,
            },
            {
              $addToSet: {
                customerIds: newUser._id,
                phoneNumbers: phone,
              },
              customerName: name,
            },

            {
              session,
              new: true,
            },
          );

          const updateTableData = await Table.findByIdAndUpdate(
            tableId,
            {
              $addToSet: {
                userIds: newUser._id,
              },
            },
            {
              session,
            },
          );

          const userAnalytics = await UserAnalytic.findOneAndUpdate({
            userId: newUser._id,
            businessId: tableData.businessId,
          });

          if (!userAnalytics) {
            const createAnalytics = new UserAnalytic({
              avgSpend: 0,
              totalSpend: 0,
              totalOrders: 0,
              userId: newUser._id,
              businessId: tableData.businessId,
              totalItemCount: 0,
              totalBillCount: 0,
              visitCount: 0,
              lastVisit: Date.now(),
              coinzIssued: 0,
              coinzUsed: 0,
              couponCount: 0,
              currentCoins: 0,
              dateOfJoining: Date.now(),
              tableName: tableData.name,
            });

            await createAnalytics.save({ session });
          }

          return c.json(
            {
              message: "User linked successfully",
              err: false,
              data: {
                success: true,
              },
            },
            200,
          );
        }

        const userSession = await UserSession.findOneAndUpdate(
          {
            tableName: tableData.name,
            businessId: tableData.businessId,
          },
          {
            $addToSet: {
              phoneNumbers: phone,
              customerIds: userData?._id,
            },
            customerName: name,
          },

          {
            session,
            new: true,
          },
        );

        const updateTableData = await Table.findByIdAndUpdate(
          tableId,
          {
            $addToSet: {
              userIds: userData._id,
            },
          },
          {
            session,
          },
        );
        return c.json(
          {
            message: "User linked successfully",
            err: false,
            data: { success: true },
          },
          200,
        );
      });
    },
  )

  .put(
    "/update_pos_config",

    zValidator(
      "json",
      z.object({
        posConfigId: z.string().min(3).max(50),
        orderVerificationType: z
          .enum(OrderVerificationTypeEnum)
          .default("CAPTAIN"),
        active: z.boolean().default(true),
        onlyMenu: z.boolean().default(false).optional(),
        printKot: z.boolean().default(true).optional(),
        repeatPrint: z.coerce.number().min(1).max(5).default(1).optional(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const {
          posConfigId,
          orderVerificationType,
          active,
          onlyMenu,
          printKot,
          repeatPrint,
        } = await c.req.json();

        const updateBusinessPosConfig =
          await BusinessPosConfig.findOneAndUpdate(
            { _id: posConfigId },
            { orderVerificationType, active, onlyMenu, printKot, repeatPrint },
            { session },
          );

        if (!updateBusinessPosConfig) {
          return respond(c, "Update failed", true, 400, {});
        }

        if (active === false) {
          await Dish.updateMany(
            {
              businessId: updateBusinessPosConfig.businessId,
            },
            {
              $set: {
                pos: false,
              },
            },
          );
          await AddOn.updateMany(
            {
              businessId: updateBusinessPosConfig.businessId,
            },
            {
              $set: {
                pos: false,
              },
            },
          );

          await Category.updateMany(
            {
              businessId: updateBusinessPosConfig.businessId,
            },
            {
              $set: {
                pos: false,
              },
            },
          );

          await Table.updateMany(
            {
              businessId: updateBusinessPosConfig.businessId,
            },
            {
              $set: {
                pos: false,
              },
            },
            { session },
          );

          await Zone.updateMany(
            {
              businessId: updateBusinessPosConfig.businessId,
            },
            {
              $set: {
                pos: false,
              },
            },
            { session },
          );

          await OutLetInfo.updateOne(
            {
              businessId: updateBusinessPosConfig.businessId,
            },
            {
              $set: {
                isPosEnabled: false,
                placeOrderButton: false,
                isPosSynced: false,
                posProgress: 0,
              },
            },
          );
        }

        return respond(c, "Updated successfully", false, 200, {
          _id: updateBusinessPosConfig._id,
        });
      });
    },
  )
  .post(
    "/re_print_bill",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName, generatedBy } = await c.req.json();

        sendBillPrintEvent({
          tableName: "T1",
          businessId: businessId,
          customerName: "Datta",
          customerPhone: "9588413799",
          items: [
            {
              dish: {
                name: "Mushroom Pasta (Full)",
                price: 330,
                quantity: 1,
              },
              extras: [],
            },
            {
              dish: {
                name: "turkish eggs with greek yogurt",
                price: 270,
                quantity: 1,
              },
              extras: [],
            },
            {
              dish: {
                name: 'Margherita Pizza (8" inch)',
                price: 265,
                quantity: 1,
              },
              extras: [
                {
                  name: "Neapolitan Dough",
                  price: 0,
                  quantity: 1,
                },
                {
                  name: "Bell Pepper 50 Grams",
                  price: 25,
                  quantity: 1,
                },
              ],
            },
            {
              dish: {
                name: "Green Apple Mojito (Jar)",
                price: 220,
                quantity: 1,
              },
              extras: [],
            },
            {
              dish: {
                name: "peach ice tea (Jar)",
                price: 240,
                quantity: 1,
              },
              extras: [],
            },
          ],
          posRestName: "test",
          generatedBy: generatedBy,
          date: Date.now(),
          serviceCharge: 0,
          discount: 0,
          tax: 5,
          total: 256,
          billRequestId: "dddwqz",
          subTotal: 90,
          tips: 5,
          claimedCoins: 30,
        });

        // // Fetch POS config for the business
        // const pos = await BusinessPosConfig.findOne({
        //   businessId,
        //   isDeleted: false,
        //   active: true,
        // });
        // if (!pos) {
        //   return c.json(
        //     {
        //       message: "POS not found",
        //       err: true,
        //       data: { success: false },
        //     },
        //     404,
        //   );
        // }

        // // Fetch table session data
        // const tableSession = await UserSession.findOne({
        //   businessId,
        //   tableName,
        // });

        // if (!tableSession) {
        //   return c.json(
        //     {
        //       message: "Table session not found",
        //       err: true,
        //       data: { success: false },
        //     },
        //     404,
        //   );
        // }

        // // Helper to call axios posts with the necessary config
        // const axiosPosApiCall = async (path: string, config: object) => {
        //   return axios.post(path, {
        //     app_key: pos.accessKey,
        //     app_secret: pos.secretKey,
        //     access_token: pos.authToken,
        //     restID: pos.restId,
        //     ...config,
        //   });
        // };

        // // If session exists, check if re-registration is required
        // if (tableSession) {
        //   const hoursSinceLastUpdate =
        //     (Date.now() - new Date(tableSession.date).getTime()) /
        //     (1000 * 60 * 60);
        //   if (hoursSinceLastUpdate > 3) {
        //     const { data: regData } = await axiosPosApiCall(
        //       posApiPaths.registerUser,
        //       {
        //         phone: tableSession.pin,
        //         name: generatedBy,
        //       },
        //     );
        //     if (regData.success === "0") {
        //       throw new Error("User not registered");
        //     }
        //   }
        // }

        // if (!tableSession?.billRequestId) {
        //   return c.json(
        //     {
        //       message: "Bill not found",
        //       err: true,
        //       data: { success: false },
        //     },
        //     404,
        //   );
        // }

        // // Try fetching bill if already requested
        // if (tableSession?.billRequestId) {
        //   const { data: billData } = await axiosPosApiCall(
        //     posApiPaths.getBill,
        //     {
        //       bill_request_id: tableSession.billRequestId,
        //     },
        //   );

        //   if (billData.success === "0") {
        //     throw new Error("Error fetching  bill");
        //   }
        //   const simpleArray = transformItemsToSimpleArray(
        //     billData.items_data || [],
        //   );
        //   if (billData.success === "1") {
        //     const orderData = billData.order_data;
        //     const billObj = {
        //       billing_user_name: orderData.billing_user_name,
        //       serviceCharge: orderData.service_charge,
        //       discount: orderData.discount,
        //       tax: tableSession.finalTax,
        //       total: tableSession.finalTotal,
        //       customerPhone:
        //         tableSession.phoneNumbers[0] || orderData.customer_phone,
        //       customerName:
        //         tableSession.customerName || orderData.customer_name,
        //       tableName: orderData.table_no,
        //       billRequestId: tableSession.billRequestId,
        //       items: simpleArray,
        //       subTotal: orderData.core_price,
        //       tips: tableSession.tips || 0,
        //       claimedCoins: tableSession.claimedCoins || 0,
        //       couponId: tableSession.couponId,
        //       initialTotal: tableSession.initialTotal,
        //     };

        //     sendBillPrintEvent({
        //       tableName: orderData.table_no,
        //       businessId: businessId,
        //       customerName:
        //         tableSession.customerName || orderData.customer_name,
        //       customerPhone:
        //         tableSession.phoneNumbers[0] || orderData.customer_phone,
        //       items: simpleArray,
        //       posRestName: pos.restName,
        //       generatedBy: generatedBy,
        //       date: Date.now(),
        //       serviceCharge: orderData.service_charge,
        //       discount: orderData.discount,
        //       tax: tableSession?.finalTax || 0,
        //       total: tableSession?.finalTotal || 0,
        //       billRequestId: tableSession.billRequestId,
        //       subTotal: orderData.core_price,
        //       tips: tableSession?.tips || 0,
        //       claimedCoins: tableSession?.claimedCoins || 0,
        //     });

        //     return c.json(
        //       {
        //         message: "print",
        //         err: false,
        //         data: {},
        //       },
        //       200,
        //     );
        //   }
        // }

        return respond(c, "sucess", true, 200, {});
      });
    },
  )

  .post(
    "/add_discount",
    zValidator(
      "json",
      z
        .object({
          businessId: z.string().min(3).max(200),
          tableName: z.string().min(1).max(200),
          value: z.number().positive().min(1).max(100),
          reasonOfDiscount: z.string().min(1).max(100).optional(),
          discountAppliedOn: z.enum(["ON_BILL", "ON_DISH"]),
          dishIds: z.array(z.string().min(1).max(200)).optional(),
          discountAppliedBy: z.string().min(1).max(50),
        })
        .refine(
          (data) =>
            data.discountAppliedOn !== "ON_DISH" ||
            (Array.isArray(data.dishIds) && data.dishIds.length > 0),
          {
            message:
              "dishIds must be a non-empty array when discountAppliedOn is ON_DISH",
            path: ["dishIds"],
          },
        ),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        let {
          businessId,
          tableName,
          value,
          reasonOfDiscount,
          discountAppliedOn,
          dishIds,
          discountAppliedBy,
        } = await c.req.json();

        // Fetch the table session
        const tableSession = await UserSession.findOne({
          businessId,
          tableName,
        });
        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        let discountAmount = 0;
        let newSubTotal = tableSession.subTotal;

        value = Math.round((value / 100) * newSubTotal);

        if (discountAppliedOn === "ON_BILL") {
          // Calculate discount on the bill
          discountAmount = Math.min(
            value,
            newSubTotal -
              tableSession.claimedCoins -
              tableSession.couponDiscount,
          );
          newSubTotal -= discountAmount;
        }

        if (discountAppliedOn === "ON_DISH") {
          // Calculate discount on selected dishes
          const kotOrder = (await KotOrder.find({
            "cart._id": { $in: dishIds },
            tableName,
            businessId,
            settled: false,
          }).lean()) as KotOrderTypes[];

          const { totalDishTotal, totalGst } = calculateBillDishIds(
            kotOrder,
            dishIds,
          );
          discountAmount = Math.min(value, totalDishTotal);
          newSubTotal -= discountAmount;
        }

        // GST Calculation
        const newGst = calculateGst(tableSession.gstPercentage, newSubTotal);

        // Calculate final total
        const totalDis = calculateTotalDiscount(
          discountAmount,
          tableSession.claimedCoins,
          tableSession.couponDiscount,
        );
        const newTotal = calculateFinalTotal(
          newSubTotal,
          totalDis,
          newGst,
          tableSession.serviceCharge,
          tableSession.otherTax,
          tableSession.tips,
        );

        // Update session after applying the discount
        await updateTableSession(businessId, tableName, session, {
          gst: Number(newGst).toFixed(2),
          total: newTotal,
          reasonOfDiscount,
          discountAppliedOn,
          discountAppliedBy,
          isDiscountApplied: true,
          discount: discountAmount,
        });

        return respond(c, "Success", true, 200, {});
      });
    },
  )

  .post(
    "/add_coins",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
        value: z.number().positive(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName, value } = await c.req.json();
        const tableSession = await UserSession.findOne({
          businessId,
          tableName,
        });

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        if (tableSession.couponDiscount > 0) {
          return respond(
            c,
            "Coupon already claimed for this table",
            true,
            400,
            {},
          );
        }

        const coins = Math.min(
          value,
          tableSession.subTotal -
            tableSession.discount -
            tableSession.couponDiscount,
        );

        const newSubTotal =
          tableSession.subTotal -
          coins -
          tableSession.discount -
          tableSession.couponDiscount;

        const newGst = (tableSession.gstPercentage / 100) * newSubTotal;

        const totalDis = calculateTotalDiscount(
          tableSession.discount,
          coins,
          tableSession.couponDiscount,
        );
        const newTotal = calculateFinalTotal(
          newSubTotal,
          totalDis,
          newGst,
          tableSession.serviceCharge,
          tableSession.otherTax,
          tableSession.tips,
        );

        await updateTableSession(businessId, tableName, session, {
          gst: newGst.toFixed(2),
          total: newTotal,
          isDiscountApplied: true,
          claimedCoins: coins,
        });

        return respond(c, "Success", true, 200, {});
      });
    },
  )

  .post(
    "/add_coupon",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
        couponId: z.string().min(1).max(200),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName, couponId } = await c.req.json();
        const tableSession = await UserSession.findOne({
          businessId,
          tableName,
        });

        let couponDiscount = 0;

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        const coupon = await Couponz.findById(couponId);

        if (!coupon) {
          return respond(c, "Coupon not found", true, 404, {});
        }

        if (tableSession.claimedCoins > 0) {
          return respond(
            c,
            "Coins already claimed for this table",
            true,
            400,
            {},
          );
        }

        const couponType = coupon?.config?.discountType;

        if (couponType === "PERCENTAGE") {
          const percentValue =
            ((coupon?.config?.value || 0) / 100) *
            (tableSession?.subTotal || 0);
          couponDiscount = Math.min(
            percentValue,
            coupon?.config?.upto || Number.POSITIVE_INFINITY,
          );
        } else {
          couponDiscount = coupon?.config?.value as number;
        }

        couponDiscount = Math.min(
          couponDiscount,
          tableSession.subTotal -
            tableSession.discount -
            tableSession.claimedCoins,
        );

        const newSubTotal =
          tableSession.subTotal -
          tableSession.claimedCoins -
          tableSession.discount -
          couponDiscount;
        const newGst = (tableSession.gstPercentage / 100) * newSubTotal;

        const totalDis = calculateTotalDiscount(
          tableSession.discount,
          tableSession.claimedCoins,
          couponDiscount,
        );
        const newTotal = calculateFinalTotal(
          newSubTotal,
          totalDis,
          newGst,
          tableSession.serviceCharge,
          tableSession.otherTax,
          tableSession.tips,
        );

        await updateTableSession(businessId, tableName, session, {
          gst: Number(newGst).toFixed(2),
          total: newTotal,
          isDiscountApplied: true,
          couponDiscount,
          couponId,
        });

        return respond(c, "Success", true, 200, {});
      });
    },
  )

  .post(
    "/remove_discount",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
        reasonOfDiscount: z.string().min(1).max(100).optional(),
        discountRemovedBy: z.string().min(1).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName, discountRemovedBy, reasonOfDiscount } =
          await c.req.json();
        const tableSession = await UserSession.findOne({
          businessId,
          tableName,
        });

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        const newSubTotal =
          tableSession.subTotal -
          0 -
          tableSession.claimedCoins -
          tableSession.couponDiscount;
        const newGst = (tableSession.gstPercentage / 100) * newSubTotal;

        const totalDis = calculateTotalDiscount(
          0,
          tableSession.claimedCoins,
          tableSession.couponDiscount,
        );
        const newTotal = calculateFinalTotal(
          newSubTotal,
          totalDis,
          newGst,
          tableSession.serviceCharge,
          tableSession.otherTax,
          tableSession.tips,
        );

        const isDiscountApplied =
          tableSession.claimedCoins > 0 || tableSession.couponDiscount > 0;

        await updateTableSession(businessId, tableName, session, {
          gst: Number(newGst).toFixed(2),
          total: newTotal,
          reasonOfDiscount,
          isDiscountApplied,
          discount: 0,
          discountRemovedBy,
          newDishGst: 0,
        });

        return respond(c, "Success", true, 200, {});
      });
    },
  )

  .post(
    "/remove_coins",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName } = await c.req.json();
        const tableSession = await UserSession.findOne({
          businessId,
          tableName,
        });

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        const isDiscountApplied =
          tableSession.discount > 0 || tableSession.couponDiscount > 0;

        const newSubTotal =
          tableSession.subTotal -
          tableSession.discount -
          0 -
          tableSession.couponDiscount;
        const newGst = (tableSession.gstPercentage / 100) * newSubTotal;

        const totalDis = calculateTotalDiscount(
          tableSession.discount,
          0,
          tableSession.couponDiscount,
        );
        const newTotal = calculateFinalTotal(
          newSubTotal,
          totalDis,
          newGst,
          tableSession.serviceCharge,
          tableSession.otherTax,
          tableSession.tips,
        );

        await updateTableSession(businessId, tableName, session, {
          gst: newGst.toFixed(2),
          total: newTotal,
          isDiscountApplied,
          claimedCoins: 0,
        });

        return respond(c, "Success", true, 200, {});
      });
    },
  )

  .post(
    "/remove_coupon",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName } = await c.req.json();

        const tableSession = await UserSession.findOne({
          businessId,
          tableName,
        });

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        const isDiscountApplied =
          tableSession.discount > 0 || tableSession.claimedCoins > 0;

        const newSubTotal =
          tableSession.subTotal -
          tableSession.discount -
          tableSession.claimedCoins -
          0;
        const newGst = (tableSession.gstPercentage / 100) * newSubTotal;

        const totalDis = calculateTotalDiscount(
          tableSession.discount,
          tableSession.claimedCoins,
          0,
        );
        const newTotal = calculateFinalTotal(
          newSubTotal,
          totalDis,
          newGst,
          tableSession.serviceCharge,
          tableSession.otherTax,
          tableSession.tips,
        );

        await updateTableSession(businessId, tableName, session, {
          gst: newGst.toFixed(2),
          total: newTotal,
          couponId: null,
          isDiscountApplied,
          couponDiscount: 0,
        });

        return respond(c, "Success", true, 200, {});
      });
    },
  )

  .post(
    "/clear_all_discounts",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName } = await c.req.json();

        const tableSession = await UserSession.findOne({
          businessId,
          tableName,
        });

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        const newSubTotal = tableSession.subTotal - 0 - 0 - 0;
        const newGst = (tableSession.gstPercentage / 100) * newSubTotal;

        const totalDis = calculateTotalDiscount(0, 0, 0);
        const newTotal = calculateFinalTotal(
          newSubTotal,
          totalDis,
          newGst,
          tableSession.serviceCharge,
          tableSession.otherTax,
          tableSession.tips,
        );

        await updateTableSession(businessId, tableName, session, {
          gst: Number(newGst).toFixed(2),
          total: newTotal,
          isDiscountApplied: false,
          couponDiscount: 0,
          claimedCoins: 0,
          discount: 0,
          couponId: null,
          reasonOfServiceCharge: "",
          serviceChargeRemovedBy: null,
          discountRemovedBy: null,
          reasonOfDiscount: "",
          discountAppliedBy: null,
          serviceChargeAppliedBy: null,
          newDishGst: 0,
        });

        return respond(c, "Success", true, 200, {});
      });
    },
  )

  .post(
    "/add_service_charge",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
        serviceChargeAppliedBy: z.string().min(1).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName, serviceChargeAppliedBy } =
          await c.req.json();

        const tableSession = await UserSession.findOne({
          businessId,
          tableName,
        });

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        await updateTableSession(businessId, tableName, session, {
          serviceChargeAppliedBy,
          isServiceChargeRemoved: false,
        });

        return respond(c, "Success", true, 200, {});
      });
    },
  )

  .post(
    "/remove_service_charge",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
        serviceChargeRemovedBy: z.string().min(1).max(50),
        reasonOfServiceCharge: z.string().min(1).max(100).optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const {
          businessId,
          tableName,
          serviceChargeRemovedBy,
          reasonOfServiceCharge,
        } = await c.req.json();

        const tableSession = await UserSession.findOne({
          businessId,
          tableName,
        });

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        await UserSession.findOneAndUpdate(
          { businessId, tableName },
          {
            $set: {
              serviceCharge: 0,
              serviceChargeRemovedBy,
              reasonOfServiceCharge,
              isServiceChargeRemoved: true,
            },
          },
          { session, new: true },
        );

        return respond(c, "Success", true, 200, {});
      });
    },
  )

  .post(
    "/settle",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName, settledBy } = await c.req.json();

        const tableSession = await UserSession.findOne({
          businessId,
          tableName,
        });

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        const pos = await BusinessPosConfig.findOne({
          businessId,
          isDeleted: false,
          active: true,
        });

        if (!pos) {
          return respond(c, "Pos not found", true, 400, {});
        }

        const kotOrders = (await KotOrder.find({
          tableName,
          settled: false,
          businessId,
        }).lean()) as KotOrderTypes[];

        const cartItems = kotOrders.flatMap((order) =>
          order.cart.filter((item) => !item.isDeleted),
        );

        const registerUser = await axios.post(posApiPaths.registerUser, {
          app_key: pos.accessKey,
          app_secret: pos.secretKey,
          access_token: pos.authToken,
          restID: pos.restId,
          phone: tableSession?.pin,
          name: kotOrders[0].name,
        });

        if (registerUser.data.success === "0") {
          throw new Error("Failed to register user");
        }

        const petpoojaCart = convertToPetpoojaCart(
          cartItems,
          pos.restId,
          kotOrders[0].name,
          tableSession?.pin,
          tableName,
          pos.accessKey,
          pos.secretKey,

          pos.authToken,
        );

        const saveKot = await axios.post(posApiPaths.saveKot, petpoojaCart);

        if (saveKot.data.status === "0") {
          throw new Error("Error in saving kot");
        }

        const payload = {
          app_key: pos.accessKey,
          app_secret: pos.secretKey,
          access_token: pos.authToken,
          restID: pos.restId,
          pin: tableSession?.pin,
          tableNo: tableName,
        };

        const response = await axios.post(posApiPaths.requestBill, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data.success === "0") {
          throw new Error("Error in requesting bill");
        }

        return respond(c, "Success", true, 200, {});
      });
    },
  );

export default posRouter;
