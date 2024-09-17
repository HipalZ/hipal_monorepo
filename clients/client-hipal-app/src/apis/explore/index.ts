import type { ILoyaltySetting } from "@/components/store/useLoyaltyData";
import type {
  Coupon,
  IBanner,
  IUniquelyDishes,
} from "@/components/types/businessData";
import { getTimeIn12HrFormat } from "@/components/utils/helpers";
import { apiRpc } from "@hi/common";
import { set } from "lodash-es";
import { fetchCommonData } from "../commonApis";

async function fetchBusinessData(customLink: string) {
  // common function has business and settings data
  const { data, bizId } = await fetchCommonData(customLink);

  const outletInfoData = await apiRpc.businesses.outletInfo[":businessId"].$get(
    {
      param: {
        businessId: bizId,
      },
    },
  );
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

  const outletInfo = await outletInfoData.json();
  const uniquelyDishes = await uniquelyDishesResponse.json();
  const loyalty = await loyaltyResponse.json();
  const banners = await bannersResponse.json();
  data["outletInfo"] = outletInfo?.data;
  data["banners"] = banners?.data as unknown as IBanner[];
  data["uniquelyDishes"] = uniquelyDishes?.data as unknown as IUniquelyDishes[];
  data["loyalty"] = loyalty?.data as unknown as ILoyaltySetting;

  set(
    data,
    "settings.explore.openFrom",
    getTimeIn12HrFormat(data?.["settings"]?.explore?.openFrom || ""),
  );
  set(
    data,
    "settings.explore.openTill",
    getTimeIn12HrFormat(data?.["settings"]?.explore?.openTill || ""),
  );
  return data;
}

export const businessApis = {
  all: fetchBusinessData,
};

export async function fetchAllBusinessIds() {
  const res = await apiRpc.businesses.get.allbusiness.$get({});
  const response = await res.json();
  return response?.data.map((business: { _id: string }) => business._id);
}
