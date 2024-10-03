import axios from "axios";
import { apiRpc } from "@hi/common";
import type { Alert } from "@/components/types/hiClientzData";

export const savePushToken = async (pushToken: string, businessId: string) => {
  try {
    let url = import.meta.env.VITE_API_URL;
    if (url.includes("localhost")) {
      url = "https://api.test.hipalz.com";
    }
    console.log("url", import.meta.env.VITE_API_URL);
    const config = {
      url: `${url}/users/save/token`,
      method: "POST",
      data: {
        registrationToken: pushToken,
        businessId,
      },
    };
    const res = await axios(config);
    return res || "";
  } catch (error) {
    return "";
  }
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
