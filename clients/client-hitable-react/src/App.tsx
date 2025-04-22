import { lazy, useEffect } from "react";
import { useLiteStore } from "./components/store/useLiteStore";
import MainRouter from "./routes";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useHiClientZ } from "./components/store/useHiClientzData";
import { useFetchAlerts } from "./utils/apiService";
import type { Alert, Cart } from "./components/types/hiClientzData";
import SpinnerMemo from "./components/atoms/loadingSpinner";
import toast from "react-hot-toast";
import { NativeSettings, AndroidSettings } from "capacitor-native-settings";
import { usePushNotifications } from "./hooks/usePushNotifications";
import { useUserToken } from "@hi/common/src/useUserToken";
import { apiRpc } from "@hi/common";
import { useErrorHandling } from "./components/utils/helpers";
import useBusinessData from "./components/store/useBusinessData";
import { useEscalatedAlerts, useRoomAlerts } from "@/hooks/useHotelApis";
import { useHotelStore } from "./components/store/useHotelStore";
const ErrorPopup = lazy(() => import("./components/ErrorPopup"));
const InternetConnection = lazy(() => import("./components/atoms/internet"));
const UpdateApp = lazy(() => import("./components/atoms/updateApp"));

function App() {
  const navigate = useNavigate();
  const { fetchAlerts } = useFetchAlerts();
  const accessToken = useUserToken((s) => s.accessToken);
  const pathName = useLocation().pathname;
  const businessIdMatch = pathName.match(/^\/([^/]+)\/alerts/);
  const businessId = businessIdMatch ? businessIdMatch[1] : null;
  const outletInfo = useBusinessData(s => s.outletInfo);
  const version = import.meta.env.VITE_APP_VERSION;
  const { errorText } = useErrorHandling();
  const {
    setOnlineCount,
    setOfflineCount,
    setOnlineAlertData,
    setOfflineAlertData,
    loading,
    notificationStatus,
    setNotificationStatus,
    setCartData,
    setCartCount,
    isSlow,
    setUpdateUrl,
    setIsVersionPopup,
    setUpdateFeature,
  } = useLiteStore();
  const { initializePushNotifications, initializedRef } =
    usePushNotifications();
  const { selectedBiz, pushToken, captainData } = useHiClientZ(
    (s) => ({
      selectedBiz: s.selectedBiz,
      pushToken: s.pushToken,
      captainData: s.captainData,
    }),
  );

  const setHotelEscalationCount = useHotelStore((s) => s.setHotelEscalationCount);
  const setEscalatedData = useHotelStore((s) => s.setEscalatedData);

  const { escalatedAlerts } = useEscalatedAlerts()

  const pushNotify = async () => {
    try {
      NativeSettings.openAndroid({
        option: AndroidSettings.ApplicationDetails,
      });
      setNotificationStatus(true);
    } catch (error) {
      toast.error("Error enabling notifications. Try after some time");
      setNotificationStatus(false);
    }
  };

  const checkAllowRedirectionConditions = () => {
    const isValidBusiness = captainData?.customRole?.some(
      (role) => role.businessId?._id === selectedBiz?.businessId?._id
    );
    if (accessToken && pushToken && selectedBiz?.businessId?.name && isValidBusiness && outletInfo?.outLetType !== "HOTEL") {
      navigate(`/${selectedBiz?.businessId?._id}/alerts`);
    } else if (accessToken && pushToken && selectedBiz?.businessId?.name && isValidBusiness && outletInfo?.outLetType === "HOTEL") {
      navigate(`hotel/${selectedBiz?.businessId?._id}/`);
    }
  }

  useEffect(() => {
    checkAllowRedirectionConditions();
  }, []);

  useEffect(() => {
    initializedRef.current = false;
    initializePushNotifications();
  }, [notificationStatus, accessToken]);

  const handleOnlineAlerts = async () => {
    if (!businessId) return;
    const data: Alert[] = await fetchAlerts(businessId, "ONLINE");
    setOnlineAlertData(data);
    setOnlineCount(data.length);
    return data;
  };


  const handleOfflineAlerts = async () => {
    if (!businessId) return;
    const data: Alert[] = await fetchAlerts(businessId, "ALL");
    setOfflineAlertData(data);
    setIsVersionPopup(Number(version) !== data[0]?.v);
    setUpdateUrl(data[0]?.appUrl);
    console.log('alert version', data[0]?.v, 'env version', version);
    if (data[0]?.v !== Number(version)) {
      setUpdateFeature(data[0]?.updateFeature);
    }
    setOfflineCount(data.length);
    return data;
  };

  const handleEscalatedAlerts = async () => {
    if (!businessId) return;
    const data: Alert[] = await escalatedAlerts();
    console.log('escalated alerts', data);
    setEscalatedData(data);
    setHotelEscalationCount(data.length);
    return data;
  };

  const getAllCarts = async () => {
    if (!businessId) return;

    if (outletInfo?.isPosEnabled) {
      const response = await apiRpc.table.orders[":businessId"].$get({
        param: {
          businessId: businessId,
        },
      });
      if (response.status === 401) {
        errorText();
      }
      const res = await response.json();
      const carts = res.data as Cart[];
      setCartData(carts);
      setCartCount(carts?.length || 0);
      return res.data;
    }

    const response = await apiRpc.cart.$get({
      query: {
        businessId: businessId,
      },
    });
    if (response.status === 401) {
      errorText();
    }
    const res = await response.json();
    const carts = res.data as Cart[];
    setCartData(carts);
    setCartCount(carts?.length || 0);
    return res.data;
  };

  // UseQuery with adaptive polling based on pingTime and connection speed
  useQuery({
    queryKey: ["onlineAlerts", businessId, selectedBiz],
    queryFn: handleOnlineAlerts,
    enabled: !!businessId && !!selectedBiz,
    refetchInterval: isSlow ? 31000 : 17000,
  });

  useQuery(({
    queryKey: ["escalatedAlerts", businessId, selectedBiz],
    queryFn: handleEscalatedAlerts,
    enabled: !!businessId && !!selectedBiz && (captainData?.customRole[0]?.role === "FRONT_OFFICE" || captainData?.customRole[0]?.role === "MANAGER"),
    refetchInterval: isSlow ? 29000 : 19000,
  }))

  useQuery({
    queryKey: ["offlineAlerts", businessId, selectedBiz],
    queryFn: handleOfflineAlerts,
    enabled: !!businessId && !!selectedBiz,
    refetchInterval: isSlow ? 23000 : 19000,
  });

  useQuery({
    queryKey: ["carts", businessId],
    queryFn: getAllCarts,
    enabled: !!businessId,
    refetchInterval: isSlow ? 29000 : 23000,
  });

  // hotel alerts api
  useRoomAlerts();

  return (
    <main className="relative">
      <InternetConnection />
      {/* {!notificationStatus && platform === "android" && (
        <div className="fixed z-20 top-0 left-1/2 -translate-x-1/2 w-full max-w-[30rem] flex items-center justify-between h-12 px-2 text-center text-black bg-[#6f2eff] border space-grotesk-700">
          <h1 className="flex items-center gap-2 text-white">
            <LuBellRing />
            <span className="text-sm">Allow Notifications to get alerts</span>
          </h1>
          <button
            type="button"
            onClick={pushNotify}
            className="px-3 py-1 text-sm text-white bg-black on_active_bounce rounded-xl"
          >
            Enable
          </button>
        </div>
      )} */}
      <UpdateApp />
      {loading ? <SpinnerMemo /> : null}
      <MainRouter />
      <ErrorPopup />
    </main>
  );
}

export default App;
