import { useEffect, useRef, useState } from "react";
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

function App() {
  const navigate = useNavigate();
  const { fetchAlerts } = useFetchAlerts();
  const accessToken = useUserToken((s) => s.accessToken);
  const pathName = useLocation().pathname;
  const businessIdMatch = pathName.match(/^\/([^/]+)\/alerts/);
  const businessId = businessIdMatch ? businessIdMatch[1] : null;
  const outletInfo = useBusinessData(s => s.outletInfo);
  const isOnlineRef = useRef(navigator.onLine);
  const [isSlow, setIsSlow] = useState(false);
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
  } = useLiteStore();
  const { initializePushNotifications, initializedRef } =
    usePushNotifications();
  const { selectedBiz, platform, pushToken, notification } = useHiClientZ(
    (s) => ({
      selectedBiz: s.selectedBiz,
      platform: s.platform,
      pushToken: s.pushToken,
      notification: s.notification,
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
    if (accessToken && pushToken && selectedBiz?.businessId?.name) {
      navigate(`/${selectedBiz?.businessId?._id}/alerts`);
    }
  }, []);

  useEffect(() => {
    initializedRef.current = false;
    initializePushNotifications();
  }, [notificationStatus]);

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


  useEffect(() => {
    const checkOnlineStatus = () => {
      isOnlineRef.current = navigator.onLine;
    };

    const handleConnectionChange = () => {
      if ("connection" in navigator) {
        const connection =
          navigator.connection ||
          (navigator as any).mozConnection ||
          (navigator as any).webkitConnection;
        if (
          connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g" ||
          connection.downlink < 0.5
        ) {
          setIsSlow(true);
        } else {
          setIsSlow(false);
        }
      } else {
        console.log("Network Information API not supported.");
      }
    };
    checkOnlineStatus();
    handleConnectionChange();

    window.addEventListener("online", checkOnlineStatus);
    window.addEventListener("offline", checkOnlineStatus);
    window.addEventListener("change", handleConnectionChange);
    const intervalId = setInterval(checkOnlineStatus, 5000);
    const intervalId2 = setInterval(handleConnectionChange, 5000);
    return () => {
      window.removeEventListener("online", checkOnlineStatus);
      window.removeEventListener("offline", checkOnlineStatus);
      window.removeEventListener("change", handleConnectionChange);
      clearInterval(intervalId);
      clearInterval(intervalId2);
    };
  }, []);

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
      {!isOnlineRef.current && (
        <div className="sticky top-0 z-20 w-full text-center text-white bg-red-500 space-grotesk-700">
          Please check your internet connection
        </div>
      )}
      {isOnlineRef.current && isSlow && (
        <div className="sticky top-0 space-grotesk-700 z-20 w-full bg-[#ef9b0f] text-center text-white">
          ⚠ Your connection is too slow
        </div>
      )}
      {notification ? null : (
        <center className="z-20 w-full p-2 text-center text-white bg-red-200 border space-grotesk-700">
          You Turned off alerts, Turn on to get Alerts
        </center>
      )}
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
      {loading ? <SpinnerMemo /> : null}
      <MainRouter />
    </main>
  );
}

export default App;
