import { getTimeIn12HrFormat } from "@/components/utils/helpers";
import { set } from "lodash-es";
import { fetchCommonData } from "../commonApis";
import { useApiRpc } from "@hi/common";
import type { ILoyaltySetting } from "@/components/store/useLoyaltyData";

async function fetchBusinessData(customLink: string) {
	const apiRpc = useApiRpc();
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
	const apiRpc = useApiRpc();
	const res = await apiRpc.businesses.get.allbusiness.$get({

	});
	const response = await res.json()
	console.log('response', response)
	return response?.data.map((business: { _id: string }) => business._id);
}
