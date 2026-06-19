import { useHiClientZ } from "@/components/store/useHiClientzData";
import type { Alert } from "@/components/types/hiClientzData";
import { useErrorHandling } from "@/components/utils/helpers";
import { apiRpc } from "@hi/common";
import toast from "react-hot-toast";
import { Capacitor } from "@capacitor/core";
interface SavePushTokenResponse {
  message: string;
  err: boolean;
  data?: {
    _id: string;
    businessId: string;
    userId: string;
    token?: string;
    notification: boolean;
    __v: number;
  } | null;
}

export const usePushTokenApi = () => {
  const { errorText } = useErrorHandling();
  const { pushToken, selectedBiz, captainData, setNotification } = useHiClientZ(
    (s) => ({
      selectedBiz: s.selectedBiz,
      captainData: s.captainData,
      pushToken: s.pushToken,
      setNotification: s.setNotification,
    }),
  );
  const businessId = selectedBiz?.businessId?._id;
  const iosTokenMetadata =
    Capacitor.getPlatform() === "ios"
      ? ({ provider: "fcm", platform: "ios", app: "hitable" } as const)
      : {};
  const savePushToken = async (): Promise<SavePushTokenResponse | null> => {
    try {
      const res = await apiRpc.users.save.token.$post({
        json: {
          registrationToken: pushToken,
          businessId,
          userId: captainData?._id,
          ...iosTokenMetadata,
        },
      });
      if (res.status === 401) {
        errorText();
      }
      const response: SavePushTokenResponse = await res.json();
      if (response.data) {
        setNotification(response.data.notification);
      }
      return response;
    } catch (error) {
      return null;
    }
  };
  return { savePushToken };
};

export const useFetchAlerts = () => {
  const { errorText } = useErrorHandling();
  const fetchAlerts = async (
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
      if (res.status === 401) {
        errorText();
      }
      const response = await res.json();
      return (response.data as Alert[]) || [];
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return [];
    }
  };
  return { fetchAlerts };
};

export const useUpdateNotifications = () => {
  const { errorText } = useErrorHandling();
  const { selectedBiz, captainData, setNotification, pushToken } = useHiClientZ(
    (s) => ({
      selectedBiz: s.selectedBiz,
      captainData: s.captainData,
      setNotification: s.setNotification,
      pushToken: s.pushToken,
    }),
  );
  const businessId = selectedBiz?.businessId?._id;
  const iosTokenMetadata =
    Capacitor.getPlatform() === "ios"
      ? ({ provider: "fcm", platform: "ios", app: "hitable" } as const)
      : {};
  const updateNotificationsApi = async (
    notification: boolean,
  ): Promise<SavePushTokenResponse | null> => {
    try {
      const res = await apiRpc.users.update.token.$put({
        json: {
          businessId,
          notification,
          userId: captainData?._id,
          registrationToken: pushToken,
          ...iosTokenMetadata,
        },
      });
      if (res.status === 401) {
        errorText();
      }
      const response: SavePushTokenResponse = await res.json();
      if (response.data) {
        setNotification(response.data.notification);
        toast.success(`Alerts ${notification ? "on" : "off"} updated`);
      }
      return response;
    } catch (error) {
      return null;
    }
  };
  return { updateNotificationsApi };
};
