import { IBusinessData } from "@/components/types/businessData";
import { getTimeIn12HrFormat } from "@/components/utils/helpers";
import { paths } from "@/components/utils/paths";
import axios from "@/utils/axios";
import { set } from "lodash-es";

async function fetchBusinessData(businessId: string) {
	const settings = (await axios(paths.settings(businessId))) || {}
	const businessData = await axios(paths.businessData(businessId))
	const loyalty = await axios(paths.getLoyaltySettings(businessId)) || {}
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