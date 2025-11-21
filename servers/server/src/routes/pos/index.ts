import {
  AddOn,
  BusinessPosConfig,
  Category,
  Couponz,
  DeviceToken,
  Dish,
  Kitchen,
  KotInvoiceNumber,
  KotOrder,
  MergeTable,
  OutLetInfo,
  PasswordManager,
  Payment,
  PaymentAlert,
  Pos,
  SplitBillTableSession,
  Table,
  TableSessionCounter,
  Tax,
  UnsettleTable,
  User,
  UserAnalytic,
  UserSession,
  Zone,
} from "@hi/db-models";
import {
  OrderVerificationTypeEnum,
  type UserSessionSchemaType,
} from "@hi/db-models/src/validators";

import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { z } from "zod";
import {
  applyCoinToVariantBill,
  applyCouponToVariantBill,
  applyDiscountToVariantBill,
  checkOriginBillIsSplit,
  checkVariantIsPaid,
  removeCoinFromVariantBill,
  removeCouponFromVariantBill,
  removeDiscountFromVariantBill,
  returnSplitBillVariants,
  returnSplitBillVariantsForItemWise,
  variantIsPaid,
} from "../../services/splitBill";
import type { CartItem, KotOrderTypes } from "../../utils/bill";
import {
  calculateBillDishIds,
  calculateBillTotals,
  calculateFinalTotal,
  calculateItemUpdated,
  calculateItemUpdatedGstAfterDiscount,
  calculateTotalDiscount,
  calculateUpdatedGstAfterDiscount,
  groupItemsByGST,
  groupSplitItemsByGST,
  updateSplitTableSession,
  updateTableSession,
} from "../../utils/bill";
import type { Item } from "../../utils/billTypes";
import { executePosHandler } from "../../utils/executePoshandlers.ts";
import { calculateCartBill, convertToPetpoojaCart } from "../../utils/helper";
import { sendBillPrintEvent, sendKOTPrintEvent } from "../../utils/kot";
import { posApiPaths } from "../../utils/posConfig/petPooja";
import { respond } from "../../utils/response";
const admin = require("firebase-admin");
export const generateTenDigitCode = (): string => {
  const min = 1000000000; // Minimum 10-digit number
  const max = 9999999999; // Maximum 10-digit number
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
};

