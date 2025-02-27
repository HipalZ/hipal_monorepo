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
    offlineCount,
    onlineCount,
    setOnlineCount,
    setOfflineCount,
    setOnlineAlertData,
    setOfflineAlertData,
    loading,
    triggerSound,
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
  const { selectedBiz, platform, pushToken, captainData } = useHiClientZ(
    (s) => ({
      selectedBiz: s.selectedBiz,
      platform: s.platform,
      pushToken: s.pushToken,
      captainData: s.captainData,
    }),
  );

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

  useEffect(() => {
    const isValidBusiness = captainData?.customRole?.some(
      (role) => role.businessId?._id === selectedBiz?.businessId?._id
    );

    if (accessToken && pushToken && selectedBiz?.businessId?.name && isValidBusiness) {
      navigate(`/${selectedBiz?.businessId?._id}/alerts`);
    }
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
    if (data && data?.length > onlineCount && platform === "web") {
      const sound = new Howl({
        src: ["/sounds/order.mp3"],
        autoplay: triggerSound,
        loop: true,
      });
      sound.play();
      setTimeout(() => {
        sound.pause();
      }, 3000);
    }
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
    if (data && data.length > offlineCount && platform === "web") {
      const sound = new Howl({
        src: ["/sounds/order.mp3"],
        autoplay: triggerSound,
        loop: true,
      });
      sound.play();
      setTimeout(() => {
        sound.pause();
      }, 3000);
    }
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
