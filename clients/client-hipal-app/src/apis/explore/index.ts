import { IBusinessData } from "@/components/types/businessData";
import { getTimeIn12HrFormat } from "@/components/utils/helpers";
import { paths } from "@/components/utils/paths";
import axios from "@/utils/axios";
import { set } from "lodash-es";
import { redirect } from 'next/navigation';

async function fetchBusinessData(businessId: string) {
	const objectIdRegex = /^[0-9a-fA-F]{24}$/;
	let bizId = businessId;

	if (!objectIdRegex.test(businessId)) {
		const response = await axios.get(`/v1/businesses/n/${businessId}`);
		console.log('response', response.data.data)
		bizId = response.data.data._id; 
	}
	if (!bizId) {
        redirect('/');
    }

	const settings = (await axios(paths.settings(bizId))) || {}
	
	const businessData = await axios(paths.businessData(bizId))
	const loyalty = await axios(paths.getLoyaltySettings(bizId)) || {}
	
	const data = {} as IBusinessData
	data["settings"] = settings?.data?.data[0] || {}
	data["business"] = businessData?.data?.data || {}
	data["loyalty"] = loyalty?.data?.data || {}
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