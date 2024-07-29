import { apiRpc } from "@hi/common";
import { fetchCommonData } from "../commonApis";
import type { ILoyaltySetting } from "@/components/store/useLoyaltyData";

async function fetchBusinessData(customLink: string) {
  // common function has business and settings data
  const { data, bizId } = await fetchCommonData(customLink);
  const loyaltyResponse = await apiRpc.businesses[":businessId"].loyalty.$get({
    param: {
      businessId: bizId,
    },
  });
  const loyalty = await loyaltyResponse.json();
  data["loyalty"] = loyalty?.data as unknown as ILoyaltySetting;
  return data;
}

export const loyaltyApis = {
  all: fetchBusinessData,
};

export async function fetchAllBusinessIds() {
  const res = await apiRpc.businesses.get.allbusiness.$get({});
  const response = await res.json();
  return response?.data.map((business: { _id: string }) => business._id);
}
