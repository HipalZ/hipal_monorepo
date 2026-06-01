import { OutLetInfo, User, UserReward, UserRewardHistory } from "@hi/db-models";
import type { LoyaltyType } from "@hi/db-models/src/validators";

const bodySequence = async (
  businessName: string,
  address: string,
  bodyvariblesequence: string[],
  customer: {
    name: string;
    phone: string;
    email?: string;
    variables?: Record<string, string>;
  },
  businessId: string,
) => {
  const ans = [];
  const perRow = customer?.variables ?? {};

  for (const variable of bodyvariblesequence) {
    let value: string | undefined;

    if (variable === "name") {
      value = customer?.name?.toString();
    } else if (variable === "phone") {
      value = customer?.phone?.toString();
    } else if (variable === "businessName") {
      value = businessName?.toString();
    } else if (variable === "address") {
      value = address?.toString();
    } else if (variable === "time") {
      value = new Date().toLocaleString();
    } else if (variable === "date") {
      value = new Date().toLocaleDateString("en-GB");
    } else if (variable === "email") {
      value = customer?.email?.toString();
    } else if (variable === "coins") {
      const user = await User.findOne({ phone: customer.phone });
      const userReward = await UserReward.findOne({
        userId: user?._id,
        loyaltyId: businessId,
      });
      value = userReward?.rewards?.toString();
    }

    // Fallback: per-row CSV columns. Lookup is exact-match on header.
    if (
      value === undefined &&
      Object.prototype.hasOwnProperty.call(perRow, variable)
    ) {
      value = perRow[variable];
    }

    // Always push (even empty) so positional `{{N}}` alignment is preserved.
    ans.push({
      type: "text",
      text: value ?? "",
    });
  }

  return ans;
};

export const returnBodyComponents = async (
  businessName: string,
  address: string,
  bodyVariableSequence: string[],
  mediaUrl: string,
  customer: {
    name: string;
    phone: string;
    email?: string;
    variables?: Record<string, string>;
  },
  businessId: string,
) => {
  // Resolve body parameters
  const parameters = await bodySequence(
    businessName,
    address,
    bodyVariableSequence,
    customer,
    businessId,
  );

  const components = [];

  if (mediaUrl) {
    const url = mediaUrl.toLowerCase();

    let headerParam: any = null;

    // 🎥 VIDEO (mp4)
    if (url.includes("mp4")) {
      headerParam = {
        type: "video",
        video: { link: mediaUrl },
      };
    }
    // 🎧 AUDIO (mp3)
    else if (url.includes("mp3")) {
      headerParam = {
        type: "audio",
        audio: { link: mediaUrl },
      };
    }
    // 📄 DOCUMENT (pdf/doc/xls)
    else if (
      url.includes("pdf") ||
      url.includes("doc") ||
      url.includes("docx") ||
      url.includes("xls") ||
      url.includes("xlsx")
    ) {
      headerParam = {
        type: "document",
        document: { link: mediaUrl },
      };
    } else if (
      url.includes("jpg") ||
      url.includes("jpeg") ||
      url.includes("png") ||
      url.includes("gif") ||
      url.includes("webp")
    ) {
      headerParam = {
        type: "image",
        image: { link: mediaUrl },
      };
    }

    if (headerParam) {
      components.push({
        type: "HEADER",
        parameters: [headerParam],
      });
    }
  }

  // BODY parameters
  components.push({
    type: "BODY",
    parameters,
  });

  return components;
};

export const calculateDiscount = async (
  businessId: string,
  totalBill: number,
  appliedCoins: number,
) => {
  const outLetInfo = await OutLetInfo.findOne({ businessId }).select(
    "serviceChargePercentage gstPercentage",
  );

  const billValue = totalBill; // bill value
  const serviceChargePercentage =
    (outLetInfo?.serviceChargePercentage || 0) / 100; // service charge
  const gstPercentage = (outLetInfo?.gstPercentage || 5) / 100; // tax charge
  const coins = appliedCoins; // coins
  const finalBillValue = billValue - coins;

  const estimatedSubTotal =
    billValue / (1 + gstPercentage + serviceChargePercentage);

  const discount = Math.round(
    Math.abs(
      finalBillValue / (1 + gstPercentage + serviceChargePercentage) -
        estimatedSubTotal,
    ),
  );

  return discount;
};

