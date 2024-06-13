import { getTimeIn12HrFormat } from "@/components/utils/helpers";
import { paths } from "@/components/utils/paths";
import { updateTheme } from "@/components/utils/themes";
import axios from "@/utils/axios";
import { set } from "lodash-es";

async function fetchBusinessData(businessId: string) {
	const settings = (await axios(paths.settings(businessId))) || {}
	const businessData = await axios(paths.businessData(businessId))
	const loyalty = await axios(paths.getLoyaltySettings(businessId)) || {}
	const data = {}
	data["settings"] = settings?.data[0]
	data["business"] = businessData?.data || {}
	data["loyalty"] = loyalty?.data || {}
	set(
		data,
		"settings.explore.openFrom",
		getTimeIn12HrFormat(data?.["settings"]?.explore?.openFrom),
	)
	set(
		data,
		"settings.explore.openTill",
		getTimeIn12HrFormat(data?.["settings"]?.explore?.openTill),
	)
	return data;
}

export const businessApis = {
	all: fetchBusinessData,
	// one:fetchBusinessById,
	// delete:deleteBusinessById,
	// update:updateBusinessById,
}

export async function fetchAllBusinessIds() {
	const response = await axios.get(paths.listAllBusiness());
	return response.data.map((business: { _id: string }) => business._id);
}