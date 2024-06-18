import { paths } from "@/components/utils/paths";
import axios from "@/utils/axios";

async function fetchBusinessData(businessId: string) {
    const settings = (await axios(paths.settings(businessId))) || {}
	const data = {}
	data["settings"] = settings?.data?.data[0] || {}
	return data;
}

export const profileApi = {
	all: fetchBusinessData,
}

export async function fetchAllBusinessIds() {
	const response = await axios.get(paths.listAllBusiness());
	return response?.data?.data.map((business: { _id: string }) => business._id);
}