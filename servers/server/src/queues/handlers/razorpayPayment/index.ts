import {
  BusinessPosConfig,
  KotOrder,
  LoyaltySettings,
  MergeTable,
  Order,
  Payment,
  PaymentAlert,
  QrBill,
  RazorpayWebhookQueueModel,
  SplitBillTableSession,
  Table,
  UnsettleTable,
  UserSession,
} from "@hi/db-models";
import type {
  BusinessPosConfigType,
  OrderType,
  UserSessionSchemaType,
} from "@hi/db-models/src/validators";
import axios from "axios";
import type { Job } from "bullmq";
import { nanoid } from "nanoid";

import { posApiPaths } from "../../config/petpoojaPos";
import { checkOriginBillIsSplit } from "../../services";
import type { RazorpayPaymentHandlerTypeValidator } from "../../types/jobtypes";
import {
  addCoins,
  calculatedCashbackCoins,
  removeCoins,
} from "../../utils/helper";

const popCornPaymentHandler = async (
  getOrder: OrderType,
  cashBack: number,
  mode: string,
  razorpayEventId: string,
  order_id: string,
  acquirer_data: unknown,
  razorpayPaymentId: string,
) => {
  const createPayment = await Payment.create({
    businessId: getOrder.businessId,
    total: getOrder?.total || 0,
    billValue: getOrder?.billValue || 0,
    mode: mode,
    userId: getOrder.userId,
    order_id: getOrder?._id,
    paymentMode: "online",
    tableName: getOrder.tableName,
    claimedCoins: getOrder?.claimedCoins || 0,
    tips: getOrder?.tips || 0,
    razorpayPaymentId: razorpayPaymentId || nanoid(15),
    razorpayOrderId: order_id || nanoid(15),
    razorpayAcquirerData: acquirer_data,
    razorpayEventId: razorpayEventId,
    couponId: getOrder?.couponId || null,
    channelId: getOrder?.channelId || null,
    earnCoins: cashBack,
    date: Date.now(),
    tax: getOrder?.gst || 0,
    serviceCharge: 0,
    billId: getOrder?._id?.toString(),
    settleType: "PAYMENT_GATEWAY",
    discount: getOrder?.discount || 0,
    couponDiscount: getOrder?.couponDiscount || 0,
    billItems: [],
  });

  await PaymentAlert.create({
    businessId: getOrder.businessId,
    alertType: "ONLINE",
    payment_id: createPayment._id,
    coinsApplied: getOrder.claimedCoins > 0,
    status: "SUCCESS",
    order_id: getOrder?._id,
    message: `Paid ${getOrder?.total}`,
    tableName: `${getOrder?.tableName}`,
    isAccepted: false,
    userId: getOrder.userId,
    date: Date.now(),
    mode: mode,
  });

  return true;
};

const failPaymentHandler = async (
  getOrder: OrderType,
  cashBack: number,
  mode: string,
  razorpayEventId: string,
  order_id: string,
  acquirer_data: unknown,
  razorpayPaymentId: string,
  errorDescription: string,
  errorReason: string,
  businessPosConfig: BusinessPosConfigType,
  tableSession: UserSessionSchemaType,
) => {
  const isSplit = tableSession.isSplit;
  if (!isSplit) {
    const alertExist = await PaymentAlert.findOne({
      order_id: getOrder?._id,
      status: "FAIL",
      alertType: "ONLINE",
    });

    if (!alertExist) {
      await PaymentAlert.create({
        errorReason: errorReason,
        errorDescription: errorDescription,
        businessId: getOrder?.businessId,
        alertType: "ONLINE",
        order_id: getOrder?._id,
        userId: getOrder?.userId,
        status: "FAIL",
        tableName: getOrder?.tableName,
        coinsApplied: tableSession?.claimedCoins || getOrder.claimedCoins > 0,
        isAccepted: false,
        date: Date.now(),
        message: `Fail ${getOrder?.total}`,
        couponId: getOrder?.couponId,
        mode: mode,
      });

      QrBill.findOneAndUpdate(
        { billId: tableSession?._id.toString() },
        { status: "FAILED" },
      );
      return true;
    }
    return true;
  }
  // Split Bill
  const splitTableSessionData = await SplitBillTableSession.findOne({
    _id: getOrder?.variantId,
  });

  const alertExist = await PaymentAlert.findOne({
    order_id: getOrder?._id,
    status: "FAIL",
    alertType: "ONLINE",
  });
  if (!alertExist) {
    await PaymentAlert.create({
      errorReason: errorReason,
      errorDescription: errorDescription,
      businessId: getOrder?.businessId,
      alertType: "ONLINE",
      order_id: getOrder?._id,
      userId: getOrder?.userId,
      status: "FAIL",
      tableName: getOrder?.tableName,
      coinsApplied:
        splitTableSessionData?.claimedCoins || getOrder.claimedCoins > 0,
      isAccepted: false,
      date: Date.now(),
      message: `Fail ${getOrder?.total}`,
      couponId: getOrder?.couponId,
      mode: mode,
    });

    QrBill.findOneAndUpdate(
      {
        $or: [{ billId: splitTableSessionData?._id?.toString() }],
      },
      { status: "FAILED" },
    );
    return true;
  }
  return true;
};

