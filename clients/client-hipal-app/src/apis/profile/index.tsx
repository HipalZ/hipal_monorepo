import type { IBusinessData } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";

async function fetchBusinessData(businessId: string) {
	const response = await apiRpc.settings.$get({
		query:{
			businessId: businessId
		}
	})
	const settings = await response.json()
	const data = {} as IBusinessData
	data["settings"] = settings?.data[0] || {}
	return data;
}

export const profileApi = {
	all: fetchBusinessData,
}

export async function fetchAllBusinessIds() {
	const res = await apiRpc.businesses.get.allbusiness.$get({});
	const response = await res.json()
	return response?.data.map((business: { _id: string }) => business._id);
}