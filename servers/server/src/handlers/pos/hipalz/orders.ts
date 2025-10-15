import {
  BusinessPosConfig,
  DuesUser,
  KotOrder,
  LoyaltySettings,
  NpcUser,
  Order,
  Payment,
  PaymentAlert,
  PendingDues,
  QrBill,
  SplitBillTableSession,
  Table,
  UpiMode,
  User,
  UserSession,
} from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import type { ClientSession } from "mongoose";
import { nanoid } from "nanoid";
import {
  addCoins,
  calculatedCashbackCoins,
  removeCoins,
} from "../../../routes/payments";
import { generateTenDigitCode } from "../../../routes/pos";
import { checkOriginBillIsSplit } from "../../../services/splitBill";
import { razorpayWrapper } from "../../../utils/razorpay-wrapper";

async function hipalzPosOfflineOrderHandler(payload: {
  businessId: string;
  variantId?: string;
  total: number;
  billValue: number;
  tips: number;
  claimedCoins: number;
  couponId: string;
  channelId: string;
  cashbackAvailable: boolean;
  currency: string;
  userId: string;
  tableName: string;
}) {
  try {
    const {
      businessId,
      variantId,
      total,
      billValue,
      tips,
      claimedCoins,
      couponId,
      channelId,
      cashbackAvailable,
      currency,
      userId,
      tableName,
    } = payload;
    const tableSession = await UserSession.findOne({
      tableName,
      businessId,
    });

    const orderAlreadyExist = await PaymentAlert.findOne({
      businessId,
      tableName,
      alertType: "OFFLINE",
      isAccepted: false,
    });

    if (orderAlreadyExist) throw new Error("Order is already in process");

    const businessPosConfig = await BusinessPosConfig.findOne({
      businessId,
      isDeleted: false,
      active: true,
    });

    if (businessPosConfig) {
      if (!tableSession) {
        throw new Error("Table session not found");
      }
      const originBillIsSplit = await checkOriginBillIsSplit(tableSession);

      if (originBillIsSplit) {
        if (!variantId) {
          throw new Error("variantId is required for split bill");
        }

        if (tableSession.variantsCounts > 1) {
          const splitBillTableSessionData =
            await SplitBillTableSession.findById(variantId);
          if (!splitBillTableSessionData) {
            throw new Error("Split bill session not found");
          }
          //@ts-ignore
          return runInTransaction(async (session: ClientSession) => {
            const uniqueOrderId = nanoid(15);

            const saveOrder = await Order.create(
              [
                {
                  total: splitBillTableSessionData?.total || total,
                  currency,
                  receipt: uniqueOrderId,
                  userId,
                  claimedCoins:
                    splitBillTableSessionData?.claimedCoins || claimedCoins,
                  tableName,
                  tips: splitBillTableSessionData?.tips || tips,
                  billValue: splitBillTableSessionData?.subTotal || billValue,
                  businessId,
                  order_id: uniqueOrderId,
                  couponId,
                  channelId,
                  cashbackAvailable,
                  date: Date.now(),
                  billId: splitBillTableSessionData?._id.toString(),
                  discount: splitBillTableSessionData?.discount,
                  couponDiscount: splitBillTableSessionData?.couponDiscount,
                  gst: splitBillTableSessionData?.gst,
                  variantId,
                },
              ],
              { session },
            );
            if (!saveOrder) throw new Error("Order not created");

            await PaymentAlert.create(
              [
                {
                  businessId: businessId,
                  userId: userId,
                  alertType: "OFFLINE",
                  order_id: saveOrder?.[0]._id,
                  status: "SUCCESS",
                  tableName: tableName,
                  coinsApplied: !!(
                    splitBillTableSessionData?.claimedCoins &&
                    splitBillTableSessionData.claimedCoins > 0
                  ),
                  message: `Paid ${total}`,
                  date: Date.now(),
                  billId: splitBillTableSessionData?._id.toString(),
                  mode: "OFFLINE",
                },
              ],
              { session },
            );

            return { order_id: saveOrder?.[0]._id };
          });
        }

        if (tableSession.variantsCounts === 1) {
          const splitBillTableSessionData =
            await SplitBillTableSession.findById(variantId);

          if (!splitBillTableSessionData) {
            throw new Error("Split bill session not found");
          }

          //@ts-ignore
          return runInTransaction(async (session: ClientSession) => {
            const uniqueOrderId = nanoid(15);

            const saveOrder = await Order.create(
              [
                {
                  total: splitBillTableSessionData?.total || total,
                  currency,
                  receipt: uniqueOrderId,
                  userId,
                  claimedCoins:
                    splitBillTableSessionData?.claimedCoins || claimedCoins,
                  tableName,
                  tips: splitBillTableSessionData?.tips || tips,
                  billValue: splitBillTableSessionData?.subTotal || billValue,
                  businessId,
                  order_id: uniqueOrderId,
                  couponId,
                  channelId,
                  cashbackAvailable,
                  date: Date.now(),
                  billId: splitBillTableSessionData?._id.toString(),
                  discount: splitBillTableSessionData?.discount,
                  couponDiscount: splitBillTableSessionData?.couponDiscount,
                  gst: splitBillTableSessionData?.gst,
                  variantId,
                },
              ],
              { session },
            );
            if (!saveOrder) throw new Error("Order not created");

            await PaymentAlert.create(
              [
                {
                  businessId: businessId,
                  userId: userId,
                  alertType: "OFFLINE",
                  order_id: saveOrder?.[0]._id,
                  status: "SUCCESS",
                  tableName: tableName,
                  coinsApplied: !!(
                    splitBillTableSessionData?.claimedCoins &&
                    splitBillTableSessionData.claimedCoins > 0
                  ),
                  message: `Paid ${total}`,
                  date: Date.now(),
                  billId: splitBillTableSessionData?._id.toString(),
                  mode: "OFFLINE",
                },
              ],
              { session },
            );

            return { order_id: saveOrder?.[0]._id };
          });
        }
      }

      const newPin = generateTenDigitCode();

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
    }

    //@ts-ignore
    return runInTransaction(async (session: ClientSession) => {
      const uniqueOrderId = nanoid(15);

      const saveOrder = await Order.create(
        [
          {
            total: tableSession?.total || total,
            currency,
            receipt: uniqueOrderId,
            userId,
            claimedCoins: tableSession?.claimedCoins || claimedCoins,
            tableName,
            tips: tableSession?.tips || tips,
            billValue: tableSession?.subTotal || billValue,
            businessId,
            order_id: uniqueOrderId,
            couponId,
            channelId,
            cashbackAvailable,
            date: Date.now(),
            billId: tableSession?._id.toString(),
            discount: tableSession?.discount,
            couponDiscount: tableSession?.couponDiscount,
            gst: tableSession?.gst,
          },
        ],
        { session },
      );
      if (!saveOrder) throw new Error("Order not created");

      await PaymentAlert.create(
        [
          {
            businessId: businessId,
            userId: userId,
            alertType: "OFFLINE",
            order_id: saveOrder?.[0]._id,
            status: "SUCCESS",
            tableName: tableName,
            coinsApplied: !!(
              tableSession?.claimedCoins && tableSession.claimedCoins > 0
            ),
            message: `Paid ${total}`,
            date: Date.now(),
            billId: tableSession?._id.toString(),
            mode: "OFFLINE",
          },
        ],
        { session },
      );

      return { order_id: saveOrder?.[0]._id };
    });
  } catch (error) {
    throw new Error((error as Error).message || "Internal error in POS order");
  }
}