export const calculateReward = (
  exist: number,
  reward: number,
  limit: number,
) => {
  console.log("📥 Inputs -> exist:", exist, "reward:", reward, "limit:", limit);

  const total = (exist || 0) + (reward || 0);
  const cappedBalance = Math.min(total, limit || 0);
  const rawFinalReward = Math.abs(cappedBalance - (exist || 0));

  // 2. Apply your "0.5 Rule" (Math.round) only at the end
  // 14.3 -> 14 | 14.5 -> 15 | 14.6 -> 15
  const finalReward = Math.round(rawFinalReward);
  const curentBalance = Math.round(cappedBalance);

  console.log(
    "📤 Outputs -> finalReward:",
    finalReward,
    "curentBalance:",
    curentBalance,
  );

  return { finalReward, curentBalance };
};

export const addRewardHistory = async (
  status: string,
  tableName: string,
  loyaltyId: string,
  order_id: string,
  userId: string,
  addCoins: number,
) => {
  const data = await UserRewardHistory.create({
    userId: userId,
    rewards: addCoins,
    status: status,
    tableName,
    order_id,
    loyaltyId,
    date: Date.now(),
  });

  return data;
};
//
export const removeRewardHistory = async (
  status: string,
  tableName: string,
  loyaltyId: string,
  order_id: string,
  userId: string,
  addCoins: number,
) => {
  const data = await UserRewardHistory.create({
    userId: userId,
    rewards: addCoins || 0,
    status: status,
    tableName,
    order_id,
    loyaltyId,
    date: Date.now(),
  });

  return data;
};

export const removeCoins = async (
  claimedCoins: number,
  tableName: string,
  loyaltyId: string,
  order_id: string,
  userId: string,
) => {
  const existingUser = await UserReward.findOne({ userId, loyaltyId });
  if (existingUser && existingUser.rewards >= claimedCoins) {
    const updatedReward = await UserReward.findOneAndUpdate(
      { userId, loyaltyId },
      {
        $inc: { rewards: -claimedCoins },
      },
      { new: true },
    );

    await removeRewardHistory(
      "MINUS",
      tableName,
      loyaltyId,
      order_id,
      userId,
      claimedCoins,
    );

    return updatedReward;
  }
  return null;
};

export const addCoins = async (
  coins: number,
  userId: string,
  order_id: string,
  tableName: string,
  businessId: string,

  loyaltyId: string,
  existingLoyalty: LoyaltyType,
) => {
  const existingUser = await UserReward.findOne({ userId, loyaltyId });

  if (existingUser && existingLoyalty) {
    const coinsCalculated = await calculateReward(
      existingUser.rewards,
      coins,
      existingLoyalty?.rewardLimit as number,
    );
    console.log("coinsCalculated", coinsCalculated);
    await UserReward.findOneAndUpdate(
      { userId, loyaltyId },
      {
        $inc: { rewards: coinsCalculated.finalReward },
      },
      { new: true },
    );

    if (coinsCalculated.finalReward > 0) {
      await addRewardHistory(
        "PLUS",
        tableName,
        loyaltyId,
        order_id,
        userId,
        coinsCalculated.finalReward,
      );
    }

    return coinsCalculated.finalReward || 0;
  }
  return 0;
};

export const splitCalcCashbackCoins = async (
  businessId: string,
  billValue: number,
  claimedCoins: number,
  couponDiscount: number,
  discount: number,
  LoyaltySetting: LoyaltyType,
) => {
  if (!LoyaltySetting) {
    console.error("LoyaltySetting not found");
    return 0;
  }

  const subTotal =
    (billValue || 0) -
    (claimedCoins || 0) -
    (couponDiscount || 0) -
    (discount || 0);

  const rawCoins = (LoyaltySetting.setCashBackPercentage / 100) * subTotal;

  if (rawCoins < 0) return 0;

  // This snaps the final result to the nearest whole integer
  const finalReward = Math.round(rawCoins);

  console.log("Split Calculation Reward (Final):", finalReward);

  return finalReward || 0;
};
