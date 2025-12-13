import {
  MergeAndSplitBillInvoiceCounter,
  SplitBillTableSession,
  TableSessionCounter,
  UserSession,
} from "@hi/db-models";
import { checkOriginBillIsSplit } from "../splitBill";

const generateBillInvoice = async (
  tableName: string,
  businessId: string,
  settle: boolean,
) => {
  const tableSession = await UserSession.findOne({
    businessId,
    tableName,
  });
  if (!tableSession) {
    return 1;
  }

  const isAlreadySplit = await checkOriginBillIsSplit(tableSession);
  if (isAlreadySplit) {
    return 1;
  }

  const mergeAndSplitBillInvoiceCounter =
    await MergeAndSplitBillInvoiceCounter.find({
      businessId,
    });

  if (mergeAndSplitBillInvoiceCounter.length === 0) {
    await TableSessionCounter.findOneAndUpdate(
      {
        businessId,
        tableSessionId: tableSession._id.toString(),
      },
      {},

      { upsert: true },
    );
  }

  const sessionCount = await TableSessionCounter.countDocuments({
    businessId,
  });

  if (tableSession.billInvoice === 0) {
    await MergeAndSplitBillInvoiceCounter.deleteOne({
      businessId,
      billInvoice: mergeAndSplitBillInvoiceCounter[0]?.billInvoice,
    });
  }

  await UserSession.findOneAndUpdate(
    {
      businessId,
      tableName,
    },
    {
      $set: {
        ...(tableSession.billInvoice === 0 && {
          billInvoice:
            mergeAndSplitBillInvoiceCounter[0]?.billInvoice || sessionCount,
        }),
      },
    },
    { new: true },
  );

  return 1;
};

const generateSplitBillInvoice = async (
  variantId: string,
  businessId: string,
  settle: boolean,
) => {
  const splitTableSession = await SplitBillTableSession.findById(variantId);
  if (!splitTableSession) {
    return 1;
  }

  const originTableSession = await UserSession.findOne({
    businessId,
    tableName: splitTableSession.tableName,
  });

  if (!originTableSession) {
    return 1;
  }

  if (originTableSession.billInvoice > 0 && settle) {
    await MergeAndSplitBillInvoiceCounter.findOneAndUpdate(
      {
        businessId,
        billInvoice: originTableSession.billInvoice,
      },
      {},
      { upsert: true },
    );
  }

  await TableSessionCounter.findOneAndUpdate(
    {
      businessId,
      tableSessionId: variantId,
    },
    {},

    { upsert: true },
  );

  const sessionCount = await TableSessionCounter.countDocuments({
    businessId,
  });
  console.log("sessionCount", sessionCount);

  await SplitBillTableSession.findOneAndUpdate(
    {
      _id: variantId,
    },
    {
      $set: {
        ...(splitTableSession.billInvoice === 0 && {
          billInvoice: sessionCount,
        }),
      },
    },
    { new: true },
  );

  return 1;
};

export { generateBillInvoice, generateSplitBillInvoice };