async function hipalzPosOnlineOrderHandler(payload: {
  businessId: string;
  variantId?: string;
  total: number;
  billValue: number;
  tips: number;
  claimedCoins: number;
  couponId: string;
  channelId: string;
  cashbackAvailable: boolean;
  currency: string;
  userId: string;
  tableName: string;
  merchantId: string;
}) {
  try {
    const {
      businessId,
      variantId,
      total,
      billValue,
      tips,
      claimedCoins,
      couponId,
      channelId,
      cashbackAvailable,
      currency,
      userId,
      tableName,
      merchantId,
    } = payload;

    const tableSession = await UserSession.findOne({
      businessId,
      tableName,
    });

    const businessPosConfig = await BusinessPosConfig.findOne({
      businessId,
      isDeleted: false,
      active: true,
    });

    if (businessPosConfig) {
      if (!tableSession) {
        throw new Error("Table session not found");
      }

      const originBillIsSplit = await checkOriginBillIsSplit(tableSession);

      if (originBillIsSplit) {
        if (!variantId) {
          throw new Error("variantId is required for split bill");
        }

        if (tableSession.variantsCounts > 1) {
          const splitBillTableSession =
            await SplitBillTableSession.findById(variantId);

          if (!splitBillTableSession) {
            throw new Error("Split bill session not found");
          }

          //@ts-ignore
          return runInTransaction(async (session: ClientSession) => {
            const uniqueOrderId = nanoid(15);

            const client = await razorpayWrapper.getClient(merchantId);
            const response = await client.orders.create({
              amount: splitBillTableSession.total
                ? splitBillTableSession.total * 100
                : total * 100, // Fixed multiplication logic
              currency: currency,
              receipt: uniqueOrderId,
            });
            const saveOrder = await Order.create(
              [
                {
                  total: splitBillTableSession?.total || total,
                  currency,
                  billValue: splitBillTableSession?.subTotal || billValue,
                  businessId,
                  receipt: uniqueOrderId,
                  userId,
                  claimedCoins:
                    splitBillTableSession?.claimedCoins || claimedCoins,
                  tableName,
                  order_id: response.id,
                  tips: splitBillTableSession?.tips || tips,
                  couponId,
                  channelId,
                  cashbackAvailable,
                  date: Date.now(),
                  billId: splitBillTableSession?._id.toString(),
                  discount: splitBillTableSession?.discount,
                  couponDiscount: splitBillTableSession?.couponDiscount,
                  gst: splitBillTableSession?.gst,
                  variantId,
                },
              ],
              { session },
            );
            if (!saveOrder || !response) throw new Error("Order not created");

            return { order_id: response.id };
          });
        }

        if (tableSession.variantsCounts === 1) {
          const splitBillTableSession =
            await SplitBillTableSession.findById(variantId);

          if (!splitBillTableSession) {
            throw new Error("Split bill session not found");
          }

          //@ts-ignore
          return runInTransaction(async (session: ClientSession) => {
            const uniqueOrderId = nanoid(15);

            const client = await razorpayWrapper.getClient(merchantId);
            const response = await client.orders.create({
              amount: splitBillTableSession.total
                ? splitBillTableSession.total * 100
                : total * 100, // Fixed multiplication logic
              currency: currency,
              receipt: uniqueOrderId,
            });
            const saveOrder = await Order.create(
              [
                {
                  total: splitBillTableSession?.total || total,
                  currency,
                  billValue: splitBillTableSession?.subTotal || billValue,
                  businessId,
                  receipt: uniqueOrderId,
                  userId,
                  claimedCoins:
                    splitBillTableSession?.claimedCoins || claimedCoins,
                  tableName,
                  order_id: response.id,
                  tips: splitBillTableSession?.tips || tips,
                  couponId,
                  channelId,
                  cashbackAvailable,
                  date: Date.now(),
                  billId: splitBillTableSession?._id.toString(),
                  discount: splitBillTableSession?.discount,
                  couponDiscount: splitBillTableSession?.couponDiscount,
                  gst: splitBillTableSession?.gst,
                  variantId,
                },
              ],
              { session },
            );
            if (!saveOrder || !response) throw new Error("Order not created");

            return { order_id: response.id };
          });
        }
      }
    }

    //@ts-ignore
    return runInTransaction(async (session: ClientSession) => {
      const uniqueOrderId = nanoid(15);

      const client = await razorpayWrapper.getClient(merchantId);
      const response = await client.orders.create({
        amount: total * 100, // Fixed multiplication logic
        currency: currency,
        receipt: uniqueOrderId,
      });
      const saveOrder = await Order.create(
        [
          {
            total: tableSession?.total || total,
            currency,
            billValue: tableSession?.subTotal || billValue,
            businessId,
            receipt: uniqueOrderId,
            userId,
            claimedCoins: tableSession?.claimedCoins || claimedCoins,
            tableName,
            order_id: response.id,
            tips: tableSession?.tips || tips,
            couponId,
            channelId,
            cashbackAvailable,
            date: Date.now(),
            billId: tableSession?._id.toString(),
            discount: tableSession?.discount,
            couponDiscount: tableSession?.couponDiscount,
            gst: tableSession?.gst,
          },
        ],
        { session },
      );
      if (!saveOrder || !response) throw new Error("Order not created");

      return { order_id: response.id };
    });
  } catch (error) {
    throw new Error((error as Error).message || "Internal error in POS order");
  }
}

