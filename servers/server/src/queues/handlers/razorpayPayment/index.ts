import {
  KotOrder,
  LoyaltySettings,
  MergeTable,
  Order,
  Payment,
  PaymentAlert,
  QrBill,
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
import type { ClientSession } from "mongoose";
import { nanoid } from "nanoid";
import {
  addCoins,
  calculatedCashbackCoins,
  removeCoins,
} from "../../../routes/payments";
import { posApiPaths } from "../../../utils/posConfig/petPooja";
import type { RazorpayPaymentHandlerTypeValidator } from "../../types/jobtypes";

const popCornPaymentHandler = async (
  getOrder: OrderType,
  cashBack: number,
  session: ClientSession,
  mode: string,
  razorpayEventId: string,
  order_id: string,
  acquirer_data: unknown,
  razorpayPaymentId: string,
  tableSession: UserSessionSchemaType,
) => {
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
    billId: tableSession?._id.toString(),
    settleType: tableSession?.settleType || "PAYMENT_GATEWAY",
    discount: tableSession?.discount,
    couponDiscount: tableSession?.couponDiscount,
    billItems: tableSession?.items || [],
    billInvoice: tableSession?.billInvoice || 0,
    paxCount: tableSession?.paxCount || 0,
  });

  console.log("step_10");

  await PaymentAlert.create({
    businessId: getOrder?.businessId,
    alertType: "ONLINE",
    payment_id: createPayment._id,
    coinsApplied: getOrder.claimedCoins > 0,
    status: "SUCCESS",
    order_id: getOrder?._id,
    message: `Paid ${getOrder?.total}`,
    tableName: `${getOrder?.tableName?.slice(-2)}`,
    isAccepted: false,
    userId: getOrder?.userId,
    date: Date.now(),
    mode: mode,
  });

  return true;
};

const petPoojaPosPaymentHandler = async (
  getOrder: OrderType,
  cashBack: number,
  session: ClientSession,
  mode: string,
  razorpayEventId: string,
  order_id: string,
  acquirer_data: unknown,
  razorpayPaymentId: string,
  pos: BusinessPosConfigType,
) => {
  const tableSession = await UserSession.findOne({
    businessId: getOrder?.businessId,
    tableName: getOrder?.tableName,
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
    billId: tableSession?._id.toString(),
    settleType: tableSession?.settleType || "PAYMENT_GATEWAY",
    discount: tableSession?.discount,
    couponDiscount: tableSession?.couponDiscount,
    billItems: tableSession?.items || [],
    billInvoice: tableSession?.billInvoice || 0,
    paxCount: tableSession?.paxCount || 0,
  });

  console.log("step_10");

  await PaymentAlert.create({
    businessId: getOrder?.businessId,
    alertType: "ONLINE",
    payment_id: createPayment._id,
    coinsApplied: getOrder.claimedCoins > 0,
    status: "SUCCESS",
    order_id: getOrder?._id,
    message: `Paid ${getOrder?.total}`,
    tableName: `${getOrder?.tableName?.slice(-2)}`,
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
    {
      session,
    },
  );

  console.log("step_12");

  await UserSession.deleteOne(
    {
      tableName: getOrder.tableName,
      businessId: getOrder.businessId,
    },
    {
      session,
    },
  );

  console.log("step_13");

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
    {
      session,
    },
  );

  console.log("step_14");

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
    {
      session,
    },
  );

  await MergeTable.deleteOne(
    {
      parentTableId: tableInfo?._id,
    },
    {
      session,
    },
  );

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
  }, 10000);

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
  session: ClientSession,
  mode: string,
  razorpayEventId: string,
  order_id: string,
  acquirer_data: unknown,
  razorpayPaymentId: string,
  pos: BusinessPosConfigType,
) => {
  const tInfo = await Table.findOne({
    businessId: getOrder?.businessId,
    name: getOrder?.tableName,
  });

  const isTableMerge = await MergeTable.findOne({
    businessId: getOrder?.businessId,
    childTableIds: tInfo?._id?.toString(),
  }).populate("parentTableId");

  const tableSession = await UserSession.findOne({
    businessId: getOrder?.businessId,
    tableName: isTableMerge?.parentTableId?.name || getOrder?.tableName,
  });

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
    billId: tableSession?._id.toString(),
    settleType: tableSession?.settleType || "PAYMENT_GATEWAY",
    discount: tableSession?.discount,
    couponDiscount: tableSession?.couponDiscount,
    billItems: tableSession?.items || [],
    billInvoice: tableSession?.billInvoice || 0,
    paxCount: tableSession?.paxCount || 0,
  });

  console.log("step_10");

  await PaymentAlert.create(
    [
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
    ],
    { session },
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

  console.log("step_12");

  await UserSession.deleteOne(
    {
      tableName: isTableMerge?.parentTableId?.name || getOrder?.tableName,
      businessId: getOrder.businessId,
    },
    {
      session,
    },
  );

  console.log("step_13");

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
    {
      session,
    },
  );

  console.log("step_14");

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
    {
      session,
    },
  );

  await MergeTable.deleteOne(
    {
      parentTableId: tableInfo?._id,
    },
    {
      session,
    },
  );

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
    businessId: getOrder?.businessId,
  });

  let getCashBack = 0;

  if (loyaltySettings && getOrder?.userId?.toString()) {
    if (getOrder.claimedCoins > 0) {
      await removeCoins(
        getOrder.claimedCoins,
        getOrder.tableName,
        loyaltySettings.loyaltyId,
        getOrder._id || "",
        getOrder?.userId.toString() || "",
      );
    }

    let cashBack = await calculatedCashbackCoins(
      getOrder?.businessId.toString(),
      getOrder?.billValue || 0,
      getOrder.claimedCoins,
      Number(getOrder.couponDiscount),
      Number(getOrder.discount),
    );

    if (getOrder?.cashbackAvailable === false) {
      cashBack = 0;
    }

    const cashBackCoins = await addCoins(
      cashBack,
      getOrder?.userId.toString() || "",
      getOrder?._id.toString() || "",

      getOrder?.tableName,
      getOrder?.businessId.toString() || "",
      loyaltySettings.loyaltyId,
    );

    getCashBack = cashBackCoins;
  }

  return getCashBack;
};

async function razorpayPaymentHandler(job: Job) {
  const { merchantId, razorpayEventId, order_id, id, event, date, status,acquirer_data, error_description, error_reason,mode } = job.data as RazorpayPaymentHandlerTypeValidator;
    job.data as RazorpayPaymentHandlerTypeValidator;

  console.log("aa raha");
  console.log("merchantId", merchantId);
  console.log("razorpayEventId", razorpayEventId);
  console.log("order_id", order_id);
  console.log("id", id);
  console.log("event", event);
  console.log("date", date);
  console.log("status", status);

  const getOrder = (await Order.findOne({
    order_id: order_id,
  })) as OrderType;

  if (event === "payment.captured") {
    const paymentAlreadyExist = await Payment.findOne({
      razorpayEventId: razorpayEventId,
    });
    const cashback = await CommonPaymentHandler(getOrder);

    if (!paymentAlreadyExist && getOrder) {
      const res = await popCornPaymentHandler();
    }
  }
}

export const razorpayHandlers = {
  razorpayPaymentHandler,
};
