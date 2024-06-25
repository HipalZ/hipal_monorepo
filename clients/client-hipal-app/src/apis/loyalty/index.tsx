import { IBusinessData } from "@/components/types/businessData";
import { paths } from "@/components/utils/paths";
import axios from "@/utils/axios";
import { redirect } from 'next/navigation';

async function fetchBusinessData(businessId: string) {
	const objectIdRegex = /^[0-9a-fA-F]{24}$/;
	let bizId = businessId;
	if (!objectIdRegex.test(businessId)) {
		const response = await axios.get(`/v1/businesses/n/${businessId}`);
		bizId = response.data.data.businessId; 
	}
	if (!bizId) {
        redirect('/');
    }
	const businessData = await axios(paths.businessNameLogo(bizId, 'nameLogo'))
    const settings = (await axios(paths.settings(bizId))) || {}
	const loyalty = await axios(paths.getLoyaltySettings(bizId)) || {}
	const data = {} as IBusinessData
	data["settings"] = settings?.data?.data[0] || {}
	data["business"] = businessData?.data?.data || {}
	data["loyalty"] = loyalty?.data?.data || {}
	return data;
}

export const loyaltyApis = {
	all: fetchBusinessData,
}

export async function fetchAllBusinessIds() {
	const response = await axios.get(paths.listAllBusiness());
	return response?.data?.data.map((business: { _id: string }) => business._id);
}