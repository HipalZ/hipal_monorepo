import { getTimeIn12HrFormat } from "@/components/utils/helpers";
import { paths } from "@/components/utils/paths";
import axios from "@/utils/axios";
import { set } from "lodash-es";
import { fetchCommonData } from "../commonApis";
import { apiRpc } from "@hi/common";
import type { ILoyaltySetting } from "@/components/store/useLoyaltyData";

async function fetchBusinessData(customLink: string) {
	// common function has business and settings data
	const {data, bizId} = await fetchCommonData(customLink)

	const loyaltyResponse =  await apiRpc.businesses[":businessId"].loyalty.$get({
		param:{
			businessId: bizId
		}
	
	})
    const loyalty = await loyaltyResponse.json();
    data["loyalty"] = loyalty?.data as unknown as ILoyaltySetting;

	set(
		data,
		"settings.explore.openFrom",
		getTimeIn12HrFormat(data?.["settings"]?.explore?.openFrom || ""),
	)
	set(
		data,
		"settings.explore.openTill",
		getTimeIn12HrFormat(data?.["settings"]?.explore?.openTill || ""),
	)

	return data;
}

export const businessApis = {
	all: fetchBusinessData,
}

export async function fetchAllBusinessIds() {
	const response = await axios.get(paths.listAllBusiness());
	return response?.data?.data.map((business: { _id: string }) => business._id);
}