import { paths } from "@/components/utils/paths";
import axios from "@/utils/axios";

async function fetchBusinessData(businessId: string) {
	const businessData = await axios(paths.businessNameLogo(businessId, 'nameLogo'))
    const settings = (await axios(paths.settings(businessId))) || {}
	const loyalty = await axios(paths.getLoyaltySettings(businessId)) || {}
	const data = {}
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