const petPoojaPosPaymentHandler = async (
  getOrder: OrderType,
  cashBack: number,
  mode: string,
  razorpayEventId: string,
  order_id: string,
  acquirer_data: unknown,
  razorpayPaymentId: string,
  pos: BusinessPosConfigType,
  errorReason: string | null,
  error_description: string | null,
  event: string | null,
) => {
  const tableSession = (await UserSession.findOne({
    businessId: getOrder?.businessId,
    tableName: getOrder?.tableName,
  })) as UserSessionSchemaType;

  const originBillIsSplit = await checkOriginBillIsSplit(tableSession);
  if (originBillIsSplit) {
    const res = await petPoojaPosSplitPaymentHandler(
      getOrder,
      cashBack,
      mode,
      razorpayEventId,
      order_id,
      acquirer_data,
      razorpayPaymentId,
      pos,
      originBillIsSplit,
      tableSession,
      event,
      errorReason,
      error_description,
    );
    return res;
  }

  const createPayment = await Payment.create({
    businessId: getOrder?.businessId,
    total: getOrder?.total,
    billValue: getOrder?.billValue,
    mode: mode,
    userId: getOrder?.userId,
    order_id: getOrder?._id,
    paymentMode: "online",
    tableName: getOrder?.tableName,
    claimedCoins: getOrder?.claimedCoins,
    tips: getOrder?.tips,
    razorpayPaymentId: razorpayPaymentId || nanoid(15),
    razorpayOrderId: order_id || nanoid(15),
    razorpayAcquirerData: acquirer_data,
    razorpayEventId: razorpayEventId,
    couponId: getOrder?.couponId || null,
    channelId: getOrder?.channelId || null,
    earnCoins: cashBack,
    date: Date.now(),
    tax: tableSession?.gst,
    serviceCharge: tableSession?.serviceCharge,
    billId: tableSession?._id?.toString(),
    settleType: tableSession?.settleType || "PAYMENT_GATEWAY",
    discount: tableSession?.discount,
    couponDiscount: tableSession?.couponDiscount,
    billItems: tableSession?.items || [],
    billInvoice: tableSession?.billInvoice || 0,
    paxCount: tableSession?.paxCount || 0,
  });

  await PaymentAlert.create({
    businessId: getOrder?.businessId,
    alertType: "ONLINE",
    payment_id: createPayment._id,
    coinsApplied: getOrder.claimedCoins > 0,
    status: "SUCCESS",
    order_id: getOrder?._id,
    message: `Paid ${getOrder?.total}`,
    tableName: `${getOrder?.tableName}`,
    isAccepted: false,
    userId: getOrder?.userId,
    date: Date.now(),
    mode: mode,
  });

  await QrBill.findOneAndUpdate(
    {
      billId: tableSession?._id?.toString(),
    },
    {
      $set: {
        status: "SUCCESS",
      },
    },
  );

  await UserSession.deleteOne({
    tableName: getOrder.tableName,
    businessId: getOrder.businessId,
  });

  await KotOrder.updateMany(
    {
      tableName: getOrder.tableName,
      businessId: getOrder.businessId,

      settled: false,
    },
    {
      $set: {
        settled: true,
      },
    },
  );

  const tableInfo = await Table.findOneAndUpdate(
    {
      businessId: getOrder.businessId,
      name: getOrder.tableName,
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
        isMerge: false,
        mergeTableIds: [],
        mergedBy: null,
        isBillGenerated: false,
      },
    },
  );

  await MergeTable.deleteOne({
    parentTableId: tableInfo?._id,
  });

  const pay = {
    app_key: pos.accessKey,
    app_secret: pos.secretKey,
    access_token: pos.authToken,
    restID: pos.restId,
    pin: tableSession?.pin,
    tableNo: getOrder.tableName,
  };
  setTimeout(() => {
    (async () => {
      try {
        // 1. Request the bill
        const {
          data: { bill_request_id },
        } = await axios.post(posApiPaths.requestBill, pay, {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Failed to request/settle bill:", err);
      }
    })();
  }, 12000);

  setTimeout(() => {
    (async () => {
      try {
        // 1. Request the bill
        const {
          data: { bill_request_id },
        } = await axios.post(posApiPaths.requestBill, pay, {
          headers: { "Content-Type": "application/json" },
        });

        // 2. Settle the table
        const { data: settleData } = await axios.post(posApiPaths.settleTable, {
          app_key: pos.accessKey,
          app_secret: pos.secretKey,
          access_token: pos.authToken,
          restID: pos.restId,
          bill_request_id,
          amount_paid: getOrder.total,
          pin: tableSession?.pin,
        });

        // 3. If settlement failed (success === "0"), upsert into UnsettleTable
        if (settleData.success === "0") {
          await UnsettleTable.findOneAndUpdate(
            {
              businessId: getOrder.businessId,
              tableName: getOrder.tableName,
              pin: tableSession?.pin,
            },
            {
              sync: false,
              // <-- use settleData.request_id, not response.data.request_id
              requestId: settleData.request_id,
              pin: tableSession?.pin,
              restId: pos.restId,
              date: Date.now(),
              total: getOrder.total,
            },
            { new: true, upsert: true },
          );
        }
        const unsettleTable = await UnsettleTable.find({
          businessId: getOrder.businessId,
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

          await axios.post(posApiPaths.requestBill, payload, {
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
      } catch (err) {
        console.error("Failed to request/settle bill:", err);
      }
    })();
  }, 35000);

  return true;
};

const hipalzPosPaymentHandler = async (
  getOrder: OrderType,
  cashBack: number,
  mode: string,
  razorpayEventId: string,
  order_id: string,
  acquirer_data: unknown,
  razorpayPaymentId: string,
  pos: BusinessPosConfigType,
  errorReason: string,
  error_description: string,
  event: string,
) => {
  const tInfo = await Table.findOne({
    businessId: getOrder.businessId,
    name: getOrder.tableName,
  });

  const isTableMerge = await MergeTable.findOne({
    businessId: getOrder.businessId,
    childTableIds: tInfo?._id?.toString(),
  }).populate("parentTableId");

  const tableSession = (await UserSession.findOne({
    businessId: getOrder.businessId,
    tableName: isTableMerge?.parentTableId?.name || getOrder.tableName,
  })) as UserSessionSchemaType;

  const originBillIsSplit = await checkOriginBillIsSplit(tableSession);
  if (originBillIsSplit) {
    const res = await hipalzPosSplitPaymentHandler(
      getOrder,
      cashBack,
      mode,
      razorpayEventId,
      order_id,
      acquirer_data,
      razorpayPaymentId,
      tableSession,
      event,
      errorReason,
      Boolean(isTableMerge),

      error_description,

      originBillIsSplit,
    );
    return true;
  }

  const createPayment = await Payment.create({
    businessId: getOrder.businessId,
    total: getOrder?.total || 0,
    billValue: getOrder?.billValue || 0,
    mode: mode,
    userId: getOrder?.userId,
    order_id: getOrder?._id,
    paymentMode: "online",
    tableName: isTableMerge?.parentTableId?.name || getOrder?.tableName,
    claimedCoins: getOrder?.claimedCoins || 0,
    tips: getOrder?.tips || 0,
    razorpayPaymentId: razorpayPaymentId || nanoid(15),
    razorpayOrderId: order_id || nanoid(15),
    razorpayAcquirerData: acquirer_data,
    razorpayEventId: razorpayEventId,
    couponId: getOrder?.couponId || null,
    channelId: getOrder?.channelId || null,
    earnCoins: cashBack,
    date: Date.now(),
    tax: tableSession?.gst || 0,
    serviceCharge: tableSession?.serviceCharge || 0,
    billId: tableSession?._id.toString(),
    settleType: tableSession?.settleType || "PAYMENT_GATEWAY",
    discount: tableSession?.discount || 0,
    couponDiscount: tableSession?.couponDiscount || 0,
    billItems: tableSession?.items || [],
    billInvoice: tableSession?.billInvoice || 0,
    paxCount: tableSession?.paxCount || 0,
  });

  await PaymentAlert.create({
    businessId: getOrder.businessId,
    alertType: "ONLINE",
    payment_id: createPayment._id,
    coinsApplied: getOrder.claimedCoins > 0,
    status: "SUCCESS",
    order_id: getOrder?._id,
    message: `Paid ${getOrder?.total}`,
    tableName: `${isTableMerge?.parentTableId?.name || getOrder?.tableName}`,
    isAccepted: false,
    userId: getOrder?.userId,
    date: Date.now(),
    mode: mode,
  });

  await QrBill.findOneAndUpdate(
    {
      billId: tableSession?._id.toString(),
    },
    {
      $set: {
        status: "SUCCESS",
      },
    },
  );

  await UserSession.deleteOne({
    tableName: isTableMerge?.parentTableId?.name || getOrder?.tableName,
    businessId: getOrder.businessId,
  });

  await KotOrder.updateMany(
    {
      tableName: isTableMerge?.parentTableId?.name || getOrder?.tableName,
      businessId: getOrder.businessId,

      settled: false,
    },
    {
      $set: {
        settled: true,
      },
    },
  );

  const tableInfo = await Table.findOneAndUpdate(
    {
      businessId: getOrder.businessId,
      name: isTableMerge?.parentTableId?.name || getOrder?.tableName,
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
        isMerge: false,
        mergeTableIds: [],
        mergedBy: null,
        isBillGenerated: false,
      },
    },
  );

  await MergeTable.deleteOne({
    parentTableId: tableInfo?._id,
  });

  return true;
};

const hipalzPosSplitPaymentHandler = async (
  getOrder: OrderType,
  cashBack: number,
  mode: string,
  razorpayEventId: string,
  order_id: string,
  acquirer_data: unknown,
  razorpayPaymentId: string,
  tableSession: UserSessionSchemaType,
  event: string,
  errorReason: string,
  isTableMerge: boolean,
  errorDescription: string,
  originBillIsSplit: boolean,
) => {
  if (originBillIsSplit) {
    const splitBillTableSessionData = await SplitBillTableSession.findOne({
      _id: getOrder?.variantId,
    });

    if (!splitBillTableSessionData) {
      return false;
    }

    if ((tableSession?.variantsCounts ?? 0) > 1) {
      const splitTableSessionData = await SplitBillTableSession.findOne({
        _id: getOrder?.variantId,
      });
      if (!splitTableSessionData) {
        return false;
      }

      await PaymentAlert.updateOne(
        {
          tableName: isTableMerge?.parentTableId?.name || getOrder?.tableName,
          isAccepted: false,
          alertType: "OFFLINE",
        },
        { isAccepted: true, isRejected: true },
      );

      const createPayment = await Payment.create({
        businessId: getOrder?.businessId,
        total: getOrder?.total || 0,
        billValue: getOrder?.billValue || 0,
        mode: mode,
        userId: getOrder?.userId,
        order_id: getOrder?._id,
        paymentMode: "online",
        tableName: isTableMerge?.parentTableId?.name || getOrder?.tableName,
        claimedCoins: getOrder?.claimedCoins || 0,
        tips: getOrder?.tips || 0,
        razorpayPaymentId: razorpayPaymentId,
        razorpayOrderId: order_id,
        razorpayAcquirerData: acquirer_data,
        razorpayEventId: razorpayEventId,
        couponId: getOrder?.couponId,
        channelId: getOrder?.channelId,
        earnCoins: cashBack,
        date: Date.now(),
        tax: splitBillTableSessionData?.gst || 0,
        serviceCharge: splitBillTableSessionData?.serviceCharge || 0,
        billId: splitBillTableSessionData?._id.toString(),
        settleType: splitBillTableSessionData?.settleType || "PAYMENT_GATEWAY",
        discount: splitBillTableSessionData?.discount || 0,
        couponDiscount: splitBillTableSessionData?.couponDiscount || 0,
        billItems: splitBillTableSessionData?.items || [],
        isSplitBillVariant: true,
        billInvoice: splitBillTableSessionData?.billInvoice,
        paxCount: tableSession?.paxCount || 0,
      });

      await PaymentAlert.create({
        businessId: getOrder?.businessId,
        alertType: "ONLINE",
        payment_id: createPayment._id,
        coinsApplied: getOrder.claimedCoins > 0,
        status: "SUCCESS",
        order_id: getOrder?._id,
        message: `Paid ${getOrder?.total}`,
        tableName: `${
          isTableMerge?.parentTableId?.name || getOrder?.tableName
        }`,
        isAccepted: false,
        userId: getOrder?.userId,
        date: Date.now(),
        mode: mode,
      });

      await SplitBillTableSession.findOneAndUpdate(
        { _id: getOrder?.variantId },
        {
          $set: {
            isPaid: true,
          },
        },
      );
      await UserSession.findOneAndUpdate(
        {
          tableName: isTableMerge?.parentTableId?.name || getOrder?.tableName,
          businessId: getOrder?.businessId,
        },
        {
          $inc: {
            variantsCounts: -1,
          },
        },
      );

      await QrBill.findOneAndUpdate(
        {
          $or: [{ billId: splitTableSessionData?._id?.toString() }],
        },
        { status: "SUCCESS" },
      );

      return true;
    }

    if ((tableSession?.variantsCounts ?? 0) === 1) {
      const splitTableSessionData = await SplitBillTableSession.findOne({
        _id: getOrder?.variantId,
      });
      if (!splitTableSessionData) {
        return false;
      }

      await PaymentAlert.updateOne(
        {
          tableName: isTableMerge?.parentTableId?.name || getOrder?.tableName,
          businessId: getOrder?.businessId,
          isAccepted: false,
          alertType: "OFFLINE",
        },
        { isAccepted: true, isRejected: true },
      );

      const createPayment = await Payment.create({
        businessId: getOrder?.businessId,
        total: getOrder?.total,
        billValue: getOrder?.billValue,
        mode: mode,
        userId: getOrder?.userId,
        order_id: getOrder?._id,
        paymentMode: "online",
        tableName: isTableMerge?.parentTableId?.name || getOrder?.tableName,
        claimedCoins: getOrder?.claimedCoins,
        tips: getOrder?.tips,
        razorpayPaymentId: razorpayPaymentId,
        razorpayOrderId: order_id,
        razorpayAcquirerData: acquirer_data,
        razorpayEventId: razorpayEventId,
        couponId: getOrder?.couponId,
        channelId: getOrder?.channelId,
        earnCoins: cashBack,
        date: Date.now(),
        tax: splitBillTableSessionData?.gst,
        serviceCharge: splitBillTableSessionData?.serviceCharge,
        billId: splitBillTableSessionData?._id.toString(),
        settleType: splitBillTableSessionData?.settleType || "PAYMENT_GATEWAY",
        discount: splitBillTableSessionData?.discount,
        couponDiscount: splitBillTableSessionData?.couponDiscount,
        billItems: splitBillTableSessionData?.items || [],
        isSplitBillVariant: true,
        billInvoice: splitBillTableSessionData?.billInvoice,
        paxCount: tableSession?.paxCount || 0,
      });

      await PaymentAlert.create([
        {
          businessId: getOrder?.businessId,
          alertType: "ONLINE",
          payment_id: createPayment._id,
          coinsApplied: getOrder.claimedCoins > 0,
          status: "SUCCESS",
          order_id: getOrder?._id,
          message: `Paid ${getOrder?.total}`,
          tableName: `${
            isTableMerge?.parentTableId?.name || getOrder?.tableName
          }`,
          isAccepted: false,
          userId: getOrder?.userId,
          date: Date.now(),
          mode: mode,
        },
      ]);

      await SplitBillTableSession.findOneAndUpdate(
        { _id: getOrder?.variantId },
        {
          $set: {
            isPaid: true,
          },
        },
      );
      await UserSession.findOneAndUpdate(
        {
          tableName: isTableMerge?.parentTableId?.name || getOrder?.tableName,
          businessId: getOrder?.businessId,
        },
        {
          $inc: {
            variantsCounts: -1,
          },
        },
      );

      await QrBill.findOneAndUpdate(
        {
          $or: [{ billId: splitTableSessionData?._id?.toString() }],
        },
        { status: "SUCCESS" },
      );
    }

    if ((tableSession?.variantsCounts ?? 0) === 1) {
      await UserSession.deleteOne({
        tableName: isTableMerge?.parentTableId?.name || getOrder.tableName,
        businessId: getOrder.businessId,
      });

      await KotOrder.updateMany(
        {
          tableName: isTableMerge?.parentTableId?.name || getOrder.tableName,
          businessId: getOrder.businessId,

          settled: false,
        },
        {
          $set: {
            settled: true,
          },
        },
      );

      const tableInfo = await Table.findOneAndUpdate(
        {
          businessId: getOrder.businessId,
          name: isTableMerge?.parentTableId?.name || getOrder?.tableName,
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
            isMerge: false,
            mergeTableIds: [],
            mergedBy: null,
            isBillGenerated: false,
          },
        },
      );

      await MergeTable.deleteOne({
        parentTableId: tableInfo?._id,
      });
    }

    return true;
  }

  return true;
};

const petPoojaPosSplitPaymentHandler = async (
  getOrder: OrderType,
  cashBack: number,
  mode: string,
  razorpayEventId: string,
  order_id: string,
  acquirer_data: unknown,
  razorpayPaymentId: string,
  pos: BusinessPosConfigType,
  originBillIsSplit: boolean,
  tableSession: UserSessionSchemaType | null,
  event: string | null,
  errorReason: string | null,
  errorDescription: string | null,
) => {
  if (originBillIsSplit) {
    const splitBillTableSessionData = await SplitBillTableSession.findOne({
      _id: getOrder?.variantId,
    });

    if (!splitBillTableSessionData) {
      return false;
    }

    if ((tableSession?.variantsCounts ?? 0) > 1) {
      const splitTableSessionData = await SplitBillTableSession.findOne({
        _id: getOrder?.variantId,
      });

      const createPayment = await Payment.create({
        businessId: getOrder?.businessId,
        total: getOrder?.total,
        billValue: getOrder?.billValue,
        mode: mode,
        userId: getOrder?.userId,
        order_id: getOrder?._id,
        paymentMode: "online",
        tableName: getOrder?.tableName,
        claimedCoins: getOrder?.claimedCoins,
        tips: getOrder?.tips,
        razorpayPaymentId: razorpayPaymentId,
        razorpayOrderId: order_id,
        razorpayAcquirerData: acquirer_data,
        razorpayEventId: razorpayEventId,
        couponId: getOrder?.couponId,
        channelId: getOrder?.channelId,
        earnCoins: cashBack,
        date: Date.now(),
        tax: splitBillTableSessionData?.gst,
        serviceCharge: splitBillTableSessionData?.serviceCharge,
        billId: splitBillTableSessionData?._id.toString(),
        settleType: splitBillTableSessionData?.settleType || "PAYMENT_GATEWAY",
        discount: splitBillTableSessionData?.discount,
        couponDiscount: splitBillTableSessionData?.couponDiscount,
        billItems: splitBillTableSessionData?.items || [],
        isSplitBillVariant: true,
        billInvoice: splitBillTableSessionData?.billInvoice,
        paxCount: tableSession?.paxCount || 0,
      });

      await PaymentAlert.create([
        {
          businessId: getOrder?.businessId,
          alertType: "ONLINE",
          payment_id: createPayment._id,
          coinsApplied: getOrder.claimedCoins > 0,
          status: "SUCCESS",
          order_id: getOrder?._id,
          message: `Paid ${getOrder?.total}`,
          tableName: `${getOrder?.tableName}`,
          isAccepted: false,
          userId: getOrder?.userId,
          date: Date.now(),
          mode: mode,
        },
      ]);

      await SplitBillTableSession.findOneAndUpdate(
        { _id: getOrder?.variantId },
        {
          $set: {
            isPaid: true,
          },
        },
      );
      await UserSession.findOneAndUpdate(
        {
          tableName: getOrder?.tableName,
          businessId: getOrder?.businessId,
        },
        {
          $inc: {
            variantsCounts: -1,
          },
        },
      );

      await QrBill.findOneAndUpdate(
        {
          $or: [{ billId: splitTableSessionData?._id?.toString() }],
        },
        { status: "SUCCESS" },
      );

      return true;
    }

    if ((tableSession?.variantsCounts ?? 0) === 1) {
      const splitTableSessionData = await SplitBillTableSession.findOne({
        _id: getOrder?.variantId,
      });
      if (!splitTableSessionData) {
        return false;
      }

      await PaymentAlert.updateOne(
        {
          tableName: getOrder?.tableName,
          businessId: getOrder?.businessId,
          isAccepted: false,
          alertType: "OFFLINE",
        },
        { isAccepted: true, isRejected: true },
      );

      const createPayment = await Payment.create({
        businessId: getOrder?.businessId,
        total: getOrder?.total,
        billValue: getOrder?.billValue,
        mode: mode,
        userId: getOrder?.userId,
        order_id: getOrder?._id,
        paymentMode: "online",
        tableName: getOrder?.tableName,
        claimedCoins: getOrder?.claimedCoins,
        tips: getOrder?.tips,
        razorpayPaymentId: razorpayPaymentId,
        razorpayOrderId: order_id,
        razorpayAcquirerData: acquirer_data,
        razorpayEventId: razorpayEventId,
        couponId: getOrder?.couponId,
        channelId: getOrder?.channelId,
        earnCoins: cashBack,
        date: Date.now(),
        tax: splitBillTableSessionData?.gst,
        serviceCharge: splitBillTableSessionData?.serviceCharge,
        billId: splitBillTableSessionData?._id.toString(),
        settleType: splitBillTableSessionData?.settleType || "PAYMENT_GATEWAY",
        discount: splitBillTableSessionData?.discount,
        couponDiscount: splitBillTableSessionData?.couponDiscount,
        billItems: splitBillTableSessionData?.items || [],
        isSplitBillVariant: true,
        billInvoice: splitBillTableSessionData?.billInvoice,
        paxCount: tableSession?.paxCount || 0,
      });

      await PaymentAlert.create([
        {
          businessId: getOrder?.businessId,
          alertType: "ONLINE",
          payment_id: createPayment._id,
          coinsApplied: getOrder.claimedCoins > 0,
          status: "SUCCESS",
          order_id: getOrder?._id,
          message: `Paid ${getOrder?.total}`,
          tableName: `T-${getOrder?.tableName?.slice(-2)}`,
          isAccepted: false,
          userId: getOrder?.userId,
          date: Date.now(),
          mode: mode,
        },
      ]);

      await SplitBillTableSession.findOneAndUpdate(
        { _id: getOrder?.variantId },
        {
          $set: {
            isPaid: true,
          },
        },
      );
      await UserSession.findOneAndUpdate(
        {
          tableName: getOrder?.tableName,
          businessId: getOrder?.businessId,
        },
        {
          $inc: {
            variantsCounts: -1,
          },
        },
      );

      await QrBill.findOneAndUpdate(
        {
          $or: [{ billId: splitTableSessionData?._id?.toString() }],
        },
        { status: "SUCCESS" },
      );
    }

    if ((tableSession?.variantsCounts ?? 0) === 1) {
      await UserSession.deleteOne({
        tableName: getOrder.tableName,
        businessId: getOrder.businessId,
      });

      await KotOrder.updateMany(
        {
          tableName: getOrder.tableName,
          businessId: getOrder.businessId,

          settled: false,
        },
        {
          $set: {
            settled: true,
          },
        },
      );

      const tableInfo = await Table.findOneAndUpdate(
        {
          businessId: getOrder.businessId,
          name: getOrder.tableName,
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
            isMerge: false,
            mergeTableIds: [],
            mergedBy: null,
            isBillGenerated: false,
          },
        },
      );

      await MergeTable.deleteOne({
        parentTableId: tableInfo?._id,
      });

      const pay = {
        app_key: pos.accessKey,
        app_secret: pos.secretKey,
        access_token: pos.authToken,
        restID: pos.restId,
        pin: tableSession?.pin,
        tableNo: getOrder.tableName,
      };
      setTimeout(() => {
        (async () => {
          try {
            // 1. Request the bill
            const {
              data: { bill_request_id },
            } = await axios.post(posApiPaths.requestBill, pay, {
              headers: { "Content-Type": "application/json" },
            });
          } catch (err) {
            console.error("Failed to request/settle bill:", err);
          }
        })();
      }, 12000);

      setTimeout(() => {
        (async () => {
          try {
            // 1. Request the bill
            const {
              data: { bill_request_id },
            } = await axios.post(posApiPaths.requestBill, pay, {
              headers: { "Content-Type": "application/json" },
            });

            // 2. Settle the table
            const { data: settleData } = await axios.post(
              posApiPaths.settleTable,
              {
                app_key: pos.accessKey,
                app_secret: pos.secretKey,
                access_token: pos.authToken,
                restID: pos.restId,
                bill_request_id,
                amount_paid: tableSession?.total,
                pin: tableSession?.pin,
              },
            );

            // 3. If settlement failed (success === "0"), upsert into UnsettleTable
            if (settleData.success === "0") {
              await UnsettleTable.findOneAndUpdate(
                {
                  businessId: getOrder.businessId,
                  tableName: getOrder.tableName,
                  pin: tableSession?.pin,
                },
                {
                  sync: false,
                  // <-- use settleData.request_id, not response.data.request_id
                  requestId: settleData.request_id,
                  pin: tableSession?.pin,
                  restId: pos.restId,
                  date: Date.now(),
                  total: tableSession?.total,
                },
                { new: true, upsert: true },
              );
            }
            const unsettleTable = await UnsettleTable.find({
              businessId: getOrder.businessId,
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

              await axios.post(posApiPaths.requestBill, payload, {
                headers: {
                  "Content-Type": "application/json",
                },
              });
            }
          } catch (err) {
            console.error("Failed to request/settle bill:", err);
          }
        })();
      }, 35000);
    }
  }

  return true;
};

const CommonPaymentHandler = async (getOrder: OrderType) => {
  await PaymentAlert.updateOne(
    {
      tableName: getOrder.tableName,
      businessId: getOrder.businessId,
      isAccepted: false,
      alertType: "OFFLINE",
    },
    { isAccepted: true, isRejected: true },
  );

  const loyaltySettings = await LoyaltySettings.findOne({
    businessId: getOrder.businessId,
  });

  let getCashBack = 0;

  if (loyaltySettings && getOrder?.userId?.toString()) {
    if (getOrder.claimedCoins > 0) {
      await removeCoins(
        getOrder.claimedCoins || 0,
        getOrder.tableName,
        loyaltySettings.loyaltyId,
        getOrder._id?.toString() || "",
        getOrder.userId.toString() || "",
      );
    }

    let cashBack = await calculatedCashbackCoins(
      getOrder?.businessId.toString(),
      getOrder?.billValue || 0,
      getOrder.claimedCoins,
      Number(getOrder.couponDiscount),
      Number(getOrder.discount),
      loyaltySettings,
    );

    if (getOrder?.cashbackAvailable === false) {
      cashBack = 0;
    }

    const cashBackCoins = await addCoins(
      cashBack,
      getOrder?.userId.toString() || "",
      getOrder?._id?.toString() || "",
      getOrder?.tableName,
      getOrder?.businessId.toString() || "",
      loyaltySettings.loyaltyId,
      loyaltySettings,
    );

    getCashBack = cashBackCoins;
  }

  return getCashBack || 0;
};

async function razorpayPaymentHandler(job: Job) {
  const {
    date,
    merchantId,
    razorpayEventId,
    order_id,
    id,
    event,

    status,
    acquirer_data,
    error_description,
    error_reason,
    mode,
  } = job.data as RazorpayPaymentHandlerTypeValidator;

  const getOrder = (await Order.findOne({
    order_id: order_id,
  })) as OrderType;

  const paymentAlreadyExist = await Payment.findOne({
    razorpayEventId: razorpayEventId,
  });

  if (event === "payment.captured") {
    if (getOrder && !paymentAlreadyExist) {
      const businessPosConfig = await BusinessPosConfig.findOne({
        businessId: getOrder.businessId,
        isDeleted: false,
        active: true,
      });
      const posName = businessPosConfig?.posName;

      try {
        const cashback = await CommonPaymentHandler(getOrder);
        if (!businessPosConfig) {
          console.log("posName", "pop");
          const res = await popCornPaymentHandler(
            getOrder,
            cashback,
            mode,
            razorpayEventId,
            order_id,
            acquirer_data,
            id,
          );
          await RazorpayWebhookQueueModel.updateOne(
            { razorpayEventId: razorpayEventId },
            { $set: { status: "SUCCESS" } },
          );
          return true;
        }
        if (posName === "HIPAL_Z") {
          const result = await hipalzPosPaymentHandler(
            getOrder,
            cashback,
            mode,
            razorpayEventId,
            order_id,
            acquirer_data,
            id,
            businessPosConfig,
            error_reason,
            error_description,
            event,
          );
          await RazorpayWebhookQueueModel.updateOne(
            { razorpayEventId: razorpayEventId },
            { $set: { status: "SUCCESS" } },
          );
          return true;
        }
        if (posName === "PETPOOJA") {
          const result = await petPoojaPosPaymentHandler(
            getOrder,
            cashback,
            mode,
            razorpayEventId,
            order_id,
            acquirer_data,
            id,
            businessPosConfig,
            error_reason,
            error_description,
            event,
          );
          await RazorpayWebhookQueueModel.updateOne(
            { razorpayEventId: razorpayEventId },
            { $set: { status: "SUCCESS" } },
          );
          return true;
        }

        return true;
      } catch (error) {
        await RazorpayWebhookQueueModel.updateOne(
          { razorpayEventId: razorpayEventId },
          {
            $set: {
              status: "FAILED",
              error_reason: error?.message,
              error_description: "db failed",
            },
          },
        );
      }
    }
    return true;
  }
  if (event === "payment.failed") {
    if (getOrder && !paymentAlreadyExist) {
      const businessPosConfig = (await BusinessPosConfig.findOne({
        businessId: getOrder.businessId,
        isDeleted: false,
        active: true,
      })) as BusinessPosConfigType;

      const tableSession = (await UserSession.findOne({
        businessId: getOrder.businessId,
        tableName: getOrder.tableName,
      })) as UserSessionSchemaType;

      await RazorpayWebhookQueueModel.updateOne(
        { razorpayEventId: razorpayEventId },
        {
          $set: {
            status: "FAILED",
            error_reason: error_reason,
            error_description: error_description,
          },
        },
      );

      try {
        const failedPayment = await failPaymentHandler(
          getOrder,
          0,
          mode,
          razorpayEventId,
          order_id,
          acquirer_data,
          id,
          error_description,
          error_reason,
          businessPosConfig,
          tableSession,
        );

        return true;
      } catch (error) {
        await RazorpayWebhookQueueModel.updateOne(
          { razorpayEventId: razorpayEventId },
          {
            $set: {
              status: "FAILED",
              error_reason: error?.message,
              error_description: "db failed",
            },
          },
        );
      }
    }
    return true;
  }
}

export const razorpayHandlers = {
  razorpayPaymentHandler,
};
