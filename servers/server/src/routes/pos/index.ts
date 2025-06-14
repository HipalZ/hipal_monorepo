import {
  AddOn,
  Business,
  BusinessPosConfig,
  Category,
  DeviceToken,
  Dish,
  Kitchen,
  KotOrder,
  Menu,
  Pos,
  PosBill,
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
import {
  calculateCartBill,
  convertToPetpoojaCart,
  transformData,
  transformItemsToSimpleArray,
  transformParentCategories,
} from "../../utils/helper";
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
    return false;
  }

  return true;
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
  petpoojaCart: unknown,
  hiCode: string,
  session: ClientSession,
) => {
  const saveKot = await axios.post(posApiPaths.saveKot, petpoojaCart);
  if (saveKot.data.success === "0") {
    throw new Error("kot not saved in pos");
  }
  await saveKotOrder(
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

        // Fetch POS config for the business
        const pos = await BusinessPosConfig.findOne({
          businessId,
          isDeleted: false,
          active: true,
        });
        if (!pos) {
          return c.json(
            {
              message: "POS not found",
              err: true,
              data: { success: false },
            },
            404,
          );
        }

        // Fetch table session data
        const tableSession = await UserSession.findOne({
          businessId,
          tableName,
        });

        if (!tableSession) {
          return c.json(
            {
              message: "Table session not found",
              err: true,
              data: { success: false },
            },
            404,
          );
        }

        // Helper to call axios posts with the necessary config
        const axiosPosApiCall = async (path: string, config: object) => {
          return axios.post(path, {
            app_key: pos.accessKey,
            app_secret: pos.secretKey,
            access_token: pos.authToken,
            restID: pos.restId,
            ...config,
          });
        };

        // If session exists, check if re-registration is required
        if (tableSession) {
          const hoursSinceLastUpdate =
            (Date.now() - new Date(tableSession.date).getTime()) /
            (1000 * 60 * 60);
          if (hoursSinceLastUpdate > 3) {
            const { data: regData } = await axiosPosApiCall(
              posApiPaths.registerUser,
              {
                phone: tableSession.pin,
                name: generatedBy,
              },
            );
            if (regData.success === "0") {
              throw new Error("User not registered");
            }
          }
        }

        // Try fetching bill if already requested
        if (tableSession?.billRequestId) {
          const { data: billData } = await axiosPosApiCall(
            posApiPaths.getBill,
            {
              bill_request_id: tableSession.billRequestId,
            },
          );

          if (billData.success === "0") {
            throw new Error("Error fetching  bill");
          }
          const simpleArray = transformItemsToSimpleArray(
            billData.items_data || [],
          );
          if (billData.success === "1") {
            const orderData = billData.order_data;
            const billObj = {
              billing_user_name: orderData.billing_user_name,
              serviceCharge: orderData.service_charge,
              discount: orderData.discount,
              tax: tableSession.finalTax,
              total: tableSession.finalTotal,
              customerPhone:
                tableSession.phoneNumbers[0] || orderData.customer_phone,
              customerName:
                tableSession.customerName || orderData.customer_name,
              tableName: orderData.table_no,
              billRequestId: tableSession.billRequestId,
              items: simpleArray,
              subTotal: orderData.core_price,
              tips: tableSession.tips || 0,
              claimedCoins: tableSession.claimedCoins || 0,
              couponId: tableSession.couponId,
              initialTotal: tableSession.initialTotal,
            };

            return c.json(
              {
                message: "Data fetched successfully",
                err: false,
                data: billObj,
              },
              200,
            );
          }
        }

        // Request a new bill
        const { data: requestData } = await axiosPosApiCall(
          posApiPaths.requestBill,
          {
            pin: tableSession?.pin,
            tableNo: tableName,
          },
        );
        if (requestData.success === "0") {
          throw new Error("Error requesting bill");
        }

        // Ensure requestId is stored in session
        const request_id = tableSession?.requestId || requestData.request_id;
        if (!tableSession?.requestId) {
          await UserSession.findOneAndUpdate(
            { businessId, tableName },
            { requestId: request_id },
            { new: true },
          );
        }

        // Check bill status
        const { data: checkData } = await axiosPosApiCall(
          posApiPaths.checkBill,
          {
            request_id,
          },
        );
        if (checkData.success === "0") {
          throw new Error("Error checking bill");
        }

        const bill_request_id = checkData.bill_request_id;
        if (!bill_request_id) {
          return c.json(
            {
              message: "Error fetching data",
              err: true,
              data: { success: false },
            },
            400,
          );
        }

        // Get bill details
        const { data: getBillData } = await axiosPosApiCall(
          posApiPaths.getBill,
          {
            bill_request_id,
          },
        );
        const simpleArray = transformItemsToSimpleArray(
          getBillData.items_data || [],
        );
        if (getBillData.success === "1") {
          const orderData = getBillData.order_data;

          // Update or create a PosBill record
          await PosBill.findOneAndUpdate(
            { businessId, billRequestId: bill_request_id },
            { items: simpleArray, billInfo: orderData, createdAt: Date.now() },
            { upsert: true, new: true },
          );

          // Update the user session with bill details
          const updateFields = {
            billGeneratedBy: generatedBy,
            billRequestId: bill_request_id,
            billInvoiceId: orderData?.invoice_id,
            tax: orderData?.tax || 0,
            serviceCharge: orderData?.service_charge,
            initialTax: orderData?.tax || 0,
            initialSubTotal: orderData?.core_price || 0,
            discount: orderData?.discount || 0,
            initialTotal: orderData?.total || 0,
            finalTax: orderData?.tax || 0,
            finalTotal: orderData?.total || 0,
            finalSubTotal: orderData?.core_price || 0,
          };
          const updateSession = await UserSession.findOneAndUpdate(
            { businessId, tableName },
            updateFields,
            { new: true },
          );

          const billObj = {
            billing_user_name: orderData.billing_user_name,
            serviceCharge: orderData.service_charge,
            discount: orderData.discount,
            tax: updateSession?.finalTax,
            total: updateSession?.finalTotal,
            customerPhone:
              tableSession.phoneNumbers[0] || orderData.customer_phone,
            customerName: tableSession.customerName || orderData.customer_name,
            tableName: orderData.table_no,
            billRequestId: bill_request_id,
            items: simpleArray,
            subTotal: orderData.core_price,
            tips: updateSession?.tips || 0,
            claimedCoins: updateSession?.claimedCoins || 0,
            couponId: updateSession?.couponId,
            initialTotal: updateSession?.initialTotal,
          };

          return c.json(
            { message: "Data fetched successfully", err: false, data: billObj },
            200,
          );
        }

        return c.json(
          {
            message: "Error fetching data",
            err: true,
            data: { success: false },
          },
          400,
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

        await Menu.deleteOne({ businessId }, { session });

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

        let businessPosConfig = await BusinessPosConfig.findOne({
          businessId,
          isDeleted: false,
          active: true,
        });

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
        customerName: z.string().min(1).max(50),
        customerPhone: z.string().min(10).max(10),
        //TODO : add userId
        userId: z.string().min(1).max(100).optional(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const {
          internalCart,
          tableName,
          businessId,
          customerName,
          customerPhone,
          userId,
        } = await c.req.json();
        //  table info
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

        const userData = await User.findOne({ phone: customerPhone });
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

        const posConfigData = await BusinessPosConfig.findOne({
          businessId: businessId,
          isDeleted: false,
          active: true,
        });

        if (!posConfigData) {
          return c.json(
            {
              message: "POS not found",
              err: true,
              data: {
                success: false,
              },
            },
            404,
          );
        }

        const registrationToken = await DeviceToken.find({
          businessId: businessId,
        });

        // send push notification to all devices
        if (registrationToken.length > 0) {
          for (const obj of registrationToken) {
            if (obj.notification) {
              sendPushNotification(obj.token, customerName, tableName);
            }
          }
        }

        // check if user have already active table session

        const userActiveTableSession = await UserSession.findOne({
          phoneNumbers: customerPhone,
          businessId: businessId,
        });

        if (
          userActiveTableSession &&
          userActiveTableSession?.tableName !== tableName
        ) {
          return c.json(
            {
              message: `User already active on table ${userActiveTableSession.tableName} please close that table first`,
              err: true,
              data: {
                success: false,
                data: {
                  tableName: userActiveTableSession.tableName,
                  hiCode: userActiveTableSession.hiCode,
                },
              },
            },
            409,
          );
        }

        const userTableSession = await UserSession.findOne({
          tableName: tableName,
          businessId: businessId,
        });

        // check if bill already generated for a table
        if (userTableSession?.billRequestId) {
          return c.json(
            {
              message: `Bill already generated for table ${tableName} by ${userTableSession?.billGeneratedBy} you can't add more items`,
              err: true,
              data: {
                success: false,
              },
            },
            400,
          );
        }

        if (userTableSession) {
          if (
            !userTableSession.phoneNumbers.includes(customerPhone) &&
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
          const registerUser = await axios.post(posApiPaths.registerUser, {
            app_key: posConfigData.accessKey,
            app_secret: posConfigData.secretKey,
            access_token: posConfigData.authToken,
            restID: posConfigData.restId,
            phone: tenDigitCode,
            name: customerName,
          });
          if (registerUser.data.success === "0") {
            throw new Error("user not registered");
          }
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
              customerName: customerName,
              phoneNumbers: [customerPhone],
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
            const petpoojaCart = convertToPetpoojaCart(
              internalCart,
              posConfigData.restId,
              customerName,
              tenDigitCode,
              tableName,
              posConfigData.accessKey,
              posConfigData.secretKey,

              posConfigData.authToken,
            );

            const result = await saveOrder(
              tableName,
              businessId,
              customerName,
              customerPhone,
              internalCart,
              userData._id,
              true,
              tableData?._id.toString(),
              false,
              null,
              petpoojaCart,
              hiCode,
              session,
            );

            return c.json(result, 200);
          }

          await saveKotOrder(
            tableName,
            businessId,
            customerName,
            customerPhone,
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
                name: customerName,
                phone: customerPhone,
              },
            },
            200,
          );
        }

        if (posConfigData.orderVerificationType === "USER") {
          const petpoojaCart = convertToPetpoojaCart(
            internalCart,
            posConfigData.restId,
            customerName,
            userTableSession.pin,
            tableName,
            posConfigData.accessKey,
            posConfigData.secretKey,

            posConfigData.authToken,
          );

          const result = await saveOrder(
            tableName,
            businessId,
            customerName,
            customerPhone,
            internalCart,
            userData._id,
            true,
            tableData._id.toString(),
            false,
            null,
            petpoojaCart,
            userTableSession.hiCode,
            session,
          );
          return c.json(result, 200);
        }

        await saveKotOrder(
          tableName,
          businessId,
          customerName,
          customerPhone,
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

        const userTableSession = await UserSession.findOne({
          hiCode: hiCode,
          businessId: businessId,
        });

        if (!userTableSession) {
          return c.json(
            {
              message: "Invalid HiCode",
              err: true,
              data: {
                success: false,
              },
            },
            400,
          );
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
        businessId: z.string().min(1).max(200),
        customerName: z.string().min(1).max(200),
        customerPhone: z.string().min(1).max(200),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const {
          internalCart,
          tableName,
          businessId,
          customerName,
          customerPhone,
        } = await c.req.json();
        const tableInfo = await Table.findOne({
          businessId: businessId,
          name: tableName,
        });

        if (!tableInfo) {
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

        const user = await User.findOne({ phone: customerPhone });
        if (!user) {
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

        // find posconfig for a place order
        const pos = await BusinessPosConfig.findOne({
          businessId: businessId,
          isDeleted: false,
          active: true,
        });

        if (!pos) {
          return c.json(
            {
              message: "POS not found",
              err: true,
              data: {
                success: false,
              },
            },
            404,
          );
        }

        const tableSession = await UserSession.findOne({
          tableName: tableName,
          businessId: businessId,
        });

        if (tableSession?.billRequestId) {
          return c.json(
            {
              message: `Bill already generated for table ${tableName} by ${tableSession?.billGeneratedBy} you can't add more items`,
              err: true,
              data: {
                success: false,
              },
            },
            400,
          );
        }

        const tenDigitCode = generateTenDigitCode();
        if (!tableSession) {
          const registerUser = await axios.post(posApiPaths.registerUser, {
            app_key: pos.accessKey,
            app_secret: pos.secretKey,
            access_token: pos.authToken,
            restID: pos.restId,
            phone: tenDigitCode,
            name: customerName,
          });
          if (registerUser.data.success === "0") {
            throw new Error("user not registered");
          }
          const hiCode = Math.floor(1000 + Math.random() * 9000).toString();
          const userSession = new UserSession(
            {
              businessId: businessId,
              hiCode: hiCode,
              pin: tenDigitCode,
              tableName: tableName,
              customerName: customerName,

              performedBy: "captain",
              date: Date.now(),
            },
            {
              session,
            },
          );
          await userSession.save();
          const petpoojaCart = convertToPetpoojaCart(
            internalCart,
            pos.restId,
            customerName,
            tenDigitCode,
            tableName,
            pos.accessKey,
            pos.secretKey,

            pos.authToken,
          );

          const saveKot = await axios.post(posApiPaths.saveKot, petpoojaCart);
          if (saveKot.data.success === "0") {
            throw new Error("kot not saved in pos");
          }

          await saveKotOrder(
            tableName,
            businessId,
            customerName,
            customerPhone,
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

          return c.json(
            {
              message: "Data fetched successfully",
              err: false,
              data: {
                success: true,
              },
            },
            200,
          );
        }
        // if table session already exists
        const petpoojaCart = convertToPetpoojaCart(
          internalCart,
          pos.restId,
          customerName,
          tableSession.pin,
          tableName,
          pos.accessKey,
          pos.secretKey,
          pos.authToken,
        );

        const saveKot = await axios.post(posApiPaths.saveKot, petpoojaCart);

        if (saveKot.data.success === "0") {
          throw new Error("kot not saved in pos");
        }

        await saveKotOrder(
          tableName,
          businessId,
          tableInfo?.edited ? tableSession.customerName : customerName,
          customerPhone,
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

        return c.json(
          {
            message: "Data fetched successfully",
            err: false,
            data: {
              success: true,
              hiCode: tableSession.hiCode,
            },
          },
          200,
        );
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
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { posConfigId, orderVerificationType, active } =
          await c.req.json();

        const updateBusinessPosConfig =
          await BusinessPosConfig.findOneAndUpdate(
            { _id: posConfigId },
            { orderVerificationType, active },
            { session },
          );

        if (!updateBusinessPosConfig) {
          return respond(c, "Update failed", true, 400, {});
        }

        // if (active === false) {
        //   await Dish.updateMany(
        //     {
        //       businessId,
        //     },
        //     {
        //       $set: {
        //         pos: false,
        //       },
        //     },
        //   );
        //   await AddOn.updateMany(
        //     {
        //       businessId,
        //     },
        //     {
        //       $set: {
        //         pos: false,
        //       },
        //     },
        //   );

        //   await Category.updateMany(
        //     {
        //       businessId: businessId,
        //     },
        //     {
        //       $set: {
        //         pos: false,
        //       },
        //     },
        //   );
        // }

        return respond(c, "Updated successfully", false, 200, {
          _id: updateBusinessPosConfig._id,
        });
      });
    },
  );

export default posRouter;
