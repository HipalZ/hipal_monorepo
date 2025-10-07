import type { ILoyaltySetting } from "@/components/store/useLoyaltyData";
import type { IBanner, IUniquelyDishes } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { fetchCommonData } from "../commonApis";

async function fetchBusinessData(customLink: string) {
  const { data, bizId } = await fetchCommonData(customLink);

  const uniquelyDishesResponse = await apiRpc.dishes.uniquelyDishes[
    ":businessId"
  ].$get({
    param: {
      businessId: bizId,
    },
  });
  const loyaltyResponse = await apiRpc.businesses[":businessId"].loyalty.$get({
    param: {
      businessId: bizId,
    },
  });
  const bannersResponse = await apiRpc.settings.banners[":businessId"].$get({
    param: {
      businessId: bizId,
    },
    query: {
      isPublished: "true",
    },
  });

  const uniquelyDishes = await uniquelyDishesResponse.json();
  const loyalty = await loyaltyResponse.json();
  const banners = await bannersResponse.json();
  data["banners"] = banners?.data as unknown as IBanner[];
  data["uniquelyDishes"] = uniquelyDishes?.data as unknown as IUniquelyDishes[];
  data["loyalty"] = loyalty?.data as unknown as ILoyaltySetting;

  return data;
}

export const businessApis = {
  all: fetchBusinessData,
};

export async function fetchAllBusinessIds() {
  const res = await apiRpc.businesses.get.allbusiness.$get();
  const response = await res.json();
  return response?.data.map((business: { _id: string }) => business._id);
}