export const saveKotOrder = async (
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
  const kotInvoiceNumber = await KotInvoiceNumber.findOneAndUpdate(
    {
      businessId,
    },
    {
      $inc: {
        kotInvoiceNumber: 1,
      },
    },
    {
      session,
      upsert: true,
    },
  );
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
        kotInvoiceNumber: kotInvoiceNumber?.kotInvoiceNumber,
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
    kotInvoiceNumber: saveKot[0].kotInvoiceNumber,
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
      kotInvoiceNumber: resData?.kotInvoiceNumber,
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
      return runInTransaction(async (session) => {
        const { businessId, tableName, generatedBy } = c.req.query();
        const businessPosConfig = await BusinessPosConfig.findOne({
          businessId,
          isDeleted: false,
          active: true,
        });

        if (!businessPosConfig) {
          return respond(c, "Pos not found", true, 400, {});
        }
        const tInfo = await Table.findOne({ businessId, name: tableName });

        if (!tInfo) {
          return respond(c, "Table not found", true, 404, {});
        }

        const isTableMerge = await MergeTable.findOne({
          businessId: businessId,
          childTableIds: tInfo._id.toString(),
        }).populate("parentTableId");

        // Get the table session
        let tableSession = await UserSession.findOne({
          businessId,
          tableName: isTableMerge?.parentTableId.name || tableName,
        }).populate({
          path: "discountAppliedBy discountRemovedBy serviceChargeAppliedBy serviceChargeRemovedBy billingUserId",
          select: "name phone",
        });

        const billingUserName = tableSession?.billingUserId?.name;
        const billingUserPhone = tableSession?.billingUserId?.phone;

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        await TableSessionCounter.findOneAndUpdate(
          {
            businessId,
            tableSessionId: tableSession._id.toString(),
          },
          {},

          { upsert: true },
        );

        const sessionCount = await TableSessionCounter.countDocuments({
          businessId,
        });

        if (tableSession.isSplit) {
          if (tableSession.splitType === "ITEM") {
            const splitBillVariants = await returnSplitBillVariantsForItemWise(
              tableSession._id.toString(),
              tableSession.businessId.toString(),
              tableSession.tableName,
              session,
            );

            return respond(c, "success", false, 200, splitBillVariants);
          }
          const splitBillVariants = await returnSplitBillVariants(
            tableSession._id.toString(),
            tableSession.businessId.toString(),
            tableSession.tableName,
            session,
          );

          return respond(c, "success", false, 200, splitBillVariants);
        }
        const kotOrders = (await KotOrder.find({
          tableName: tableSession.tableName,
          settled: false,
          accepted: true,
          businessId,
        }).lean()) as KotOrderTypes[];

        const cartItems = kotOrders.flatMap((order) =>
          order.cart.filter((item) => !item.isDeleted),
        ) as Item[];

        if (cartItems.length === 0) {
          return respond(c, "No items in the cart", true, 400, {});
        }

        const { totalDishTotal, totalGst } = calculateBillTotals(kotOrders);

        const billItems = groupItemsByGST(cartItems);

        const discountAppliedBy = tableSession.discountAppliedBy?.name || "";
        const discountRemovedBy = tableSession.discountRemovedBy?.name || "";
        const serviceChargeAppliedBy =
          tableSession.serviceChargeAppliedBy?.name || "";
        const serviceChargeRemovedBy =
          tableSession.serviceChargeRemovedBy?.name || "";

        // Get service charge info
        const serviceCharge = await Tax.findOne({
          businessId,
          menuId: cartItems[0].dish.menuId,
          isActive: true,
          name: "servicecharge",
        });

        const serviceChargePercentage =
          tableSession.serviceChargePercentage || serviceCharge?.value || 0;

        let serviceChargeAmount = Math.round(
          (serviceChargePercentage / 100) * totalDishTotal,
        );
        if (tableSession.isServiceChargeRemoved) serviceChargeAmount = 0;

        const gst = tableSession.isDiscountApplied
          ? tableSession.gst
          : totalGst;
        const newGst = gst;

        const totalDis = calculateTotalDiscount(
          tableSession.discount,
          tableSession.claimedCoins,
          tableSession.couponDiscount,
        );

        // Final total
        const newTotal = calculateFinalTotal(
          totalDishTotal,
          totalDis,
          newGst,
          serviceChargeAmount,
          tableSession.otherTax,
          tableSession.tips,
        );

        // Update table session with new values
        tableSession = await updateTableSession(
          businessId,
          tableSession.tableName,
          session,
          {
            gst: Number(newGst.toFixed(2)),
            total: newTotal,
            serviceCharge: serviceChargeAmount,
            billGeneratedBy: generatedBy,
            subTotal: totalDishTotal,
            items: cartItems,
            billPrintCount: tableSession.billPrintCount + 1,
            totalGst: Number(totalGst?.toFixed(2)),
            ...(tableSession.billInvoice === 0 && {
              billInvoice: sessionCount,
            }),
            serviceChargePercentage:
              tableSession.serviceChargePercentage || serviceCharge?.value || 0,
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
              customerName: billingUserName || tableSession.customerName,
              customerPhone: billingUserPhone ? "************" : kotOrders[0].phone,
              tableName: tableSession.tableName,
              couponId: tableSession.couponId,
              discountAppliedOn: tableSession.discountAppliedOn,
              reasonOfDiscount: tableSession.reasonOfDiscount,
              reasonOfServiceCharge: tableSession.reasonOfServiceCharge,
              serviceChargeAppliedBy: serviceChargeAppliedBy,
              serviceChargeRemovedBy: serviceChargeRemovedBy,
              discountAppliedBy: discountAppliedBy,
              discountRemovedBy: discountRemovedBy,
              billItems,
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
              serviceChargePercentage:
                tableSession.serviceChargePercentage ||
                serviceCharge?.value ||
                0,
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

  .get(
    "/fetch_bill",
    zValidator(
      "query",
      z.object({
        orderId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { orderId } = c.req.query();

        let tableSessionData;

        tableSessionData = await UserSession.findById(orderId);

        if (!tableSessionData) {
          tableSessionData = await SplitBillTableSession.findById(orderId);
          if (!tableSessionData) {
            return respond(c, "Session not found", true, 404, {});
          }
        }

        return respond(c, "Data fetch", false, 200, {
          customerName: tableSessionData.customerName,
          customerPhone: tableSessionData?.phoneNumbers?.[0] || "",
          tableName: tableSessionData.tableName,
          couponId: tableSessionData.couponId,
          discountAppliedOn: tableSessionData.discountAppliedOn,
          reasonOfDiscount: tableSessionData.reasonOfDiscount,
          reasonOfServiceCharge: tableSessionData.reasonOfServiceCharge,
          billItems: tableSessionData.items,
          subTotal: tableSessionData.subTotal,
          gst: tableSessionData.gst,
          discount: tableSessionData.discount,
          claimedCoins: tableSessionData.claimedCoins,
          couponDiscount: tableSessionData.couponDiscount,
          serviceCharge: tableSessionData.serviceCharge,
          tips: tableSessionData.tips,
          total: tableSessionData.total,
          billId: tableSessionData._id.toString(),
          variantId: tableSessionData._id.toString(),
        });
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

        const posData = await Pos.findById(posId);
        if (!posData) return respond(c, "POS not founds", true, 404);

        const result = await executePosHandler(posData.name, "setup", {
          businessId,
          restId,
          orderVerificationType,
          posId,
          session,
        });

        if (!result) {
          throw new Error("Internal error in POS setup");
        }

        return respond(c, "", false, 200, result);
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

        const businessPosConfig = await BusinessPosConfig.findOne({
          businessId,
          isDeleted: false,
          active: true,
        }).session(session);

        if (!businessPosConfig) {
          return respond(c, "POS not found", true, 404);
        }

        const result = await executePosHandler(
          businessPosConfig.posName,
          "sync_menu",
          {
            businessId,
            restId,
            session,
          },
        );

        if (!result) {
          throw new Error("Internal error in POS sync menu");
        }

        return c.json({
          message: "Menu synced successfully",
          err: false,
          data: {},
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
        userId: z.string().min(1).max(100).optional(),
        customerPhone: z.string().min(1).max(10).optional(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { internalCart, tableName, businessId, userId, customerPhone } =
          await c.req.json();

        const tInfo = await Table.findOne({ businessId, name: tableName });

        if (!tInfo) {
          return respond(c, "Table not found", true, 404, {});
        }

        let tableData = null;

        const isTableMerge = await MergeTable.findOne({
          businessId: businessId,
          childTableIds: tInfo._id.toString(),
        }).populate("parentTableId");

        if (isTableMerge) {
          tableData = await Table.findOne({
            businessId: businessId,
            name: isTableMerge.parentTableId.name,
          });
        } else {
          tableData = await Table.findOne({
            businessId: businessId,
            name: tableName,
          });
        }

        if (!tableData) {
          return respond(c, "Table not found", true, 404, {});
        }

        // const userData = await User.findById(userId);
        const userData = await User.findOne({
          phone: customerPhone,
        });

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

        const orderAlreadyExist = await PaymentAlert.findOne({
          businessId,
          tableName: tableData.name,
          alertType: "OFFLINE",
          isAccepted: false,
        });

        if (orderAlreadyExist)
          return respond(
            c,
            "A request for this service is already in progress. Please wait for the staff to take action",
            true,
            400,
            {},
          );

        const registrationToken = await DeviceToken.find({
          businessId: businessId,
        });
        const userTableSession = (await UserSession.findOne({
          tableName: tableData.name,
          businessId: businessId,
        })) as UserSessionSchemaType;

        const billAlreadySplit = checkOriginBillIsSplit(userTableSession);
        if (billAlreadySplit) {
          return respond(
            c,
            "Bill already split you cannot place order",
            true,
            400,
            {},
          );
        }

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
              name: tableData.name,
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
              tableName: tableData.name,
              customerName: userData.name,
              phoneNumbers: [userData.phone],
              customerIds: [userData._id],
              performedBy: "user",
              date: Date.now(),
              paxCount: 1,
            },
            {
              session,
            },
          );
          await userSession.save();
          if (posConfigData.orderVerificationType === "USER") {
            const result = await saveOrder(
              tableData.name,
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
              tableName: tableData.name,
              businessId,
              customerName: userData.name as string,
              customerPhone: userData.phone as string,
              cart: internalCart,
              acceptedBy: "direct_user",
              kotId: result?.data?.kotId?.toString() ?? "",
              date: Date.now(),
              posRestName: posConfigData?.restName,
              kotInvoiceNumber: result?.data?.kotInvoiceNumber,
            });

            return c.json(result, 200);
          }

          await saveKotOrder(
            tableData.name,
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
            tableData.name,
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
            tableName: tableData.name,
            businessId,
            customerName: userData.name as string,
            customerPhone: userData.phone as string,
            cart: internalCart,
            acceptedBy: "direct_user",
            kotId: result?.data?.kotId?.toString() ?? "",
            date: Date.now(),
            posRestName: posConfigData?.restName,
            kotInvoiceNumber: result?.data?.kotInvoiceNumber,
          });

          return c.json(result, 200);
        }

        await saveKotOrder(
          tableData.name,
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
            paxCount: userTableSession.paxCount + 1,
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
    // ubacMiddleware("place_order"),
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

        let tableInfo = null;

        const tInfo = await Table.findOne({ businessId, name: tableName });

        if (!tInfo) {
          return respond(c, "Table not found", true, 404, {});
        }

        const isTableMerge = await MergeTable.findOne({
          businessId: businessId,
          childTableIds: tInfo._id.toString(),
        }).populate("parentTableId");

        if (isTableMerge) {
          tableInfo = await Table.findOne({
            businessId: businessId,
            name: isTableMerge.parentTableId.name,
          });
        } else {
          tableInfo = await Table.findOne({
            businessId: businessId,
            name: tableName,
          });
        }

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

        const tableSession = (await UserSession.findOne({
          tableName: tableInfo.name,
          businessId: businessId,
        })) as UserSessionSchemaType;

        const billAlreadySplit = checkOriginBillIsSplit(tableSession);
        if (billAlreadySplit) {
          return respond(
            c,
            "Bill already split you cannot place order",
            true,
            400,
            {},
          );
        }

        const orderAlreadyExist = await PaymentAlert.findOne({
          businessId,
          tableName: tableInfo.name,
          alertType: "OFFLINE",
          isAccepted: false,
        });

        if (orderAlreadyExist)
          return respond(
            c,
            "A request for this service is already in progress. Please wait for the staff to take action",
            true,
            400,
            {},
          );

        const tenDigitCode = generateTenDigitCode();

        if (!tableSession) {
          const hiCode = Math.floor(1000 + Math.random() * 9000).toString();
          const userSession = new UserSession(
            {
              businessId: businessId,
              hiCode: hiCode,
              pin: tenDigitCode,
              tableName: tableInfo.name,
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
            tableInfo.name,
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
              name: tableInfo.name,
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
            tableName: tableInfo.name,
            businessId,
            customerName: user.name as string,
            customerPhone: user.phone as string,
            cart: internalCart,
            acceptedBy: user.name as string,
            kotId: res?.kotId?.toString() ?? "",
            date: Date.now(),
            posRestName: pos?.restName,
            kotInvoiceNumber: res?.kotInvoiceNumber,
          });

          return respond(c, "Data fetched successfully", false, 200, {
            success: true,
          });
        }

        const res = await saveKotOrder(
          tableInfo.name,
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
            name: tableInfo.name,
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
          tableName: tableInfo.name,
          businessId,
          customerName: user.name as string,
          customerPhone: user.phone as string,
          cart: internalCart,
          acceptedBy: user.name as string,
          kotId: res?.kotId?.toString() ?? "",
          date: Date.now(),
          posRestName: pos?.restName,
          kotInvoiceNumber: res?.kotInvoiceNumber,
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

      const tInfo = await Table.findOne({ businessId, name: tableName });

      if (!tInfo) {
        return respond(c, "Table not found", true, 404, {});
      }

      let tableData = null;

      const isTableMerge = await MergeTable.findOne({
        businessId: businessId,
        childTableIds: tInfo._id.toString(),
      }).populate("parentTableId");

      if (isTableMerge) {
        tableData = await Table.findOne({
          businessId: businessId,
          name: isTableMerge.parentTableId.name,
        });
      } else {
        tableData = await Table.findOne({
          businessId: businessId,
          name: tableName,
        });
      }

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

      const tInfo = await Table.findOne({ businessId, name: tableName });

      if (!tInfo) {
        return respond(c, "Table not found", true, 404, {});
      }

      let tableData = null;

      const isTableMerge = await MergeTable.findOne({
        businessId: businessId,
        childTableIds: tInfo._id.toString(),
      }).populate("parentTableId");

      if (isTableMerge) {
        tableData = await Table.findOne({
          businessId: businessId,
          name: isTableMerge.parentTableId.name,
        });
      } else {
        tableData = await Table.findOne({
          businessId: businessId,
          name: tableName,
        });
      }

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
        tableName: tableData.name,
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

  .post(
    "/bill/user",
    zValidator(
      "json",
      z.object({
        customerName: z.string().min(1).max(50),
        phone: z.string().min(10).max(10).optional(),
        businessId: z.string().min(24).max(24),
        tableName: z.string().min(1).max(100),
        variantId: z.string().min(24).max(24).optional(),
      }),
    ),
    async (c) => {
      const { customerName, phone, businessId, tableName, variantId } =
        c.req.valid("json");

      const getOrCreateUserWithAnalytics = async ({
        phone,
        customerName,
        businessId,
        session,
      }: {
        phone?: string;
        customerName: string;
        businessId: string;
        session: ClientSession;
      }) => {
        const phoneToUse = phone ?? generateTenDigitCode();

        let user = await User.findOneAndUpdate({ phone: phoneToUse },{
          name: customerName,
        }, { session });
        if (!user) {
          user = new User({
            phone: phoneToUse,
            name: customerName,
          });

          await user.save({ session });

          const userAnalytics = new UserAnalytic({
            userId: user._id,
            businessId,
            totalSpend: 0,
            visitCount: 1,
            dateOfJoining: Date.now(),
            coinzIssued: 0,
            coinzUsed: 0,
            couponCount: 0,
            currentCoins: 0,
            avgSpend: 0,
          });

          await userAnalytics.save({ session });
        }

        return user;
      };

      // @ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const tableSession = await UserSession.findOne({
          businessId,
          tableName,
        });

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        const isBillSplit = await checkOriginBillIsSplit(tableSession);

        if (isBillSplit && !variantId) {
          return respond(
            c,
            "variantId is required for split bill",
            true,
            400,
            {},
          );
        }

        const user = await getOrCreateUserWithAnalytics({
          phone,
          customerName,
          businessId,
          session,
        });

        if (isBillSplit) {
          await SplitBillTableSession.findOneAndUpdate(
            { _id: variantId },
            { billingUserId: user._id },
            { session },
          );
        } else {
          await UserSession.findOneAndUpdate(
            { businessId, tableName },
            { billingUserId: user._id },
            { session },
          );
        }

        return respond(c, "sucess", false, 200, {});
      });
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

        const userAnalytics = await UserAnalytic.findOneAndUpdate({
          userId: userData._id,
          businessId: tableData.businessId,
        });

        if (!userAnalytics) {
          const createAnalytics = new UserAnalytic({
            avgSpend: 0,
            totalSpend: 0,
            totalOrders: 0,
            userId: userData._id,
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
        if (active === true) {
          await Dish.updateMany(
            {
              businessId: updateBusinessPosConfig.businessId,
            },
            {
              $set: {
                pos: true,
              },
            },
          );
          await AddOn.updateMany(
            {
              businessId: updateBusinessPosConfig.businessId,
            },
            {
              $set: {
                pos: true,
              },
            },
          );

          await Category.updateMany(
            {
              businessId: updateBusinessPosConfig.businessId,
            },
            {
              $set: {
                pos: true,
              },
            },
          );

          await Table.updateMany(
            {
              businessId: updateBusinessPosConfig.businessId,
            },
            {
              $set: {
                pos: true,
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
                pos: true,
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
                isPosEnabled: true,
                placeOrderButton: true,
                isPosSynced: true,
                posProgress: 1,
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
    // ubacMiddleware("print_bill"),
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
        variantId: z.string().min(1).max(200).optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName, generatedBy, variantId } =
          await c.req.json();

        const businessPosConfig = await BusinessPosConfig.findOne({
          businessId,
          isDeleted: false,
          active: true,
        });

        if (!businessPosConfig) {
          return respond(c, "Pos not found", true, 400, {});
        }

        const outLetInfo = await OutLetInfo.findOne({
          businessId,
        });

        const tableSession = await UserSession.findOne({
          businessId,
          tableName,
        }).populate({
          path: "billingUserId",
          select: "name phone",
        });

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        await Table.findOneAndUpdate(
          {
            businessId,
            name: tableName,
          },
          {
            $set: {
              isBillGenerated: true,
            },
          },
        );

        const billAlreadySplit = checkOriginBillIsSplit(tableSession);

        if (billAlreadySplit) {
          if (!variantId) {
            return respond(
              c,
              "variantId is required for split bill",
              true,
              400,
              {},
            );
          }

          const variant = await SplitBillTableSession.findById(
            variantId,
          ).populate({
            path: "billingUserId",
            select: "name phone",
          });
          if (!variant) {
            return respond(c, "Variant not found", true, 404, {});
          }

          const cartItems = variant.items as Item[];
          const billItems = groupSplitItemsByGST(cartItems);

          sendBillPrintEvent({
            tableName: tableName,
            businessId: businessId,
            customerName:
              variant.billingUserId?.name ||
              variant.customerName ||
              tableSession?.customerName ||
              "customer",
            customerPhone:
              variant.billingUserId?.name ||
              tableSession?.phoneNumbers?.[0] ||
              "customer",
            items: billItems,
            posRestName: businessPosConfig.restName,
            generatedBy:
              variant.billingUserId?.name ||
              tableSession?.billGeneratedBy ||
              generatedBy,
            date: Date.now(),
            serviceCharge: variant?.serviceCharge || 0,
            discount: variant?.discount || 0,
            tax: variant?.gst || 0,
            total: variant?.total || 0,
            billRequestId: variant?._id.toString() || "",
            subTotal: variant?.subTotal || 0,
            tips: variant?.tips || 0,
            claimedCoins: variant?.claimedCoins || 0,
            couponDiscount: variant?.couponDiscount || 0,
            gst: outLetInfo?.gst || "",
            address: outLetInfo?.address || "",
            fssai: outLetInfo?.fssai || "",
            billInvoiceNumber: variant?.billInvoice || 0,
          });
          return respond(c, "sucess", true, 200, {});
        }

        const KotOrders = (await KotOrder.find({
          tableName,
          businessId,
          settled: false,
          accepted: true,
        }).lean()) as KotOrderTypes[];

        const cartItems = KotOrders.flatMap((order) =>
          order.cart.filter((item) => !item.isDeleted),
        ) as Item[];

        const { totalDishTotal } = calculateBillTotals(KotOrders);

        if (!billAlreadySplit) {
          if (totalDishTotal !== tableSession.subTotal) {
            return respond(c, "please sync all kots", true, 401, {});
          }
        }

        const billItems = groupItemsByGST(cartItems);

        sendBillPrintEvent({
          tableName: tableName,
          businessId: businessId,
          customerName: tableSession?.billingUserId?.name || KotOrders[0].name,
          customerPhone:
            tableSession?.billingUserId?.phone || KotOrders[0].phone,
          items: billItems,
          posRestName: businessPosConfig.restName,
          generatedBy:
            tableSession.billingUserId?.name ||
            tableSession?.billGeneratedBy ||
            generatedBy,
          date: Date.now(),
          serviceCharge: tableSession?.serviceCharge || 0,
          discount: tableSession?.discount || 0,
          tax: tableSession?.gst || 0,
          total: tableSession?.total || 0,
          billRequestId: tableSession?._id.toString() || "",
          subTotal: tableSession?.subTotal || 0,
          tips: tableSession?.tips || 0,
          claimedCoins: tableSession?.claimedCoins || 0,
          couponDiscount: tableSession?.couponDiscount || 0,
          gst: outLetInfo?.gst || "",
          address: outLetInfo?.address || "",
          fssai: outLetInfo?.fssai || "",
          billInvoiceNumber: tableSession?.billInvoice || 0,
        });

        return respond(c, "sucess", true, 200, {});
      });
    },
  )

  .post(
    "/settle_bill_print",
    // ubacMiddleware("settle_bill_print"),
    zValidator(
      "json",
      z.object({
        orderId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { orderId } = await c.req.json();

        const payment = await Payment.findOne({
          order_id: orderId,
          "billItems.0": { $exists: true },
        }).populate({
          path: "userId",
          select: "name",
        });

        if (!payment) {
          return respond(c, "Payment not found", true, 404, {});
        }

        const businessPosConfig = await BusinessPosConfig.findOne({
          businessId: payment.businessId,
          isDeleted: false,
          active: true,
        });

        if (!businessPosConfig) {
          return respond(c, "Pos not found", true, 400, {});
        }

        const outLetInfo = await OutLetInfo.findOne({
          businessId: payment.businessId,
        });

        const cartItems = payment.billItems as Item[];

        const billItems = groupItemsByGST(cartItems);

        sendBillPrintEvent({
          tableName: payment.tableName,
          businessId: payment.businessId,
          customerName: payment.userId.name || payment?.waiterName,
          customerPhone: payment.userId.phone || payment?.pin,
          items: billItems,
          posRestName: businessPosConfig.restName,
          generatedBy: payment.userId.name || payment?.waiterName,
          date: payment.date || Date.now(),
          serviceCharge: payment.serviceCharge || 0,
          discount: payment.discount || 0,
          tax: payment.tax || 0,
          total: payment.total || 0,
          billRequestId: payment?.posBillId || "",
          subTotal: payment?.billValue || 0,
          tips: payment?.tips || 0,
          claimedCoins: payment?.claimedCoins || 0,
          couponDiscount: payment?.couponDiscount || 0,
          gst: outLetInfo?.gst || "",
          address: outLetInfo?.address || "",

          fssai: outLetInfo?.fssai || "",
          billInvoiceNumber: payment?.billInvoice || 0,
        });

        return respond(c, "sucess", true, 200, {});
      });
    },
  )

  .post(
    "/add_discount",
    // ubacMiddleware("add_discount"),
    zValidator(
      "json",
      z
        .object({
          businessId: z.string().min(3).max(200),
          tableName: z.string().min(1).max(200),
          value: z.number().positive().min(1).max(100),
          reasonOfDiscount: z.string().min(1).max(100).optional(),
          discountAppliedOn: z.enum(["ON_BILL", "ON_DISH"]),
          itemIds: z.array(z.string().min(1).max(200)).optional(),
          discountAppliedBy: z.string().min(1).max(50),
          password: z.string().min(4).max(50).optional(),
          variantId: z.string().min(24).max(24).optional(),
        })
        .refine(
          (data) =>
            data.discountAppliedOn !== "ON_DISH" ||
            (Array.isArray(data.itemIds) && data.itemIds.length > 0),
          {
            message:
              "itemIds must be a non-empty array when discountAppliedOn is ON_DISH",
            path: ["itemIds"],
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
          itemIds,
          discountAppliedBy,
          password,
          variantId,
        } = await c.req.json();

        const tInfo = await Table.findOne({ businessId, name: tableName });

        if (!tInfo) {
          return respond(c, "Table not found", true, 404, {});
        }

        const isTableMerge = await MergeTable.findOne({
          businessId: businessId,
          childTableIds: tInfo._id.toString(),
        }).populate("parentTableId");

        if (password) {
          const passwordManager = await PasswordManager.findOne({
            businessId,
            name: "DISCOUNT",
            isActive: true,
            password: password,
          });

          if (!passwordManager) {
            return respond(
              c,
              "Please enter the correct discount password.",
              true,
              400,
              {},
            );
          }
        }

        let dishIdsArray: string[] = [];

        // Fetch the table session
        const tableSession = await UserSession.findOne({
          businessId,
          tableName: isTableMerge?.parentTableId?.name || tableName,
        }).session(session);
        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        const checkOriginBillIs = await checkOriginBillIsSplit(tableSession);

        if (checkOriginBillIs) {
          if (!variantId) {
            return respond(
              c,
              "variantId is required for split bill",
              true,
              400,
              {},
            );
          }
          const isPaid = await variantIsPaid(variantId);
          if (isPaid) {
            return respond(
              c,
              "You cannot apply discount on paid variant",
              true,
              400,
              {},
            );
          }

          const applyDiscount = await applyDiscountToVariantBill({
            variantId,
            value,
            discountAppliedOn,
            reasonOfDiscount,
            discountAppliedBy,
            itemIds,
            session,
          });

          if (!applyDiscount) {
            return respond(c, "Failed to apply discount", true, 400, {});
          }
          return respond(c, "Discount applied successfully", false, 200, {});
        }

        let discountAmount = 0;
        let newSubTotal = tableSession.subTotal;

        let itemGst = 0;
        let saveGstAfterDiscount = 0;

        if (discountAppliedOn === "ON_BILL") {
          const dis = Math.round((value / 100) * newSubTotal);

          // Calculate discount on the bill
          discountAmount = Math.min(
            dis,
            newSubTotal -
              tableSession.claimedCoins -
              tableSession.couponDiscount,
          );
          newSubTotal -= discountAmount;
        }

        if (discountAppliedOn === "ON_DISH") {
          // Calculate discount on selected dishes
          const kotOrder = (await KotOrder.find({
            "cart._id": { $in: itemIds },
            tableName: isTableMerge?.parentTableId?.name || tableName,
            businessId,
            settled: false,
            accepted: true,
          }).lean()) as KotOrderTypes[];

          const { totalDishTotal, totalGst, dishIds } = calculateBillDishIds(
            kotOrder,
            itemIds,
          );
          dishIdsArray = dishIds;

          const dishDis = Math.round((value / 100) * totalDishTotal);
          // discountAmount = Math.min(dishDis, totalDishTotal);
          discountAmount = Math.min(
            dishDis,
            tableSession.subTotal -
              tableSession.claimedCoins -
              tableSession.couponDiscount,
          );

          newSubTotal -= discountAmount;
          const cartItems = tableSession.items as CartItem[];

          const { itemGstAfterDiscount } = calculateItemUpdatedGstAfterDiscount(
            cartItems,
            Number(value.toFixed(2)),
            itemIds.length > 0 ? itemIds : [],
          );

          const { itemGstAfter } = calculateItemUpdated(
            cartItems,
            Math.min(
              100,
              tableSession.coinPercentage || tableSession.couponPercentage,
            ),
            itemIds.length > 0 ? itemIds : [],
          );

          saveGstAfterDiscount = itemGstAfterDiscount;

          if (value >= 100) {
            // itemGst = tableSession.totalGst - totalGst;
            itemGst = itemGstAfter;
          } else {
            itemGst = itemGstAfterDiscount + itemGstAfter;
          }
        }

        const totalDiscountPercenatge = Math.min(
          100,
          value + tableSession.coinPercentage + tableSession.couponPercentage,
        );

        const items = tableSession.items as CartItem[];

        // no work if discount applied on itemIds
        const { newGst } = calculateUpdatedGstAfterDiscount(
          items,
          Number(totalDiscountPercenatge.toFixed(2)),
          discountAppliedOn === "ON_DISH"
            ? itemIds && itemIds.length > 0
              ? itemIds
              : []
            : [],
          discountAppliedOn === "ON_DISH" ? itemGst : 0,
        );

        // Calculate final total
        const totalDis = calculateTotalDiscount(
          discountAmount,
          tableSession.claimedCoins,
          tableSession.couponDiscount,
        );
        const newTotal = calculateFinalTotal(
          tableSession.subTotal,
          totalDis,
          itemGst ? itemGst : newGst,
          tableSession.serviceCharge,
          tableSession.otherTax,
          tableSession.tips,
        );

        // Update session after applying the discount
        await updateTableSession(
          businessId,
          isTableMerge?.parentTableId?.name || tableName,
          session,
          {
            gst: itemGst
              ? Number(itemGst.toFixed(2))
              : Number(newGst.toFixed(2)),
            total: newTotal,
            reasonOfDiscount,
            discountAppliedOn,
            discountAppliedBy,
            isDiscountApplied: true,
            discountRemovedBy: null,
            discount: discountAmount,
            dishIds: dishIdsArray,
            discountPercentage:
              discountAppliedOn === "ON_BILL" ? Number(value.toFixed(2)) : 0,
            itemIds: itemIds ? itemIds : [],
            itemGst: itemGst ? Number(itemGst.toFixed(2)) : 0,
            itemGstAfterDiscount: Number(saveGstAfterDiscount.toFixed(2)),
          },
        );

        return respond(c, "Success", true, 200, {});
      });
    },
  )

  .post(
    "/add_coins",
    // ubacMiddleware("add_coins"),
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
        value: z.number().positive(),
        variantId: z.string().min(24).max(24).optional(),
        userId: z.string().min(24).max(24).optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName, value, variantId } = await c.req.json();

        const tInfo = await Table.findOne({ businessId, name: tableName });

        if (!tInfo) {
          return respond(c, "Table not found", true, 404, {});
        }

        const isTableMerge = await MergeTable.findOne({
          businessId: businessId,
          childTableIds: tInfo._id.toString(),
        }).populate("parentTableId");

        const tableSession = await UserSession.findOne({
          businessId,
          tableName: isTableMerge?.parentTableId?.name || tableName,
        }).session(session);

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

        const originBillIsSplit = await checkOriginBillIsSplit(tableSession);

        if (originBillIsSplit) {
          if (!variantId) {
            return respond(
              c,
              "variantId is required for split bill",
              true,
              400,
              {},
            );
          }

          const isPaid = await variantIsPaid(variantId);
          if (isPaid) {
            return respond(
              c,
              "You cannot apply coin on paid variant",
              true,
              400,
              {},
            );
          }

          const applyCoins = await applyCoinToVariantBill(
            variantId,
            value,
            session,
          );
          if (!applyCoins) {
            return respond(c, "Failed to apply coins", true, 400, {});
          }
          return respond(c, "Coins applied successfully", false, 200, {});
        }

        const coins = Math.min(
          value,
          tableSession.subTotal -
            tableSession.discount -
            tableSession.couponDiscount,
        );

        const totalDiscountPercenatge = Math.min(
          100,
          tableSession.discountPercentage +
            Number(((value / tableSession.subTotal) * 100).toFixed(2)) +
            tableSession.couponPercentage,
        );

        const items = tableSession.items as CartItem[];
        const { newGst } = calculateUpdatedGstAfterDiscount(
          items,
          Number(totalDiscountPercenatge.toFixed(2)),
          tableSession.itemIds || [],
          tableSession.itemGstAfterDiscount || 0,
        );

        const totalDis = calculateTotalDiscount(
          tableSession.discount,
          coins,
          tableSession.couponDiscount,
        );
        const newTotal = calculateFinalTotal(
          tableSession.subTotal,
          totalDis,
          newGst,
          tableSession.serviceCharge,
          tableSession.otherTax,
          tableSession.tips,
        );

        await updateTableSession(
          businessId,
          isTableMerge?.parentTableId?.name || tableName,
          session,
          {
            gst: Number(newGst.toFixed(2)),
            total: newTotal,
            isDiscountApplied: true,
            claimedCoins: coins,
            coinPercentage: Number(
              ((coins / tableSession.subTotal) * 100).toFixed(2),
            ),
          },
        );

        return respond(c, "Success", true, 200, {});
      });
    },
  )

  .post(
    "/add_coupon",
    // ubacMiddleware("add_coupon"),
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
        couponId: z.string().min(1).max(200),
        variantId: z.string().min(24).max(24).optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName, couponId, variantId } =
          await c.req.json();

        const tInfo = await Table.findOne({ businessId, name: tableName });

        if (!tInfo) {
          return respond(c, "Table not found", true, 404, {});
        }

        const isTableMerge = await MergeTable.findOne({
          businessId: businessId,
          childTableIds: tInfo._id.toString(),
        }).populate("parentTableId");

        const tableSession = await UserSession.findOne({
          businessId,
          tableName: isTableMerge?.parentTableId?.name || tableName,
        }).session(session);
        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        let couponDiscount = 0;

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

        const originBillIsSplit = await checkOriginBillIsSplit(tableSession);

        if (originBillIsSplit) {
          if (!variantId) {
            return respond(
              c,
              "variantId is required for split bill",
              true,
              400,
              {},
            );
          }
          const isPaid = await variantIsPaid(variantId);
          if (isPaid) {
            return respond(
              c,
              "You cannot apply coupon on paid variant",
              true,
              400,
              {},
            );
          }

          const applyCoupon = await applyCouponToVariantBill(
            variantId,
            couponId,
            session,
          );
          if (!applyCoupon) {
            return respond(c, "Failed to apply coupon", true, 400, {});
          }
          return respond(c, "Coupon applied successfully", false, 200, {});
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

        const totalDiscountPercenatge = Math.min(
          100,
          tableSession.discountPercentage +
            tableSession.coinPercentage +
            +Number(
              ((couponDiscount / tableSession.subTotal) * 100).toFixed(2),
            ),
        );

        const items = tableSession.items as CartItem[];
        const { newGst } = calculateUpdatedGstAfterDiscount(
          items,
          Number(totalDiscountPercenatge.toFixed(2)),
          tableSession.itemIds || [],
          tableSession.itemGstAfterDiscount || 0,
        );

        const totalDis = calculateTotalDiscount(
          tableSession.discount,
          tableSession.claimedCoins,
          couponDiscount,
        );
        const newTotal = calculateFinalTotal(
          tableSession.subTotal,
          totalDis,
          newGst,
          tableSession.serviceCharge,
          tableSession.otherTax,
          tableSession.tips,
        );

        await updateTableSession(
          businessId,
          isTableMerge?.parentTableId?.name || tableName,
          session,
          {
            gst: Number(newGst.toFixed(2)),
            total: newTotal,
            isDiscountApplied: true,
            couponDiscount: Number(couponDiscount.toFixed(2)),
            couponId,
            couponPercentage: Number(
              ((couponDiscount / tableSession.subTotal) * 100).toFixed(2),
            ),
          },
        );

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
        variantId: z.string().min(24).max(24).optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const {
          businessId,
          tableName,
          discountRemovedBy,
          reasonOfDiscount,
          variantId,
        } = await c.req.json();

        const tInfo = await Table.findOne({ businessId, name: tableName });

        if (!tInfo) {
          return respond(c, "Table not found", true, 404, {});
        }

        const isTableMerge = await MergeTable.findOne({
          businessId: businessId,
          childTableIds: tInfo._id.toString(),
        }).populate("parentTableId");

        const tableSession = await UserSession.findOne({
          businessId,
          tableName: isTableMerge?.parentTableId?.name || tableName,
        }).session(session);

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        const originBillIsSplit = await checkOriginBillIsSplit(tableSession);
        if (originBillIsSplit) {
          if (!variantId) {
            return respond(
              c,
              "variantId is required for split bill",
              true,
              400,
              {},
            );
          }

          const isPaid = await variantIsPaid(variantId);
          if (isPaid) {
            return respond(
              c,
              "You cannot apply discount on paid variant",
              true,
              400,
              {},
            );
          }

          const removeDiscount = await removeDiscountFromVariantBill(
            variantId.toString(),
            reasonOfDiscount,
            discountRemovedBy,
            session,
          );
          if (!removeDiscount) {
            return respond(c, "Failed to remove discount", true, 400, {});
          }
          return respond(c, "Discount removed successfully", false, 200, {});
        }

        const totalDiscountPercenatge = Math.min(
          100,
          0 + tableSession.coinPercentage + tableSession.couponPercentage,
        );

        const items = tableSession.items as CartItem[];
        const { newGst } = calculateUpdatedGstAfterDiscount(
          items,
          Number(totalDiscountPercenatge.toFixed(2)),
          [],
          0,
        );

        const totalDis = calculateTotalDiscount(
          0,
          tableSession.claimedCoins,
          tableSession.couponDiscount,
        );
        const newTotal = calculateFinalTotal(
          tableSession.subTotal,
          totalDis,
          newGst,
          tableSession.serviceCharge,
          tableSession.otherTax,
          tableSession.tips,
        );

        const isDiscountApplied =
          tableSession.claimedCoins > 0 || tableSession.couponDiscount > 0;

        await updateTableSession(
          businessId,
          isTableMerge?.parentTableId?.name || tableName,
          session,
          {
            gst: Number(newGst).toFixed(2),
            total: newTotal,
            reasonOfDiscount,
            isDiscountApplied,
            discount: 0,
            discountAppliedBy: null,
            discountRemovedBy,
            newDishGst: 0,
            discountPercentage: 0,
            itemIds: [],
            itemGst: 0,
          },
        );

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
        variantId: z.string().min(24).max(24).optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName, variantId } = await c.req.json();
        const tInfo = await Table.findOne({ businessId, name: tableName });

        if (!tInfo) {
          return respond(c, "Table not found", true, 404, {});
        }

        const isTableMerge = await MergeTable.findOne({
          businessId: businessId,
          childTableIds: tInfo._id.toString(),
        }).populate("parentTableId");

        const tableSession = await UserSession.findOne({
          businessId,
          tableName: isTableMerge?.parentTableId?.name || tableName,
        }).session(session);

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        const originBillIsSplit = await checkOriginBillIsSplit(tableSession);
        if (originBillIsSplit) {
          if (!variantId) {
            return respond(
              c,
              "variantId is required for split bill",
              true,
              400,
              {},
            );
          }

          const isPaid = await variantIsPaid(tableSession._id);
          if (isPaid) {
            return respond(
              c,
              "You cannot apply coupon on paid variant",
              true,
              400,
              {},
            );
          }

          const removeDiscount = await removeCoinFromVariantBill(
            variantId.toString(),

            session,
          );
          if (!removeDiscount) {
            return respond(c, "Failed to remove discount", true, 400, {});
          }
          return respond(c, "coins removed successfully", false, 200, {});
        }

        const isDiscountApplied =
          tableSession.discount > 0 || tableSession.couponDiscount > 0;

        const totalDiscountPercenatge = Math.min(
          100,
          tableSession.discountPercentage + 0 + tableSession.couponPercentage,
        );

        const items = tableSession.items as CartItem[];
        const { newGst } = calculateUpdatedGstAfterDiscount(
          items,
          Number(totalDiscountPercenatge.toFixed(2)),
          tableSession.itemIds || [],
          tableSession.itemGstAfterDiscount || 0,
        );

        const totalDis = calculateTotalDiscount(
          tableSession.discount,
          0,
          tableSession.couponDiscount,
        );
        const newTotal = calculateFinalTotal(
          tableSession.subTotal,
          totalDis,
          newGst,
          tableSession.serviceCharge,
          tableSession.otherTax,
          tableSession.tips,
        );

        await updateTableSession(
          businessId,
          isTableMerge?.parentTableId?.name || tableName,
          session,
          {
            gst: newGst.toFixed(2),
            total: newTotal,
            isDiscountApplied,
            claimedCoins: 0,
            coinPercentage: 0,
          },
        );

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
        variantId: z.string().min(24).max(24).optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName, variantId } = await c.req.json();
        const tInfo = await Table.findOne({ businessId, name: tableName });

        if (!tInfo) {
          return respond(c, "Table not found", true, 404, {});
        }

        const isTableMerge = await MergeTable.findOne({
          businessId: businessId,
          childTableIds: tInfo._id.toString(),
        }).populate("parentTableId");

        const tableSession = await UserSession.findOne({
          businessId,
          tableName: isTableMerge?.parentTableId?.name || tableName,
        }).session(session);

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        const originBillIsSplit = await checkOriginBillIsSplit(tableSession);
        if (originBillIsSplit) {
          if (!variantId) {
            return respond(
              c,
              "variantId is required for split bill",
              true,
              400,
              {},
            );
          }
          const isPaid = await variantIsPaid(variantId);
          if (isPaid) {
            return respond(
              c,
              "You cannot apply coupon on paid variant",
              true,
              400,
              {},
            );
          }

          const removeDiscount = await removeCouponFromVariantBill(
            variantId.toString(),

            session,
          );
          if (!removeDiscount) {
            return respond(c, "Failed to remove discount", true, 400, {});
          }
          return respond(c, "Discount removed successfully", false, 200, {});
        }

        const isDiscountApplied =
          tableSession.discount > 0 || tableSession.claimedCoins > 0;

        const totalDiscountPercenatge = Math.min(
          100,
          tableSession.discountPercentage + tableSession.coinPercentage + 0,
        );

        const items = tableSession.items as CartItem[];
        const { newGst } = calculateUpdatedGstAfterDiscount(
          items,
          Number(totalDiscountPercenatge.toFixed(2)),
          tableSession.itemIds || [],
          tableSession.itemGstAfterDiscount || 0,
        );

        const totalDis = calculateTotalDiscount(
          tableSession.discount,
          tableSession.claimedCoins,
          0,
        );
        const newTotal = calculateFinalTotal(
          tableSession.subTotal,
          totalDis,
          newGst,
          tableSession.serviceCharge,
          tableSession.otherTax,
          tableSession.tips,
        );

        await updateTableSession(
          businessId,
          isTableMerge?.parentTableId?.name || tableName,
          session,
          {
            gst: Number(newGst.toFixed(2)),
            total: newTotal,
            couponId: null,
            isDiscountApplied,
            couponDiscount: 0,
            couponPercentage: 0,
          },
        );

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
          tableSession.subTotal,
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
    // ubacMiddleware("add_or_remove_service_charge"),
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
        serviceChargeAppliedBy: z.string().min(1).max(50),
        variantId: z.string().length(24).optional(),
        value: z.number().positive().min(1).max(100).optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const {
          businessId,
          tableName,
          serviceChargeAppliedBy,
          variantId,
          value,
        } = await c.req.json();

        const tInfo = await Table.findOne({ businessId, name: tableName });

        if (!tInfo) {
          return respond(c, "Table not found", true, 404, {});
        }

        const isTableMerge = await MergeTable.findOne({
          businessId: businessId,
          childTableIds: tInfo._id.toString(),
        }).populate("parentTableId");

        const tableSession = await UserSession.findOne({
          businessId,
          tableName: isTableMerge?.parentTableId?.name || tableName,
        }).session(session);

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        const originBillIsSplit = await checkOriginBillIsSplit(tableSession);

        if (originBillIsSplit) {
          if (!variantId) {
            return respond(
              c,
              "variantId is required for split bill",
              true,
              400,
              {},
            );
          }

          const variantIsPaid = await checkVariantIsPaid(tableSession._id);
          if (variantIsPaid) {
            return respond(
              c,
              "You cannot apply servicecharge on paid variant",
              true,
              400,
              {},
            );
          }

          await updateSplitTableSession(
            variantId,
            {
              serviceChargeAppliedBy,
              isServiceChargeRemoved: false,
              serviceChargeRemovedBy: null,
              ...(value ? { serviceChargePercentage: value } : {}),
            },
            session,
          );

          return respond(c, "Success", true, 200, {});
        }

        await updateTableSession(
          businessId,
          isTableMerge?.parentTableId?.name || tableName,
          session,
          {
            serviceChargeAppliedBy,
            isServiceChargeRemoved: false,
            serviceChargeRemovedBy: null,
            ...(value ? { serviceChargePercentage: value } : {}),
          },
        );

        return respond(c, "Success", true, 200, {});
      });
    },
  )

  .post(
    "/remove_service_charge",
    // ubacMiddleware("add_or_remove_service_charge"),
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
        serviceChargeRemovedBy: z.string().min(1).max(50),
        reasonOfServiceCharge: z.string().min(1).max(100).optional(),
        password: z.string().min(4).max(50).optional(),
        variantId: z.string().min(24).max(24).optional(),
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
          password,
          variantId,
        } = await c.req.json();

        const tInfo = await Table.findOne({ businessId, name: tableName });

        if (!tInfo) {
          return respond(c, "Table not found", true, 404, {});
        }

        const isTableMerge = await MergeTable.findOne({
          businessId: businessId,
          childTableIds: tInfo._id.toString(),
        }).populate("parentTableId");

        if (password) {
          const passwordManager = await PasswordManager.findOne({
            businessId,
            name: "SERVICE_CHARGE",
            isActive: true,
            password: password,
          });

          if (!passwordManager) {
            return respond(
              c,
              "Please enter the correct service charge removal password.",
              true,
              400,
              {},
            );
          }
        }

        const tableSession = await UserSession.findOne({
          businessId,
          tableName: isTableMerge?.parentTableId?.name || tableName,
        }).session(session);

        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        const originBillIsSplit = await checkOriginBillIsSplit(tableSession);
        if (originBillIsSplit) {
          if (!variantId) {
            return respond(
              c,
              "variantId is required for split bill",
              true,
              400,
              {},
            );
          }
          const variantIsPaid = await checkVariantIsPaid(tableSession._id);
          if (variantIsPaid) {
            return respond(
              c,
              "You cannot apply servicecharge on paid variant",
              true,
              400,
              {},
            );
          }

          const removeServiceChargeFromAllVariants =
            await SplitBillTableSession.updateMany(
              {
                originTableSessionId: tableSession._id.toString(),
              },
              {
                $set: {
                  serviceCharge: 0,
                  serviceChargeRemovedBy,
                  reasonOfServiceCharge,
                  isServiceChargeRemoved: true,
                  serviceChargeAppliedBy: null,
                  serviceChargePercentage: 0,
                },
              },
              {
                session,
              },
            );

          if (!removeServiceChargeFromAllVariants) {
            return respond(c, "Failed to remove service charge", true, 400, {});
          }
          return respond(
            c,
            "Service charge removed successfully",
            false,
            200,
            {},
          );
        }

        await UserSession.findOneAndUpdate(
          {
            businessId,
            tableName: isTableMerge?.parentTableId?.name || tableName,
          },
          {
            $set: {
              serviceCharge: 0,
              serviceChargeRemovedBy,
              reasonOfServiceCharge,
              isServiceChargeRemoved: true,
              serviceChargeAppliedBy: null,
              serviceChargePercentage: 0,
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

      const { businessId, tableName, settledBy } = await c.req.json();

      const tableSession = await UserSession.findOne({
        businessId,
        tableName,
      });

      if (!tableSession) {
        return respond(c, "Table session not found", true, 404, {});
      }

      const originBillIsSplit = await checkOriginBillIsSplit(tableSession);
      if (originBillIsSplit) {
        if (tableSession.variantsCounts > 1) {
          return respond(c, "Success", true, 200, {});
        }
      }

      const pos = await BusinessPosConfig.findOne({
        businessId,
        isDeleted: false,
        active: true,
      });

      if (!pos) {
        return respond(c, "Pos not found", true, 400, {});
      }

      if (pos.posName === "HIPAL_Z") {
        return respond(c, "Success", true, 200, {});
      }
      const unsettleTable = await UnsettleTable.find({
        businessId,
        restId: pos.restId,
        sync: false,
      });

      for (const table of unsettleTable) {
        const payload = {
          app_key: pos.accessKey,
          app_secret: pos.secretKey,
          access_token: pos.authToken,
          restID: pos.restId,
          pin: table?.pin,
          tableNo: table?.tableName,
        };

        const response = await axios.post(posApiPaths.requestBill, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (
          response.data.success === "1" &&
          response.data?.bill_request_id?.length > 2
        ) {
          const updateSettleTable = await UnsettleTable.findOneAndUpdate(
            { _id: table._id },
            {
              $set: {
                sync: true,
              },
            },
            { new: true },
          );
          const res = await axios.post(posApiPaths.settleTable, {
            app_key: pos.accessKey,
            app_secret: pos.secretKey,
            access_token: pos.authToken,
            restID: pos.restId,
            bill_request_id: response.data.bill_request_id,
            amount_paid: table?.total,
            pin: table?.pin,
          });
        }
      }

      const newPin = generateTenDigitCode();
      const registerUser = await axios.post(posApiPaths.registerUser, {
        app_key: pos.accessKey,
        app_secret: pos.secretKey,
        access_token: pos.authToken,
        restID: pos.restId,
        phone: newPin,
      });

      await UserSession.findOneAndUpdate(
        {
          tableName: tableName,
          businessId: businessId,
        },
        {
          $set: {
            pin: newPin,
          },
        },
        { new: true },
      );

      const kotOrders = (await KotOrder.find({
        tableName,
        settled: false,
        accepted: true,
        businessId,
        isSync: false,
      }).lean()) as KotOrderTypes[];

      const cartItems = kotOrders.flatMap((order) =>
        order.cart.filter((item) => !item.isDeleted),
      );

      if (kotOrders.length > 0) {
        const petpoojaCart = convertToPetpoojaCart(
          cartItems,
          pos.restId,
          tableSession?.customerName,
          tableSession?.pin,
          tableName,
          pos.accessKey,
          pos.secretKey,

          pos.authToken,
        );

        await KotOrder.updateMany(
          {
            tableName,
            settled: false,
            businessId,
            accepted: true,
          },
          {
            $set: {
              isSync: true,
            },
          },
        );

        await UserSession.findOneAndUpdate(
          {
            tableName,
            businessId,
          },
          {
            $set: {
              isUserRegistered: true,
              billRequest: true,
            },
          },
        );

        const saveKot = await axios.post(posApiPaths.saveKot, petpoojaCart);

        if (saveKot.data.success === "0") {
          return respond(c, "Error in saving kot", true, 400, {});
        }
      }

      return respond(c, "Success", true, 200, {});
    },
  )

  .post(
    "/add_tip",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
        value: z.number().positive(),
        variantId: z.string().min(24).max(24).optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName, value, variantId } = await c.req.json();

        const tInfo = await Table.findOne({ businessId, name: tableName });

        if (!tInfo) {
          return respond(c, "Table not found", true, 404, {});
        }

        const isTableMerge = await MergeTable.findOne({
          businessId: businessId,
          childTableIds: tInfo._id.toString(),
        }).populate("parentTableId");

        const tableSession = await UserSession.findOne({
          businessId,
          tableName: isTableMerge?.parentTableId?.name || tableName,
        }).session(session);

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

        const originBillIsSplit = await checkOriginBillIsSplit(tableSession);

        if (originBillIsSplit) {
          if (!variantId) {
            return respond(
              c,
              "variantId is required for split bill",
              true,
              400,
              {},
            );
          }

          const isPaid = await variantIsPaid(variantId);
          if (isPaid) {
            return respond(
              c,
              "You cannot apply tips on paid variant",
              true,
              400,
              {},
            );
          }

          await updateSplitTableSession(
            variantId,
            {
              tips: value,
            },
            session,
          );

          return respond(c, "Success", true, 200, {});
        }

        await UserSession.findOneAndUpdate(
          {
            businessId,
            tableName: isTableMerge?.parentTableId?.name || tableName,
          },
          {
            $set: {
              tips: value,
            },
          },
          { session, new: true },
        );

        return respond(c, "Success", true, 200, {});
      });
    },
  )

  .post(
    "/remove_tip",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
        variantId: z.string().min(24).max(24).optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, tableName, variantId } = await c.req.json();

        const tInfo = await Table.findOne({ businessId, name: tableName });

        if (!tInfo) {
          return respond(c, "Table not found", true, 404, {});
        }

        const isTableMerge = await MergeTable.findOne({
          businessId: businessId,
          childTableIds: tInfo._id.toString(),
        }).populate("parentTableId");

        const tableSession = await UserSession.findOne({
          businessId,
          tableName: isTableMerge?.parentTableId?.name || tableName,
        }).session(session);

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

        const originBillIsSplit = await checkOriginBillIsSplit(tableSession);
        if (originBillIsSplit) {
          if (!variantId) {
            return respond(
              c,
              "variantId is required for split bill",
              true,
              400,
              {},
            );
          }

          const isPaid = await variantIsPaid(variantId);
          if (isPaid) {
            return respond(
              c,
              "You cannot apply tips on paid variant",
              true,
              400,
              {},
            );
          }
          await SplitBillTableSession.findByIdAndUpdate(
            variantId,
            {
              $set: {
                tips: 0,
              },
            },
            { session, new: true },
          );

          return respond(c, "Success", true, 200, {});
        }

        await UserSession.findOneAndUpdate(
          {
            businessId,
            tableName: isTableMerge?.parentTableId?.name || tableName,
          },
          {
            $set: {
              tips: 0,
            },
          },
          { session, new: true },
        );

        return respond(c, "Success", true, 200, {});
      });
    },
  );

export default posRouter;
