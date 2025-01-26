import {
  BusinessPosConfig,
  Cart,
  KotOrder,
  MenuBanner,
  OutLetInfo,
  Pos,
  PosBill,
  Table,
  TempTableSettle,
  UniquelyYours,
  UrlModel,
  User,
  UserSession,
  WhatsAppBusinessConfig,
  Zone,
} from "@hi/db-models";
import { businessPosConfigSchema } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { z } from "zod";
import {
  calculateCartBill,
  convertToPetpoojaCart,
  transformItemsToSimpleArray,
} from "../../utils/helper";

interface AxiosError {
  response?: {
    status?: number;
    data?: {
      error?: {
        message?: string;
      };
    };
  };
  message: string;
}

export const generateTenDigitCode = (): string => {
  const min = 1000000000; // Minimum 10-digit number
  const max = 9999999999; // Maximum 10-digit number
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
};

const saveUserKot = async (
  tableName: string,
  businessId: string,
  customerName: string,
  customerPhone: string,
  internalCart: unknown[],
  userId: string,
) => {
  const existingUserKot = await Cart.findOne({
    tableName: tableName,
    businessId: businessId,
    phone: customerPhone,
    isSettle: false,
  });

  let mergedCart = internalCart;

  if (existingUserKot) {
    mergedCart = [...existingUserKot.cart, ...internalCart];
  }

  await Cart.findOneAndUpdate(
    {
      tableName: tableName,
      businessId: businessId,
      phone: customerPhone,
      isSettle: false,
    },
    {
      tableName: tableName,
      businessId: businessId,
      phone: customerPhone,
      cart: mergedCart,
      date: Date.now(),
      userId: userId,
      name: customerName,
    },
    {
      upsert: true,
    },
  );
  return true;
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

const posRouter = new Hono()
  .get("/all_pos", async (c) => {
    const allPos = await Pos.find({}).select("name _id");

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

        const pos = await BusinessPosConfig.findOne({
          businessId: businessId,
        }).populate("posId");

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

        let getPin = await UserSession.findOne({
          businessId: businessId,
          tableName: tableName,
        });

        console.log("getPin", getPin);

        if (!getPin?.isPinActive) {
          console.log("first");
          const tenDigitCode = generateTenDigitCode();
          const registerUser = await axios.post(
            "http://api.petpooja.com/V1/captainorders/save_menu_qr_customer_information",
            {
              app_key: pos?.posId.accessKey,
              app_secret: pos?.posId.secretKey,
              access_token: pos?.posId.authToken,
              restID: pos?.posId.restId,
              phone: tenDigitCode,
              name: generatedBy,
            },
          );
          if (registerUser.data.success === "0") {
            throw new Error("user not registered");
          }
          getPin = await UserSession.findOneAndUpdate(
            {
              businessId: businessId,
              tableName: tableName,
            },
            {
              pin: tenDigitCode,
              isPinActive: true,
            },
            { new: true, session },
          );
        }

        const billConfig = {
          app_key: pos.posId.accessKey,
          app_secret: pos.posId.secretKey,
          access_token: pos.posId.authToken,
          restID: pos.posId.restId,
          pin: getPin?.pin,
          tableNo: tableName,
        };

        const fetchBill = await axios.post(
          "http://api.petpooja.com/V1/captainorders/request_bill/",
          billConfig,
        );

        if (fetchBill.data.success === "1") {
          const request_id = fetchBill.data.request_id;

          if (!request_id) {
            const bill_request_id = fetchBill.data.bill_request_id;

            const getBillConfig = {
              app_key: pos.posId.accessKey,
              app_secret: pos.posId.secretKey,
              access_token: pos.posId.authToken,
              restID: pos.posId.restId,
              bill_request_id: bill_request_id,
            };

            const getBill = await axios.post(
              "http://api.petpooja.com/V1/captainorders/get_bill/",
              getBillConfig,
            );

            const simpleArray =
              transformItemsToSimpleArray(getBill.data.items_data || []) || [];

            if (getBill.data.success === "1") {
              await PosBill.findOneAndUpdate(
                {
                  businessId: businessId,
                  billRequestId: bill_request_id,
                },
                {
                  items: simpleArray,
                  billInfo: getBill.data.order_data,
                  createdAt: Date.now(),
                },
                {
                  upsert: true,
                  new: true,
                },
              );

              await UserSession.findOneAndUpdate(
                {
                  businessId: businessId,
                  tableName: tableName,
                },
                {
                  billGeneratedBy: generatedBy,
                  billRequestId: bill_request_id,
                  tax: getBill?.data?.order_data?.tax || 0,
                  serviceCharge: getBill?.data?.order_data?.service_charge || 0,
                  billInvoiceId: getBill.data?.order_data?.invoice_id,
                },
              );
              const billObj = {
                billing_user_name: getBill.data.order_data.billing_user_name,
                serviceCharge: getBill.data.order_data.service_charge,
                discount: getBill.data.order_data.discount,
                tax: getBill.data.order_data.tax,
                total: getBill.data.order_data.total,
                customerPhone: getBill.data.order_data.customer_phone,
                customerName: getBill.data.order_data.customer_name,
                tableName: getBill.data.order_data.table_no,

                subTotal: getBill.data.order_data.core_price,
                billRequestId: bill_request_id,
                items: simpleArray,
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

          const billRequestConfig = {
            app_key: pos.posId.accessKey,
            app_secret: pos.posId.secretKey,
            access_token: pos.posId.authToken,
            restID: pos.posId.restId,
            request_id: request_id,
          };

          const fetchBillDetails = await axios.post(
            "http://api.petpooja.com/V1/captainorders/check_bill/",
            billRequestConfig,
          );

          if (fetchBillDetails.data.success === "1") {
            const bill_request_id = fetchBillDetails.data.bill_request_id;

            const getBillConfig = {
              app_key: pos.posId.accessKey,
              app_secret: pos.posId.secretKey,
              access_token: pos.posId.authToken,
              restID: pos.posId.restId,
              bill_request_id: bill_request_id,
            };

            const getBill = await axios.post(
              "http://api.petpooja.com/V1/captainorders/get_bill/",
              getBillConfig,
            );

            const simpleArray =
              transformItemsToSimpleArray(getBill.data.items_data || []) || [];

            if (getBill.data.success === "1") {
              await PosBill.findOneAndUpdate(
                {
                  businessId: businessId,
                  billRequestId: bill_request_id,
                },
                {
                  items: simpleArray,
                  billInfo: getBill.data.order_data,
                  createdAt: Date.now(),
                },
                {
                  upsert: true,
                  new: true,
                },
              );

              const billObj = {
                billing_user_name: getBill.data.order_data.billing_user_name,
                serviceCharge: getBill.data.order_data.service_charge,
                discount: getBill.data.order_data.discount,
                tax: getBill.data.order_data.tax,
                total: getBill.data.order_data.total,
                customerPhone: getBill.data.order_data.customer_phone,
                customerName: getBill.data.order_data.customer_name,
                tableName: getBill.data.order_data.table_no,
                billRequestId: bill_request_id,
                items: simpleArray,
                subTotal: getBill.data.order_data.core_price,
              };
              await UserSession.findOneAndUpdate(
                {
                  businessId: businessId,
                  tableName: tableName,
                },
                {
                  billGeneratedBy: generatedBy,
                  billRequestId: bill_request_id,
                  billInvoiceId: getBill.data?.order_data?.invoice_id,
                  tax: getBill?.data?.order_data?.tax || 0,
                  serviceCharge: getBill?.data?.order_data?.service_charge,
                },
              );
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
        }

        return c.json(
          {
            message: "Error fetching data",
            err: true,
            data: {
              success: false,
            },
          },
          400,
        );
      });
    },
  )

  .post(
    "/setup_pos_config",

    zValidator("json", businessPosConfigSchema),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { businessId, userId } = await c.req.json();

        const user = await User.findById(userId);

        const body = await c.req.json();

        const posConfigAlreadyExists = await BusinessPosConfig.findOne({
          businessId,
        });

        if (posConfigAlreadyExists) {
          return c.json(
            {
              message: "POS Config already exists",
              err: true,
              data: {
                exist: true,
              },
            },
            409,
          );
        }

        const savePosConfig = await BusinessPosConfig.create({
          ...body,
          date: Date.now(),
        });

        if (!savePosConfig) {
          return c.json(
            {
              message: "Error saving POS Config",
              err: true,
              data: {
                success: false,
              },
            },
            400,
          );
        }

        const config = await WhatsAppBusinessConfig.findOne({
          businessId: businessId,
        });

        const phoneNumberArray = [
          "9588413799",
          "7702605494",
          "8668229890",
          "9177914130",
        ];

        // for (let i = 0; i < phoneNumberArray.length; i++) {
        //   const phoneNumber = phoneNumberArray[i];
        //   try {
        //     const res = await axios.post(
        //       `https://graph.facebook.com/${config?.version}/${config?.phoneId}/messages`,
        //       {
        //         messaging_product: "whatsapp",
        //         to: phoneNumber,
        //         type: "template",
        //         template: {
        //           name: "pos_integration_request",
        //           language: { code: "en_GB" },
        //           components: [
        //             {
        //               type: "HEADER",
        //               text: "Hello",
        //             },
        //             {
        //               type: "BODY",
        //               parameters: [
        //                 {
        //                   type: "text",
        //                   text: user?.name || "User",
        //                 },
        //               ],
        //             },
        //             {
        //               type: "FOOTER",
        //               text: "Powered by tester",
        //             },
        //           ],
        //         },
        //       },
        //       {
        //         headers: {
        //           Authorization: `Bearer ${config?.token}`,
        //         },
        //       },
        //     );
        //     console.log("Res", res.data);
        //   } catch (error) {
        //     if (axios.isAxiosError(error)) {
        //       console.error("Axios error:", error.response?.data);
        //     } else {
        //       console.error("Unexpected error:", error);
        //     }
        //   }
        // }

        return c.json(
          {
            message: "POS Config saved successfully",
            err: false,
            data: {
              success: true,
            },
          },
          201,
        );
      });
    },
  )

  .post(
    "/setup_pos_config_data",

    zValidator(
      "json",
      z.object({
        posId: z.string().min(3).max(200),
        businessId: z.string().min(3).max(200),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { posId, businessId } = await c.req.json();

        const pos = await Pos.findById(posId);

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

        const fetchAreaAndTable = await axios.post(
          "https://onlineapipp.petpooja.com/thirdparty_fetch_dinein_menu",
          {
            "app-key": pos.accessKey,
            "app-secret": pos.secretKey,
            "access-token": pos.authToken,
            restID: pos.restId,
            tableNo: "",
          },
        );

        if (fetchAreaAndTable.data.success === "1") {
          const areas = fetchAreaAndTable.data.areas;
          const tables = fetchAreaAndTable.data.tables;

          for (const area of areas) {
            const zoneId = area.restaurantareaid;
            const zoneName = area.displayname;
            const active = area.active;
            const rank = area.rank;

            await Zone.findOneAndUpdate(
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

          for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            const zoneId = table.restaurantareaid;
            const tableName = table.table_no;
            const active = table.active;
            const rank = table.rank;
            const tableId = table.id;

            await Table.findOneAndUpdate(
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
              },
              {
                upsert: true,
                new: true,
                session,
              },
            );

            const shortUrls = await UrlModel.find({
              businessId: businessId,
            });

            const shortUrl = shortUrls[i];
            if (shortUrl) {
              const shortUrlLongUrl = new URL(shortUrl.longUrl);

              shortUrlLongUrl.searchParams.set("tableName", tableName);

              const updatedLongUrl = shortUrlLongUrl.toString();

              await UrlModel.findOneAndUpdate(
                {
                  businessId: businessId,
                  longUrl: shortUrl.longUrl,
                },
                {
                  longUrl: updatedLongUrl,
                },
                {
                  session,
                },
              );
            } else {
              console.error(`Invalid shortUrl or longUrl at index ${i}`);
            }
          }

          await OutLetInfo.findOneAndUpdate(
            {
              businessId,
            },
            {
              isPosEnabled: true,
              restId: pos.restId,
            },
            {
              new: true,
              upsert: true,
              session,
            },
          );

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

        return c.json(
          {
            message: "Error fetching data",
            err: true,
            data: {
              success: false,
            },
          },
          400,
        );
      });
    },
  )

  .post(
    "/save_kot",
    zValidator(
      "json",
      z.object({
        tableName: z.string().max(200),
        internalCart: z.array(z.object({})),
        businessId: z.string().min(1).max(200),
        customerName: z.string().min(1).max(200),
        customerPhone: z.string().min(1).max(200),
        hiCode: z.string().max(200).optional(),
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
          hiCode,
        } = await c.req.json();

        const Tinfo = await Table.findOne({
          businessId: businessId,
          name: tableName,
        });

        //
        const tInfoData = await UserSession.findOne({
          businessId: businessId,
          $or: [
            {
              transferTableTo: Tinfo?._id?.toString(),
            },
            {
              transferTableFrom: Tinfo?._id?.toString(),
            },
          ],
        });

        const findUserActiveSession = await UserSession.findOne({
          businessId: businessId,
          phoneNumbers: customerPhone,
        });

        if (
          findUserActiveSession &&
          findUserActiveSession.tableName !== tableName &&
          !tInfoData
        ) {
          return c.json(
            {
              message: `User already active on table ${findUserActiveSession.tableName}`,
              err: true,
              data: {
                success: false,
                data: {
                  tableName: findUserActiveSession.tableName,
                  hiCode: findUserActiveSession.hiCode,
                },
              },
            },
            409,
          );
        }

        if (
          findUserActiveSession &&
          findUserActiveSession.tableName !== tableName &&
          findUserActiveSession.isTransfer === false
        ) {
          return c.json(
            {
              message: `User already active on table ${findUserActiveSession.tableName}`,
              err: true,
              data: {
                success: false,
                data: {
                  tableName: findUserActiveSession.tableName,
                  hiCode: findUserActiveSession.hiCode,
                },
              },
            },
            409,
          );
        }

        const userTableSession = await UserSession.findOne({
          businessId: businessId,
          phoneNumbers: customerPhone,
          isTransfer: true,
          transferTableTo: { $exists: true },
          transferType: "TABLE",
        });

        const sessionTable = await Table.findOne({
          businessId: businessId,
          _id: userTableSession?.transferTableTo?.toString(),
        });

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
        const tableInfo = await Table.findOneAndUpdate(
          {
            businessId: businessId,
            name: sessionTable ? sessionTable.name : tableName,
          },
          {
            $addToSet: {
              userIds: user?._id,
            },
          },
          { session },
        );

        const fetchTableAlreadySettle = await TempTableSettle.findOne({
          tableName: sessionTable ? sessionTable.name : tableName,
          businessId: businessId,
          hiCode: sessionTable ? sessionTable.hiCode : hiCode,
        });

        if (fetchTableAlreadySettle) {
          return c.json(
            {
              message: `Table already settled by ${fetchTableAlreadySettle.settleBy} please scan the QR code again`,
              err: true,
              data: {
                success: false,
              },
            },
            401,
          );
        }

        //TODO
        // find posconfig for a place order
        const pos = await BusinessPosConfig.findOne({
          businessId: businessId,
        }).populate("posId");

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

        const fetchHiCode = await UserSession.findOne({
          tableName: sessionTable ? sessionTable.name : tableName,
          businessId: businessId,
        });

        // check if bill already generated for a table
        if (fetchHiCode?.billRequestId) {
          return c.json(
            {
              message: `Bill already generated for table ${
                sessionTable ? sessionTable.name : tableName
              } by ${fetchHiCode?.billGeneratedBy} you can't add more items`,
              err: true,
              data: {
                success: false,
              },
            },
            400,
          );
        }

        if (fetchHiCode) {
          if (
            !fetchHiCode.phoneNumbers.includes(customerPhone) &&
            fetchHiCode?.hiCode &&
            fetchHiCode.hiCode.length > 0
          ) {
            return c.json(
              {
                message: `this table is already occupied by ${fetchHiCode.customerName} please ask them to place the order`,
                err: true,
                data: {
                  success: false,
                  name: fetchHiCode.customerName,
                  phone: fetchHiCode.pin,
                },
              },
              403,
            );
          }
        }

        if (!fetchHiCode) {
          const tenDigitCode = generateTenDigitCode();
          // const registerUser = await axios.post(
          //   "http://api.petpooja.com/V1/captainorders/save_menu_qr_customer_information",
          //   {
          //     app_key: pos?.posId.accessKey,
          //     app_secret: pos?.posId.secretKey,
          //     access_token: pos?.posId.authToken,
          //     restID: pos?.posId.restId,
          //     phone: tenDigitCode,
          //     name: customerName,
          //   },
          // );
          // if (registerUser.data.success === "0") {
          //   throw new Error("user not registered");
          // }
          const hiCode = Math.floor(1000 + Math.random() * 9000).toString();

          await Table.findOneAndUpdate(
            {
              businessId: businessId,
              name: tableName,
            },
            {
              hiCode: hiCode,
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
              customerIds: [user._id],
              performedBy: "user",
              date: Date.now(),
            },
            {
              session,
            },
          );
          await userSession.save();
          await saveKotOrder(
            tableName,
            businessId,
            customerName,
            customerPhone,
            internalCart,
            user._id,
            false,
            tableInfo._id.toString(),
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

        await saveKotOrder(
          sessionTable ? sessionTable.name : tableName,
          businessId,
          customerName,
          customerPhone,
          internalCart,
          user._id,
          false,
          tableInfo._id.toString(),
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
              hiCode: fetchHiCode?.hiCode,
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
      const { hiCode, customerPhone, businessId } = await c.req.json();

      const user = await User.findOne({ phone: customerPhone });

      const hiCodeData = await UserSession.findOne({
        hiCode: hiCode,
        businessId: businessId,
      });

      if (!hiCodeData) {
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

          tableName: hiCodeData.tableName,
        },
        {
          $addToSet: { phoneNumbers: customerPhone, customerIds: user?._id },
        },
        {
          new: true,
        },
      );

      return c.json(
        {
          message: "HiCode validated successfully",
          err: false,
          data: {
            success: true,
            hiCode: hiCodeData.hiCode,
            pin: hiCodeData.pin,
          },
        },
        200,
      );
    },
  )

  .post(
    "/captain/save_kot",
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
        }).populate("posId");

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

        const fetchHiCode = await UserSession.findOne({
          tableName: tableName,
          businessId: businessId,
        });

        if (fetchHiCode?.billRequestId) {
          return c.json(
            {
              message: `Bill already generated for table ${tableName} by ${fetchHiCode?.billGeneratedBy} you can't add more items`,
              err: true,
              data: {
                success: false,
              },
            },
            400,
          );
        }

        const tenDigitCode = generateTenDigitCode();
        if (!fetchHiCode) {
          // const registerUser = await axios.post(
          //   "http://api.petpooja.com/V1/captainorders/save_menu_qr_customer_information",
          //   {
          //     app_key: pos?.posId.accessKey,
          //     app_secret: pos?.posId.secretKey,
          //     access_token: pos?.posId.authToken,
          //     restID: pos?.posId.restId,
          //     phone: tenDigitCode,
          //     name: customerName,
          //   },
          // );
          // if (registerUser.data.success === "0") {
          //   throw new Error("user not registered");
          // }
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
            pos?.posId.restId,
            customerName,
            tenDigitCode,
            tableName,
            pos.posId.accessKey,
            pos.posId.secretKey,

            pos.posId.authToken,
          );

          const saveKot = await axios.post(
            "https://api.petpooja.com/V1/captainorders/save_kot_qr_order",
            petpoojaCart,
          );
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

        const petpoojaCart = convertToPetpoojaCart(
          internalCart,
          pos?.posId.restId,
          customerName,
          fetchHiCode.pin,
          tableName,
          pos.posId.accessKey,
          pos.posId.secretKey,

          pos.posId.authToken,
        );

        const saveKot = await axios.post(
          "https://api.petpooja.com/V1/captainorders/save_kot_qr_order",
          petpoojaCart,
        );

        if (saveKot.data.success === "0") {
          throw new Error("kot not saved in pos");
        }

        await saveKotOrder(
          tableName,
          businessId,
          tableInfo?.edited ? fetchHiCode.customerName : customerName,
          customerPhone,
          internalCart,
          user._id,
          true,
          tableInfo?._id.toString(),
          tableInfo?.edited,
          tableInfo?.editedBy,
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
              hiCode: fetchHiCode.hiCode,
            },
          },
          200,
        );
      });
    },
  )

  .post(
    "/save_pos_credentials",

    zValidator(
      "json",
      z.object({
        secretKey: z.string().min(3).max(200),
        accessKey: z.string().min(3).max(200),
        authToken: z.string().min(3).max(200),
        restId: z.string().min(3).max(200),
        name: z.string().min(1).max(100),
      }),
    ),

    async (c) => {
      const { secretKey, accessKey, authToken, restId, name } =
        await c.req.json();

      const pos = await Pos.findOneAndUpdate(
        {
          name,
        },
        {
          secretKey,
          accessKey,
          authToken,
          restId,
          name,
        },
        {
          upsert: true,
          new: true,
        },
      );

      if (!pos) {
        return c.json(
          {
            message: "Error saving POS credentials",
            err: true,
            data: {
              success: false,
            },
          },
          400,
        );
      }

      return c.json(
        {
          message: "POS credentials saved successfully",
          err: false,
          data: {
            success: true,
          },
        },
        201,
      );
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
      const hiCode = await UserSession.findOne({
        tableName: tableName,
        businessId: businessId,
      });

      if (!hiCode) {
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
            hiCode: hiCode.hiCode,
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

      const user = await User.findById(userId);

      const sessionTableInfo = await UserSession.findOne({
        businessId: businessId,
        phoneNumbers: user.phone,
        isTransfer: true,
      });

      const sessionTableFind = await Table.findOne({
        businessId: businessId,
        _id: sessionTableInfo?.transferTableTo?.toString() || null,
      });

      const userKot = await KotOrder.find({
        tableName: sessionTableFind ? sessionTableFind.name : tableName,
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

      console.log("userKot", userKot);

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

      const user = await User.findById(userId);

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

      const TableInfo = await Table.findOne({
        businessId: businessId,
        name: tableName,
      });

      const sessionTableInfo = await UserSession.findOne({
        transferTableFrom: TableInfo?._id.toString(),
        businessId: businessId,
        phoneNumbers: user.phone,
        isTransfer: true,
      });

      const sessionTableFind = await Table.findOne({
        businessId: businessId,
        _id: sessionTableInfo?.transferTableTo?.toString(),
      });

      const tableInfo = await UserSession.findOne({
        tableName: sessionTableFind ? sessionTableFind.name : tableName,
        businessId: businessId,
      });

      console.log("TableInfo", tableInfo);

      if (tableInfo && !tableInfo?.phoneNumbers.includes(user.phone)) {
        return c.json(
          {
            message: `this table is already occupied by ${tableInfo?.customerName} please ask them to place the order`,
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
