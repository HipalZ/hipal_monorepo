import type { birthdayEvents } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { fetchCommonData } from "../commonApis";

async function fetchBusinessData(customLink: string) {
  const { data, bizId } = await fetchCommonData(customLink);

  const eventsResponse = await apiRpc.event.getevents.$get({
    query: {
      businessId: bizId,
    },
  });
  const events = await eventsResponse.json();
  data["events"] = events?.data as unknown as birthdayEvents[];
  return data;
}

export const eventsApis = {
  all: fetchBusinessData,
};

export async function fetchAllBusinessIds() {
  const res = await apiRpc.businesses.get.allbusiness.$get();
  const response = await res.json();
  return response?.data.map((business: { _id: string }) => business._id);
}
