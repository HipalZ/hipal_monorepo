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
  },
  businessId: string,
) => {
  const ans = [];

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

    if (value !== undefined) {
      ans.push({
        type: "text",
        text: value,
      });
    }
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

export const calculateReward = async (
  exist: number,
  reward: number,
  limit: number,
) => {
  const total = exist + reward;
  const sum = Math.min(total, limit);
  const finalReward = Math.round(Math.abs(sum - exist));
  return { finalReward, curentBalance: sum };
};

//

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
  console.log("existingUser", existingUser);

  if (existingUser && existingLoyalty) {
    const coinsCalculated = await calculateReward(
      existingUser.rewards,
      coins,
      existingLoyalty?.rewardLimit as number,
    );

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

export const calculatedCashbackCoins = async (
  businessId: string,
  billValue: number,
  claimedCoins: number,
  couponDiscount: number,
  discount: number,
  LoyaltySetting: LoyaltyType,
) => {
  if (!LoyaltySetting) {
    console.error("LoyaltySetting not found or setReward is not a number");
    return 0; // Or handle this case as appropriate for your application
  }
  const subTotal = billValue - claimedCoins - couponDiscount - discount;
  const coinsToBeAdded =
    (LoyaltySetting.setCashBackPercentage / 100) * subTotal;
  if (coinsToBeAdded < 0) {
    return 0;
  }
  return Math.round(coinsToBeAdded) || 0;
};
