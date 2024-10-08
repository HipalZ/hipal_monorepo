import axios from "axios";
import { apiRpc } from "@hi/common";
import type { Alert } from "@/components/types/hiClientzData";
import { useHiClientZ } from "@/components/store/useHiClientzData";

export const usePushTokenApi = () => {
  const { pushToken, selectedBiz, captainData } = useHiClientZ((s) => ({
    selectedBiz: s.selectedBiz,
    captainData: s.captainData,
    pushToken: s.pushToken,
  }));
  const businessId = selectedBiz?.businessId?._id;
  const savePushToken = async () => {
    try {
      const url = import.meta.env.VITE_API_URL;
      const config = {
        url: `${url}/users/save/token`,
        method: "POST",
        data: {
          registrationToken: pushToken,
          businessId,
          userId: captainData?._id,
        },
      };
      const res = await axios(config);
      return res || "";
    } catch (error) {
      return "";
    }
  };
  return { savePushToken };
};

export const fetchAlerts = async (
  businessId: string,
  alertType: string,
): Promise<Alert[]> => {
  const endpoint = alertType === "ONLINE" ? "paymentAlerts" : "offlineAlerts";
  if (!businessId) return [];
  try {
    const res = await apiRpc.payments[":id"][endpoint].$get({
      query: { businessId, alertType },
      param: { id: businessId },
    });
    const response = await res.json();
    return response.data || [];
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }
};