async function hipalzPosOfflineOrderAcceptHandler(payload: {
  businessId: string;
  alertId: string;
  comment?: string;
  waiterName?: string;
  settleModes: { _id: string; name: string; amount?: number }[];
  duesUserId?: string;
  npcUserId?: string;
}) {
  try {
    const {
      alertId,
      comment,
      waiterName,
      settleModes = [],
      duesUserId,
      npcUserId,
    } = payload;
    //@ts-ignore

    return runInTransaction(async (session: ClientSession) => {
      const alert = await PaymentAlert.findOne(
        { _id: alertId, isAccepted: false },
        null,
        { session },
      ).select("_id alertType isAccepted order_id businessId userId");

      if (!alert) {
        throw new Error("Alert not found or already accepted");
      }

      const existingLoyalty = await LoyaltySettings.findOne({
        businessId: alert.businessId,
        isActive: true,
      }).select("loyaltyId");

      if (alert.alertType !== "OFFLINE") {
        const updateAlert = await PaymentAlert.findByIdAndUpdate(
          alertId,
          { isAccepted: true, comment, waiterName },
          { new: true, session },
        );
        return true;
      }

      if (alert.alertType === "OFFLINE") {
        if (alert && !alert.isAccepted) {
          const order = await Order.findById(alert.order_id);

          const paymentMode = await UpiMode.findById(settleModes[0]._id);

          if (!paymentMode) {
            throw new Error("Payment mode not found");
          }

          if (order) {
            const isHavePos = await BusinessPosConfig.findOne({
              businessId: order.businessId,
              isDeleted: false,
              active: true,
            });

            const tableSession = await UserSession.findOne({
              businessId: order.businessId,
              tableName: order.tableName,
            });

            if (isHavePos) {
              if (!tableSession) {
                throw new Error("Table session not found");
              }
              const originBillIsSplit =
                await checkOriginBillIsSplit(tableSession);
              if (originBillIsSplit) {
                const splitBillTableSessionData =
                  await SplitBillTableSession.findById(order.variantId);
                if (!splitBillTableSessionData) {
                  throw new Error("Split bill session not found");
                }
                if (tableSession.variantsCounts > 1) {
                  const npcUser = await NpcUser.findById(npcUserId);
                  let finalCashBack = 0;
                  if (
                    paymentMode?.name !== "complementary" &&
                    paymentMode?.name !== "npc"
                  ) {
                    let cashBack = await calculatedCashbackCoins(
                      order.businessId.toString(),
                      Number(order.billValue),
                      Number(order.claimedCoins),
                      Number(order.couponDiscount),
                      Number(order.discount),
                    );

                    if (
                      existingLoyalty?.loyaltyId &&
                      order.claimedCoins > 0 &&
                      order.userId.toString()
                    ) {
                      await removeCoins(
                        Number(order?.claimedCoins),
                        order.tableName,
                        existingLoyalty?.loyaltyId?.toString() || "",
                        order._id.toString(),
                        order.userId.toString(),
                        session,
                      );
                      if (order.cashbackAvailable === false) {
                        cashBack = 0;
                      }
                    }

                    if (existingLoyalty?.loyaltyId && order.userId.toString()) {
                      finalCashBack = await addCoins(
                        cashBack,
                        order.userId.toString(),
                        order._id.toString(),
                        order.tableName || "",
                        order.businessId.toString(),
                        existingLoyalty?.loyaltyId.toString() || "",
                        session,
                      );
                      if (order.cashbackAvailable === false) {
                        cashBack = 0;
                      }
                    }
                  }
                  let modifyTotal = 0;
                  if (
                    paymentMode?.name === "npc" ||
                    paymentMode?.name === "dues" ||
                    paymentMode?.name === "complementary"
                  ) {
                    modifyTotal = 0;
                  } else {
                    modifyTotal = order.total;

                    if (settleModes.length > 1) {
                      for (const settle of settleModes) {
                        if (settle.name === "complementary") {
                          modifyTotal -= settle.amount ?? 0;
                        }
                      }
                    }
                  }
                  const createPayment = await Payment.create(
                    [
                      {
                        businessId: alert.businessId,
                        order_id: order?._id,
                        total:
                          paymentMode?.name === "npc" ||
                          paymentMode?.name === "complementary"
                            ? 0
                            : order?.total,
                        mode:
                          settleModes.length > 1 ? "split" : paymentMode?.name,
                        status: "SUCCESS",
                        paymentMode:
                          settleModes.length > 1 ? "split" : paymentMode?.name,
                        userId:
                          paymentMode?.name === "npc"
                            ? npcUser?.userId
                            : order?.userId,
                        claimedCoins:
                          paymentMode?.name === "npc" ||
                          paymentMode?.name === "complementary"
                            ? 0
                            : order?.claimedCoins,
                        billValue: order?.billValue,
                        tips: order?.tips,
                        tableName: order?.tableName,
                        earnCoins:
                          paymentMode?.name === "npc" ||
                          paymentMode?.name === "complementary"
                            ? 0
                            : finalCashBack,
                        razorpayEventId: nanoid(15),
                        razorpayOrderId: nanoid(15),
                        razorpayPaymentId: nanoid(15),
                        couponId: order?.couponId,
                        channelId: order?.channelId,
                        billId: splitBillTableSessionData?._id.toString(),
                        tax:
                          paymentMode?.name === "npc" ||
                          paymentMode?.name === "complementary"
                            ? 0
                            : splitBillTableSessionData?.gst,
                        serviceCharge:
                          paymentMode?.name === "npc" ||
                          paymentMode?.name === "complementary"
                            ? 0
                            : splitBillTableSessionData?.serviceCharge,
                        splitModes: settleModes,
                        waiterName,
                        date: Date.now(),
                        discount: splitBillTableSessionData?.discount,
                        couponDiscount:
                          splitBillTableSessionData?.couponDiscount,
                        billItems: splitBillTableSessionData?.items || [],
                        isSplitBillVariant: true,
                      },
                    ],
                    { session },
                  );

                  if (duesUserId && paymentMode?.name === "dues") {
                    await PendingDues.create(
                      [
                        {
                          billId: createPayment[0]._id,
                          businessId: order.businessId,
                          date: Date.now(),
                          duesUserId: duesUserId,
                          isSettled: false,
                        },
                      ],
                      {
                        session,
                      },
                    );

                    await DuesUser.findByIdAndUpdate(
                      duesUserId,
                      {
                        $inc: {
                          totalDuesAmount: order.total,
                        },
                      },
                      { session },
                    );
                  }

                  if (npcUserId && paymentMode?.name === "npc") {
                    await NpcUser.findByIdAndUpdate(
                      npcUserId,
                      {
                        $inc: {
                          totalNpcAmount: order.total,
                        },
                      },
                      { session },
                    );
                  }

                  await QrBill.findOneAndUpdate(
                    {
                      $or: [
                        {
                          billId: splitBillTableSessionData?._id?.toString(),
                        },
                      ],
                    },
                    {
                      $set: {
                        status: "SUCCESS",
                      },
                    },
                    {
                      session,
                    },
                  );

                  await SplitBillTableSession.findOneAndUpdate(
                    { _id: order.variantId },
                    {
                      $set: {
                        isPaid: true,
                      },
                    },
                    { new: true, session },
                  );

                  await UserSession.findOneAndUpdate(
                    {
                      businessId: order.businessId,
                      tableName: order.tableName,
                    },
                    {
                      $inc: {
                        variantsCounts: -1,
                      },
                    },
                    { session },
                  );

                  await PaymentAlert.findByIdAndUpdate(
                    alertId,
                    { isAccepted: true, comment, waiterName },
                    { new: true, session },
                  );

                  return true;
                }
                if (tableSession.variantsCounts === 1) {
                  const npcUser = await NpcUser.findById(npcUserId);

                  let finalCashBack = 0;
                  if (
                    paymentMode?.name !== "complementary" &&
                    paymentMode?.name !== "npc"
                  ) {
                    let cashBack = await calculatedCashbackCoins(
                      order.businessId.toString(),
                      Number(order.billValue),
                      Number(order.claimedCoins),
                      Number(order.couponDiscount),
                      Number(order.discount),
                    );

                    if (
                      existingLoyalty?.loyaltyId &&
                      order.claimedCoins > 0 &&
                      order.userId.toString()
                    ) {
                      await removeCoins(
                        Number(order?.claimedCoins),
                        order.tableName,
                        existingLoyalty?.loyaltyId?.toString() || "",
                        order._id.toString(),
                        order.userId.toString(),
                        session,
                      );
                      if (order.cashbackAvailable === false) {
                        cashBack = 0;
                      }
                    }

                    if (existingLoyalty?.loyaltyId && order.userId.toString()) {
                      finalCashBack = await addCoins(
                        cashBack,
                        order.userId.toString(),
                        order._id.toString(),
                        order.tableName || "",
                        order.businessId.toString(),
                        existingLoyalty?.loyaltyId.toString() || "",
                        session,
                      );
                      if (order.cashbackAvailable === false) {
                        cashBack = 0;
                      }
                    }

                    let modifyTotal = 0;
                    if (
                      paymentMode?.name === "npc" ||
                      paymentMode?.name === "dues" ||
                      paymentMode?.name === "complementary"
                    ) {
                      modifyTotal = 0;
                    } else {
                      modifyTotal = order.total;

                      if (settleModes.length > 1) {
                        for (const settle of settleModes) {
                          if (settle.name === "complementary") {
                            modifyTotal -= settle.amount ?? 0;
                          }
                        }
                      }
                    }
                    const createPayment = await Payment.create(
                      [
                        {
                          businessId: alert.businessId,
                          order_id: order?._id,
                          total:
                            paymentMode?.name === "npc" ||
                            paymentMode?.name === "complementary"
                              ? 0
                              : order?.total,
                          mode:
                            settleModes.length > 1
                              ? "split"
                              : paymentMode?.name,
                          status: "SUCCESS",
                          paymentMode:
                            settleModes.length > 1
                              ? "split"
                              : paymentMode?.name,
                          userId:
                            paymentMode?.name === "npc"
                              ? npcUser?.userId
                              : order?.userId,
                          claimedCoins:
                            paymentMode?.name === "npc" ||
                            paymentMode?.name === "complementary"
                              ? 0
                              : order?.claimedCoins,
                          billValue: order?.billValue,
                          tips: order?.tips,
                          tableName: order?.tableName,
                          earnCoins:
                            paymentMode?.name === "npc" ||
                            paymentMode?.name === "complementary"
                              ? 0
                              : finalCashBack,
                          razorpayEventId: nanoid(15),
                          razorpayOrderId: nanoid(15),
                          razorpayPaymentId: nanoid(15),
                          couponId: order?.couponId,
                          channelId: order?.channelId,
                          billId: splitBillTableSessionData?._id.toString(),
                          tax:
                            paymentMode?.name === "npc" ||
                            paymentMode?.name === "complementary"
                              ? 0
                              : splitBillTableSessionData?.gst,
                          serviceCharge:
                            paymentMode?.name === "npc" ||
                            paymentMode?.name === "complementary"
                              ? 0
                              : splitBillTableSessionData?.serviceCharge,
                          splitModes: settleModes,
                          waiterName,
                          date: Date.now(),
                          discount: splitBillTableSessionData?.discount,
                          couponDiscount:
                            splitBillTableSessionData?.couponDiscount,
                          billItems: splitBillTableSessionData?.items || [],
                          isSplitBillVariant: true,
                        },
                      ],
                      { session },
                    );

                    if (duesUserId && paymentMode?.name === "dues") {
                      await PendingDues.create(
                        [
                          {
                            billId: createPayment[0]._id,
                            businessId: order.businessId,
                            date: Date.now(),
                            duesUserId: duesUserId,
                            isSettled: false,
                          },
                        ],
                        {
                          session,
                        },
                      );

                      await DuesUser.findByIdAndUpdate(
                        duesUserId,
                        {
                          $inc: {
                            totalDuesAmount: order.total,
                          },
                        },
                        { session },
                      );
                    }

                    if (npcUserId && paymentMode?.name === "npc") {
                      await NpcUser.findByIdAndUpdate(
                        npcUserId,
                        {
                          $inc: {
                            totalNpcAmount: order.total,
                          },
                        },
                        { session },
                      );
                    }

                    await QrBill.findOneAndUpdate(
                      {
                        $or: [
                          {
                            billId: splitBillTableSessionData?._id?.toString(),
                          },
                        ],
                      },
                      {
                        $set: {
                          status: "SUCCESS",
                        },
                      },
                      {
                        session,
                      },
                    );

                    await SplitBillTableSession.findOneAndUpdate(
                      { _id: order.variantId },
                      {
                        $set: {
                          isPaid: true,
                        },
                      },
                      { new: true, session },
                    );

                    await UserSession.findOneAndUpdate(
                      {
                        businessId: order.businessId,
                        tableName: order.tableName,
                      },
                      {
                        $inc: {
                          variantsCounts: -1,
                        },
                      },
                      { session },
                    );

                    await PaymentAlert.findByIdAndUpdate(
                      alertId,
                      { isAccepted: true, comment, waiterName },
                      { new: true, session },
                    );
                  }
                }

                if (tableSession?.variantsCounts === 1) {
                  if (isHavePos) {
                    await KotOrder.updateMany(
                      {
                        tableName: order.tableName,
                        businessId: order.businessId,
                        settled: false,
                      },
                      {
                        $set: {
                          settled: true,
                        },
                      },
                      {
                        session,
                      },
                    );

                    await Table.findOneAndUpdate(
                      {
                        businessId: order.businessId,
                        name: order.tableName,
                      },
                      {
                        $set: {
                          status: "EMPTY",
                          currentTableAmount: 0,
                          userIds: [],
                          totalItemCount: 0,
                          capacity: 0,
                          hiCode: "",
                          isTransfer: false,
                          isMerged: false,
                          mergeTableIds: [],
                          mergedBy: null,
                        },
                      },
                      {
                        session,
                      },
                    );

                    await UserSession.deleteOne(
                      {
                        tableName: order.tableName,
                        businessId: order.businessId,
                      },
                      {
                        session,
                      },
                    );
                  }
                }
                return true;
              }
            }
            let finalCashBack = 0;
            if (
              paymentMode?.name !== "complementary" &&
              paymentMode?.name !== "npc"
            ) {
              let cashBack = await calculatedCashbackCoins(
                order.businessId.toString(),
                Number(order.billValue),
                Number(order.claimedCoins),
                Number(order.couponDiscount),
                Number(order.discount),
              );

              if (existingLoyalty?.loyaltyId && order.claimedCoins > 0) {
                await removeCoins(
                  Number(order?.claimedCoins),
                  order.tableName,
                  existingLoyalty?.loyaltyId?.toString() || "",
                  order._id.toString(),
                  order.userId.toString(),
                  session,
                );
                if (order.cashbackAvailable === false) {
                  cashBack = 0;
                }
              }

              finalCashBack = await addCoins(
                cashBack,
                order.userId.toString(),
                order._id.toString(),
                order.tableName || "",
                order.businessId.toString(),

                existingLoyalty?.loyaltyId.toString() || "",

                session,
              );
            }

            const npcUser = await NpcUser.findById(npcUserId);

            let modifyTotal = 0;
            if (
              paymentMode?.name === "npc" ||
              paymentMode?.name === "dues" ||
              paymentMode?.name === "complementary"
            ) {
              modifyTotal = 0;
            } else {
              modifyTotal = order.total;

              if (settleModes.length > 1) {
                for (const settle of settleModes) {
                  if (settle.name === "complementary") {
                    modifyTotal -= settle.amount ?? 0;
                  }
                }
              }
            }

            const createPayment = await Payment.create(
              [
                {
                  businessId: alert.businessId,
                  order_id: order?._id,
                  total:
                    paymentMode?.name === "npc" ||
                    paymentMode?.name === "complementary"
                      ? 0
                      : order?.total,
                  mode: settleModes.length > 1 ? "split" : paymentMode?.name,
                  status: "SUCCESS",
                  paymentMode:
                    settleModes.length > 1 ? "split" : paymentMode?.name,
                  userId:
                    paymentMode?.name === "npc"
                      ? npcUser?.userId
                      : order?.userId,
                  claimedCoins:
                    paymentMode?.name === "npc" ||
                    paymentMode?.name === "complementary"
                      ? 0
                      : order?.claimedCoins,
                  billValue: order?.billValue,
                  tips: order?.tips,
                  tableName: order?.tableName,
                  earnCoins:
                    paymentMode?.name === "npc" ||
                    paymentMode?.name === "complementary"
                      ? 0
                      : finalCashBack,
                  razorpayEventId: nanoid(15),
                  razorpayOrderId: nanoid(15),
                  razorpayPaymentId: nanoid(15),
                  couponId: order?.couponId,
                  channelId: order?.channelId,
                  billId: tableSession?._id.toString(),
                  tax:
                    paymentMode?.name === "npc" ||
                    paymentMode?.name === "complementary"
                      ? 0
                      : tableSession?.gst,
                  serviceCgarge:
                    paymentMode?.name === "npc" ||
                    paymentMode?.name === "complementary"
                      ? 0
                      : tableSession?.serviceCharge,
                  splitModes: settleModes,
                  waiterName,
                  date: Date.now(),
                  discount: tableSession?.discount || 0,
                  couponDiscount: tableSession?.couponDiscount || 0,
                  billItems: tableSession?.items || [],
                },
              ],
              { session },
            );

            if (duesUserId && paymentMode?.name === "dues") {
              await PendingDues.create(
                [
                  {
                    billId: createPayment[0]._id,
                    businessId: order.businessId,
                    date: Date.now(),
                    duesUserId: duesUserId,
                    isSettled: false,
                  },
                ],
                {
                  session,
                },
              );

              await DuesUser.findByIdAndUpdate(
                duesUserId,
                {
                  $inc: {
                    totalDuesAmount: order.total,
                  },
                },
                { session },
              );
            }

            if (npcUserId && paymentMode?.name === "npc") {
              await NpcUser.findByIdAndUpdate(
                npcUserId,
                {
                  $inc: {
                    totalNpcAmount: order.total,
                  },
                },
                { session },
              );
            }

            if (isHavePos) {
              await KotOrder.updateMany(
                {
                  tableName: order.tableName,
                  businessId: order.businessId,
                  settled: false,
                },
                {
                  $set: {
                    settled: true,
                  },
                },
                {
                  session,
                },
              );

              await Table.findOneAndUpdate(
                {
                  businessId: order.businessId,
                  name: order.tableName,
                },
                {
                  $set: {
                    status: "EMPTY",
                    currentTableAmount: 0,
                    userIds: [],
                    totalItemCount: 0,
                    capacity: 0,
                    hiCode: "",
                    isTransfer: false,
                    isMerged: false,
                    mergeTableIds: [],
                    mergedBy: null,
                  },
                },
                {
                  session,
                },
              );
              await QrBill.findOneAndUpdate(
                {
                  billId: tableSession?._id.toString(),
                },
                {
                  $set: {
                    status: "SUCCESS",
                  },
                },
                {
                  session,
                },
              );

              await UserSession.deleteOne(
                {
                  tableName: order.tableName,
                  businessId: order.businessId,
                },
                {
                  session,
                },
              );
            }
          }

          const updateAlert = await PaymentAlert.findByIdAndUpdate(
            alertId,
            { isAccepted: true, comment, waiterName },
            { new: true, session },
          );

          return true;
        }
      }
      throw new Error("Invalid alert type");
    });
  } catch (error) {
    throw new Error((error as Error).message || "Internal error in POS order");
  }
}

