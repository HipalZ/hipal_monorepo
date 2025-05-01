import {
  AddOn,
  Business,
  BusinessPosConfig,
  Category,
  DeviceToken,
  Dish,
  Kitchen,
  KotOrder,
  MenuBanner,
  Pos,
  PosBill,
  Table,
  Tax,
  UniquelyYours,
  UrlModel,
  User,
  UserSession,
  Zone,
} from "@hi/db-models";
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
  transformItemsToSimpleArray,
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
              customerPhone: orderData.customer_phone,
              customerName: orderData.customer_name,
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
            customerPhone: orderData.customer_phone,
            customerName: orderData.customer_name,
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
        businessId: z.string().min(3).max(200),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId } = c.req.query();

        const posConfig = await BusinessPosConfig.findOne({
          businessId: businessId,
          isDeleted: false,
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
    "/dishes",
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

        const dishes = await Dish.find({
          businessId: businessId,
          menuId: menuId,
          isDeleted: false,
        });

        return respond(c, "Data fetch", false, 200, dishes);
      });
    },
  )
  .get(
    "/sub_categories",
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

        const categories = await Category.find({
          businessId: businessId,
          menuId: menuId,
          isDeleted: false,
          hierarchy: "CHILD",
        });

        return respond(c, "Data fetch", false, 200, categories);
      });
    },
  )
  .get(
    "/main_categories",
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

        const categories = await Category.find({
          businessId: businessId,
          menuId: menuId,
          isDeleted: false,
          hierarchy: "PARENT",
        });

        return respond(c, "Data fetch", false, 200, categories);
      });
    },
  )
  .get(
    "/addons",
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
        const addons = await AddOn.find({
          businessId: businessId,
          menuId: menuId,
          isDeleted: false,
        });

        return respond(c, "Data fetch", false, 200, addons);
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

  .get(
    "/dish_config",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(3).max(200),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId } = c.req.query();

        const dishConfig = await Pos.findOne({}, { businessId: businessId });

        if (!dishConfig) {
          return c.json(
            {
              message: "POS not found",
              err: true,
              data: { success: false },
            },
            404,
          );
        }

        return respond(c, "Data fetch", false, 200, dishConfig);
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
        // ! this is work if qr code is not generated for the table before this business
        // ! if qr code is generated for the table then we need to use script not this api

        const business =
          await Business.findById(businessId).select("customLink");
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
        if (fetchAreaAndTable.data.success === "0") {
          throw new Error("area and table not fetched");
        }

        if (fetchAreaAndTable.data.success === "0") {
          throw new Error("area and table not fetched");
        }

        if (fetchAreaAndTable.data.success === "1") {
          // areas or zones
          const areas = fetchAreaAndTable.data.areas.filter(
            (area: {
              active: string;
            }) => area.active === "1",
          );

          // tables
          const tables = fetchAreaAndTable.data.tables.filter(
            (table: {
              active: string;
            }) => table.active === "1",
          );
          let zone = null;
          if (areas.length === 0) {
            zone = await Zone.create({
              businessId: businessId,
              name: "POS",
              zoneId: "POS",
              active: "1",
              tableIds: [],
              visibility: true,
            });
          }
          for (const area of areas) {
            // to find exact zone from zoneId
            const zoneId = area.restaurantareaid;
            const zoneName = area.displayname;
            const active = area.active;
            const rank = area.rank;

            zone = await Zone.findOneAndUpdate(
              {
                zoneId,
              },
              {
                name: zoneName,
                businessId: businessId,
                zoneId,
                active,
                rank,
              },
              {
                upsert: true,
                new: true,
                session,
              },
            );
          }

          for (const table of tables) {
            const zoneId = table.restaurantareaid;
            const tableName = table.table_no;
            const active = table.active;
            const rank = table.rank;
            const tableId = table.id;

            const creatingTable = await Table.findOneAndUpdate(
              {
                tableId,
              },
              {
                name: tableName,
                businessId: businessId,
                zoneId,
                active,
                rank,
                tableId,
                internalZoneId: zone?._id,
              },
              {
                upsert: true,
                new: true,
                session,
              },
            );

            // update tableIds in zone

            Zone.findOneAndUpdate(
              {
                zoneId,
              },
              {
                $addToSet: {
                  tableIds: creatingTable._id,
                },
              },
              {
                new: true,
                session,
              },
            );

            const uniqueOrderId = nanoid(5);

            const alreadyExists = await UrlModel.findOne({
              businessId: businessId,
              longUrl: `https://hipalz.com/${business?.customLink}/explore?tableName=${creatingTable.name}`,
            });

            if (!alreadyExists) {
              const createShortUrl = await UrlModel.create({
                businessId: businessId,
                longUrl: `https://hipalz.com/${business?.customLink}/explore?tableName=${creatingTable.name}`,
                shortUrl: `https://api.hipalz.com/surl/${uniqueOrderId}`,
                urlCode: uniqueOrderId,
              });

              await Table.findOneAndUpdate(
                {
                  tableId,
                },
                {
                  tableLink: createShortUrl.shortUrl,
                },
                {
                  new: true,
                  session,
                },
              );
            }
          }

          // // update outlet info
          // await OutLetInfo.findOneAndUpdate(
          //   {
          //     businessId,
          //   },
          //   {
          //     isPosEnabled: true,
          //   },
          //   {
          //     new: true,
          //     upsert: true,
          //     session,
          //   },
          // );

          // update uniquely yours
          await UniquelyYours.findOneAndUpdate(
            {
              businessId,
            },
            {
              isDeleted: true,
            },
            {
              new: true,
              session,
            },
          );
          // update menu banner
          await MenuBanner.findOneAndUpdate(
            {
              businessId,
            },
            {
              isPublished: false,
            },
            {
              new: true,
              session,
            },
          );
        }

        return c.json(
          {
            message: "POS Config saved successfully",
            err: false,
            data: {
              success: true,
            },
          },
          200,
        );
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
  );

export default posRouter;
