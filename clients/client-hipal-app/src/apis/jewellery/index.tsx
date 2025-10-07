import type { ILoyaltySetting } from "@/components/store/useLoyaltyData";
import type { IBanner } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { fetchCommonData } from "../commonApis";
import type { CategoryType } from "@hi/db-models/src/validators";

export async function fetchBusinessData(customLink: string) {
  const { data, bizId } = await fetchCommonData(customLink);

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

  const loyalty = await loyaltyResponse.json();
  const banners = await bannersResponse.json();
  data["banners"] = banners?.data as unknown as IBanner[];
  data["loyalty"] = loyalty?.data as unknown as ILoyaltySetting;

  return data;
}

export async function fetchAllBusinessIds() {
  const res = await apiRpc.businesses.get.allbusiness.$get();
  const response = await res.json();
  return response?.data.map((business: { _id: string }) => business._id);
}

export const getJewelleryData = async (customLink: string) => {
  const { data, bizId } = await fetchCommonData(customLink);

  const childCategoriesResponse = await apiRpc.jewellery.catalogues[
    ":businessId"
  ].dishes.$get({
    param: { businessId: bizId },
  });

  const childCategories = await childCategoriesResponse.json();
  data["childCategories"] =
    Array.isArray(childCategories?.data) && childCategories?.data.length > 0
      ? childCategories?.data
      : ([] as unknown as CategoryType[]);

  return data;
};