async function hipalzPosNormalSettleHandler(payload: {
  tableId: string;
  captainId: string;
  billId: string;
  settleModes: { _id: string; name: string; amount?: number }[];
  duesUserId?: string;
  npcUserId?: string;
  variantId?: string;
}) {
  try {
    const {
      tableId,
      captainId,
      billId,
      settleModes = [],
      duesUserId,
      npcUserId,
      variantId,
    } = payload;

    //@ts-ignore
    return runInTransaction(async (session: ClientSession) => {
      const paymentMode = await UpiMode.findById(settleModes[0]?._id);

      if (!paymentMode) {
        throw new Error("Payment mode not found");
      }

      const billAlreadySettled = await Payment.findOne({
        billId: variantId ? variantId : billId,
      });

      if (billAlreadySettled) {
        throw new Error("Bill already settled");
      }

      const table = await Table.findById(tableId);
      const tableSession = await UserSession.findOne({
        businessId: table?.businessId,
        tableName: table?.name,
      });
      const captain = await User.findById(captainId);

      if (!table || !tableSession || !captain) {
        throw new Error("Table or Captain not found");
      }

      const pos = await BusinessPosConfig.findOne({
        businessId: table?.businessId,
        isDeleted: false,
        active: true,
      });
      if (!pos) {
        throw new Error("Pos not found");
      }

      const npcUser = await NpcUser.findById(npcUserId);
      //no

      const originBillIsSplit = await checkOriginBillIsSplit(tableSession);
      if (originBillIsSplit) {
        if (!variantId) {
          throw new Error("variantId is required for split bill");
        }

        const splitTableSessionData =
          await SplitBillTableSession.findById(variantId);
        if (!splitTableSessionData) {
          throw new Error("Split table session not found");
        }

        if (tableSession.variantsCounts > 1) {
          const uniqueOrderId = nanoid(15);
          let modifyTotal = 0;
          if (
            paymentMode?.name === "npc" ||
            paymentMode?.name === "dues" ||
            paymentMode?.name === "complementary"
          ) {
            modifyTotal = 0;
          } else {
            modifyTotal = splitTableSessionData?.total || 0;

            if (settleModes.length > 1) {
              for (const settle of settleModes) {
                if (settle.name === "complementary") {
                  modifyTotal -= settle.amount ?? 0;
                }
              }
            }
          }

          const saveOrder = await Order.create(
            [
              {
                total:
                  paymentMode?.name === "npc" ||
                  paymentMode?.name === "complementary"
                    ? 0
                    : splitTableSessionData?.total || 0,
                currency: "INR",
                receipt: uniqueOrderId,
                userId:
                  paymentMode?.name === "npc"
                    ? npcUser?.userId
                    : splitTableSessionData?.customerIds?.[0] || captainId,
                claimedCoins: splitTableSessionData?.claimedCoins || 0,
                tableName: table?.name,
                tips: splitTableSessionData?.tips || 0,
                billValue: splitTableSessionData?.subTotal || 0,
                businessId: table?.businessId,
                order_id: uniqueOrderId,
                discount: splitTableSessionData?.discount || 0,
                couponDiscount: splitTableSessionData?.couponDiscount || 0,
                gst: splitTableSessionData?.gst || 0,

                date: Date.now(),
              },
            ],
            { session },
          );

          const createPayment = await Payment.create(
            [
              {
                businessId: table?.businessId,
                order_id: saveOrder[0]._id,
                total: saveOrder[0].total,
                mode: settleModes.length > 1 ? "split" : paymentMode?.name,
                status: "SUCCESS",
                paymentMode:
                  settleModes.length > 1 ? "split" : paymentMode?.name,
                userId: saveOrder[0].userId,
                claimedCoins: saveOrder[0].claimedCoins,
                billValue: saveOrder[0].billValue,
                tips: saveOrder[0].tips,
                tableName: saveOrder[0].tableName,
                earnCoins: 0,
                razorpayEventId: nanoid(15),
                razorpayOrderId: nanoid(15),
                razorpayPaymentId: nanoid(15),
                settleType: "NORMAL_SETTLE",
                comment: "NORMAL SETTLE",
                posBillId: splitTableSessionData?._id,
                tax:
                  paymentMode?.name === "npc" ||
                  paymentMode?.name === "complementary"
                    ? 0
                    : splitTableSessionData?.gst,
                serviceCharge:
                  paymentMode?.name === "npc" ||
                  paymentMode?.name === "complementary"
                    ? 0
                    : splitTableSessionData?.serviceCharge,

                waiterName: captain?.name,
                splitModes: settleModes,
                date: Date.now(),
                discount: splitTableSessionData?.discount,
                couponDiscount: tableSession?.couponDiscount,
                billId: splitTableSessionData?._id.toString(),
                billItems: splitTableSessionData?.items || [],
                isSplitBillVariant: true,
              },
            ],
            { session },
          );

          if (duesUserId && paymentMode?.name === "dues") {
            await PendingDues.create(
              [
                {
                  billId: createPayment[0]._id,
                  businessId: saveOrder[0].businessId,
                  date: Date.now(),
                  duesUserId: duesUserId,
                  isSettled: false,
                },
              ],
              {
                session,
              },
            );

            await DuesUser.findByIdAndUpdate(
              duesUserId,
              {
                $inc: {
                  totalDuesAmount: saveOrder[0].total,
                },
              },
              { session },
            );
          }
          if (npcUserId && paymentMode?.name === "npc") {
            await NpcUser.findByIdAndUpdate(
              npcUserId,
              {
                $inc: {
                  totalNpcAmount: saveOrder[0].billValue,
                },
              },
              { session },
            );
          }

          await PaymentAlert.updateOne(
            {
              tableName: table?.name,
              isAccepted: false,
              alertType: "OFFLINE",
              businessId: table?.businessId,
            },
            { isAccepted: true, isRejected: true },
            { session },
          );
          await PaymentAlert.create(
            [
              {
                businessId: saveOrder[0]?.businessId,
                alertType: "NORMAL_SETTLE",
                payment_id: createPayment[0]._id,
                coinsApplied: !!(
                  splitTableSessionData?.claimedCoins &&
                  splitTableSessionData?.claimedCoins > 0
                ),
                status: "SUCCESS",
                order_id: saveOrder[0]?._id,
                message: `Paid ${saveOrder[0]?.total}`,
                tableName: saveOrder[0]?.tableName,
                isAccepted: false,
                userId: saveOrder[0]?.userId,
                posDiscount: 0,
                date: Date.now(),
                mode: paymentMode?.name,
              },
            ],
            { session },
          );

          await SplitBillTableSession.updateOne(
            { _id: variantId },
            { $set: { isPaid: true } },
            { session },
          );
          await UserSession.findOneAndUpdate(
            {
              businessId: table?.businessId,
              tableName: table?.name,
            },
            {
              $inc: {
                variantsCounts: -1,
              },
            },
            { session },
          );
        }

        if (tableSession?.variantsCounts === 1) {
          //only cariant

          const splitTableSessionData =
            await SplitBillTableSession.findById(variantId);
          if (!splitTableSessionData) {
            throw new Error("Split table session not found");
          }
          const npcUser = await NpcUser.findById(npcUserId);

          const uniqueOrderId = nanoid(15);
          let modifyTotal = 0;
          if (
            paymentMode?.name === "npc" ||
            paymentMode?.name === "dues" ||
            paymentMode?.name === "complementary"
          ) {
            modifyTotal = 0;
          } else {
            modifyTotal = splitTableSessionData?.total || 0;

            if (settleModes.length > 1) {
              for (const settle of settleModes) {
                if (settle.name === "complementary") {
                  modifyTotal -= settle.amount ?? 0;
                }
              }
            }
          }

          const saveOrder = await Order.create(
            [
              {
                total:
                  paymentMode?.name === "npc" ||
                  paymentMode?.name === "complementary"
                    ? 0
                    : splitTableSessionData?.total || 0,
                currency: "INR",
                receipt: uniqueOrderId,
                userId:
                  paymentMode?.name === "npc"
                    ? npcUser?.userId
                    : splitTableSessionData?.customerIds?.[0] || captainId,
                claimedCoins: splitTableSessionData?.claimedCoins || 0,
                tableName: table?.name,
                tips: splitTableSessionData?.tips || 0,
                billValue: splitTableSessionData?.subTotal || 0,
                businessId: table?.businessId,
                order_id: uniqueOrderId,
                discount: splitTableSessionData?.discount || 0,
                couponDiscount: splitTableSessionData?.couponDiscount || 0,
                gst: splitTableSessionData?.gst || 0,

                date: Date.now(),
              },
            ],
            { session },
          );

          const createPayment = await Payment.create(
            [
              {
                businessId: table?.businessId,
                order_id: saveOrder[0]._id,
                total: saveOrder[0].total,
                mode: settleModes.length > 1 ? "split" : paymentMode?.name,
                status: "SUCCESS",
                paymentMode:
                  settleModes.length > 1 ? "split" : paymentMode?.name,
                userId: saveOrder[0].userId,
                claimedCoins: saveOrder[0].claimedCoins,
                billValue: saveOrder[0].billValue,
                tips: saveOrder[0].tips,
                tableName: saveOrder[0].tableName,
                earnCoins: 0,
                razorpayEventId: nanoid(15),
                razorpayOrderId: nanoid(15),
                razorpayPaymentId: nanoid(15),
                settleType: "NORMAL_SETTLE",
                comment: "NORMAL SETTLE",
                posBillId: splitTableSessionData?._id,
                tax:
                  paymentMode?.name === "npc" ||
                  paymentMode?.name === "complementary"
                    ? 0
                    : splitTableSessionData?.gst,
                serviceCharge:
                  paymentMode?.name === "npc" ||
                  paymentMode?.name === "complementary"
                    ? 0
                    : splitTableSessionData?.serviceCharge,

                waiterName: captain?.name,
                splitModes: settleModes,
                date: Date.now(),
                discount: splitTableSessionData?.discount,
                couponDiscount: splitTableSessionData?.couponDiscount,
                billId: splitTableSessionData?._id.toString(),
                billItems: splitTableSessionData?.items || [],
                isSplitBillVariant: true,
              },
            ],
            { session },
          );

          if (duesUserId && paymentMode?.name === "dues") {
            await PendingDues.create(
              [
                {
                  billId: createPayment[0]._id,
                  businessId: saveOrder[0].businessId,
                  date: Date.now(),
                  duesUserId: duesUserId,
                  isSettled: false,
                },
              ],
              {
                session,
              },
            );

            await DuesUser.findByIdAndUpdate(
              duesUserId,
              {
                $inc: {
                  totalDuesAmount: saveOrder[0].total,
                },
              },
              { session },
            );
          }
          if (npcUserId && paymentMode?.name === "npc") {
            await NpcUser.findByIdAndUpdate(
              npcUserId,
              {
                $inc: {
                  totalNpcAmount: saveOrder[0].billValue,
                },
              },
              { session },
            );
          }

          await PaymentAlert.updateOne(
            {
              tableName: table?.name,
              isAccepted: false,
              alertType: "OFFLINE",
              businessId: table?.businessId,
            },
            { isAccepted: true, isRejected: true },
            { session },
          );
          await PaymentAlert.create(
            [
              {
                businessId: saveOrder[0]?.businessId,
                alertType: "NORMAL_SETTLE",
                payment_id: createPayment[0]._id,
                coinsApplied: !!(
                  splitTableSessionData?.claimedCoins &&
                  splitTableSessionData?.claimedCoins > 0
                ),
                status: "SUCCESS",
                order_id: saveOrder[0]?._id,
                message: `Paid ${saveOrder[0]?.total}`,
                tableName: saveOrder[0]?.tableName,
                isAccepted: false,
                userId: saveOrder[0]?.userId,
                posDiscount: 0,
                date: Date.now(),
                mode: paymentMode?.name,
              },
            ],
            { session },
          );

          await SplitBillTableSession.updateOne(
            { _id: variantId },
            { $set: { isPaid: true } },
            { session },
          );

          await UserSession.findOneAndUpdate(
            {
              businessId: table?.businessId,
              tableName: table?.name,
            },
            {
              $inc: {
                variantsCounts: -1,
              },
            },
            { session },
          );
        }
        if (tableSession?.variantsCounts === 1) {
          await KotOrder.updateMany(
            {
              tableName: table?.name,
              settled: false,
              businessId: table?.businessId,
            },
            { $set: { settled: true } },
            { session },
          );

          let modifyTotal = 0;
          if (
            paymentMode?.name === "npc" ||
            paymentMode?.name === "dues" ||
            paymentMode?.name === "complementary"
          ) {
            modifyTotal = 0;
          } else {
            modifyTotal = tableSession?.total || 0;

            if (settleModes.length > 1) {
              for (const settle of settleModes) {
                if (settle.name === "complementary") {
                  modifyTotal -= settle.amount ?? 0;
                }
              }
            }
          }

          await Table.findByIdAndUpdate(
            tableId,
            {
              status: "EMPTY",
              capacity: 0,
              hiCode: "",
              currentTableAmount: 0,
              totalItemCount: 0,
              userIds: [],
              isTransfer: false,
              edited: false,
              isMerged: false,
              mergeTableIds: [],
              mergedBy: null,
            },
            { session },
          );

          await UserSession.deleteOne(
            {
              businessId: table?.businessId,
              tableName: table?.name,
            },
            { session },
          );
        }

        return true;
      }

      await KotOrder.updateMany(
        {
          tableName: table?.name,
          settled: false,
          businessId: table?.businessId,
        },
        { $set: { settled: true } },
        { session },
      );

      const uniqueOrderId = nanoid(15);

      let modifyTotal = 0;
      if (
        paymentMode?.name === "npc" ||
        paymentMode?.name === "dues" ||
        paymentMode?.name === "complementary"
      ) {
        modifyTotal = 0;
      } else {
        modifyTotal = tableSession?.total || 0;

        if (settleModes.length > 1) {
          for (const settle of settleModes) {
            if (settle.name === "complementary") {
              modifyTotal -= settle.amount ?? 0;
            }
          }
        }
      }

      const saveOrder = await Order.create(
        [
          {
            total:
              paymentMode?.name === "npc" ||
              paymentMode?.name === "complementary"
                ? 0
                : tableSession?.total || 0,
            currency: "INR",
            receipt: uniqueOrderId,
            userId:
              paymentMode?.name === "npc"
                ? npcUser?.userId
                : tableSession?.customerIds?.[0] || captainId,
            claimedCoins: tableSession?.claimedCoins || 0,
            tableName: table?.name,
            tips: tableSession?.tips || 0,
            billValue: tableSession?.subTotal || 0,
            businessId: table?.businessId,
            order_id: uniqueOrderId,
            discount: tableSession?.discount || 0,
            couponDiscount: tableSession?.couponDiscount || 0,
            gst: tableSession?.gst || 0,

            date: Date.now(),
          },
        ],
        { session },
      );

      const createPayment = await Payment.create(
        [
          {
            businessId: table?.businessId,
            order_id: saveOrder[0]._id,
            total: saveOrder[0].total,
            mode: settleModes.length > 1 ? "split" : paymentMode?.name,
            status: "SUCCESS",
            paymentMode: settleModes.length > 1 ? "split" : paymentMode?.name,
            userId: saveOrder[0].userId,
            claimedCoins: saveOrder[0].claimedCoins,
            billValue: saveOrder[0].billValue,
            tips: saveOrder[0].tips,
            tableName: saveOrder[0].tableName,
            earnCoins: 0,
            razorpayEventId: nanoid(15),
            razorpayOrderId: nanoid(15),
            razorpayPaymentId: nanoid(15),
            settleType: "NORMAL_SETTLE",
            comment: "NORMAL SETTLE",
            posBillId: tableSession?._id,
            tax:
              paymentMode?.name === "npc" ||
              paymentMode?.name === "complementary"
                ? 0
                : tableSession?.gst,
            serviceCharge:
              paymentMode?.name === "npc" ||
              paymentMode?.name === "complementary"
                ? 0
                : tableSession?.serviceCharge,

            waiterName: captain?.name,
            splitModes: settleModes,
            date: Date.now(),
            discount: tableSession?.discount,
            couponDiscount: tableSession?.couponDiscount,
            billId: tableSession?._id.toString(),
            billItems: tableSession?.items || [],
            pin: tableSession?.pin,
          },
        ],
        { session },
      );

      if (duesUserId && paymentMode?.name === "dues") {
        await PendingDues.create(
          [
            {
              billId: createPayment[0]._id,
              businessId: saveOrder[0].businessId,
              date: Date.now(),
              duesUserId: duesUserId,
              isSettled: false,
            },
          ],
          {
            session,
          },
        );

        await DuesUser.findByIdAndUpdate(
          duesUserId,
          {
            $inc: {
              totalDuesAmount: saveOrder[0].total,
            },
          },
          { session },
        );
      }
      if (npcUserId && paymentMode?.name === "npc") {
        await NpcUser.findByIdAndUpdate(
          npcUserId,
          {
            $inc: {
              totalNpcAmount: saveOrder[0].billValue,
            },
          },
          { session },
        );
      }
      await Table.findByIdAndUpdate(
        tableId,
        {
          status: "EMPTY",
          capacity: 0,
          hiCode: "",
          currentTableAmount: 0,
          totalItemCount: 0,
          userIds: [],
          isTransfer: false,
          edited: false,
          isMerged: false,
          mergeTableIds: [],
          mergedBy: null,
        },
        { session },
      );

      await UserSession.deleteOne(
        {
          businessId: table?.businessId,
          tableName: table?.name,
        },
        { session },
      );
      await PaymentAlert.updateOne(
        {
          tableName: table?.name,
          isAccepted: false,
          alertType: "OFFLINE",
          businessId: table?.businessId,
        },
        { isAccepted: true, isRejected: true },
        { session },
      );
      await PaymentAlert.create(
        [
          {
            businessId: saveOrder[0]?.businessId,
            alertType: "NORMAL_SETTLE",
            payment_id: createPayment[0]._id,
            coinsApplied: !!(
              tableSession?.claimedCoins && tableSession?.claimedCoins > 0
            ),
            status: "SUCCESS",
            order_id: saveOrder[0]?._id,
            message: `Paid ${saveOrder[0]?.total}`,
            tableName: saveOrder[0]?.tableName,
            isAccepted: false,
            userId: saveOrder[0]?.userId,
            posDiscount: 0,
            date: Date.now(),
            mode: paymentMode?.name,
          },
        ],
        { session },
      );

      return true;
    });
  } catch (error) {
    throw new Error((error as Error).message || "Internal error in POS order");
  }
}

export {
  hipalzPosNormalSettleHandler,
  hipalzPosOfflineOrderAcceptHandler,
  hipalzPosOfflineOrderHandler,
  hipalzPosOnlineOrderHandler,
};
