import { apiRpc } from "@hi/common";

interface IUserLoyaltyPayload {
  userId: string;
  businessId: string;
  loyaltyId: string;
}

export const getUserLoyaltyCoinz = async ({
  userId,
  businessId,
  loyaltyId,
}: IUserLoyaltyPayload) => {
  const res = await apiRpc.users[":businessId"].getUserReward.$get({
    param: {
      businessId: businessId,
    },
    query: {
      userId: userId,
      loyaltyId: loyaltyId,
    },
  });
  return res;
};
