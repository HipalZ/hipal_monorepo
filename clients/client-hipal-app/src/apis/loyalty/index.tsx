import { paths } from "@/components/utils/paths";
import axios from "@/utils/axios";
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
	return data;
}

export const loyaltyApis = {
	all: fetchBusinessData,
}

export async function fetchAllBusinessIds() {
	const response = await axios.get(paths.listAllBusiness());
	return response?.data?.data.map((business: { _id: string }) => business._id);
}