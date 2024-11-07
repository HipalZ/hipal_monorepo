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

  const outletInfo = await outletInfoData.json();
  data["outletInfo"] = outletInfo?.data;

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

export const termsApi = {
  all: fetchBusinessData,
};

export async function fetchAllBusinessIds() {
  const res = await apiRpc.businesses.get.allbusiness.$get({});
  const response = await res.json();
  return response?.data.map((business: { _id: string }) => business._id);
}
