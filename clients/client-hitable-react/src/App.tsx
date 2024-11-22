import { useEffect, useState } from "react";
import { useLiteStore } from "./components/store/useLiteStore";
import MainRouter from "./routes";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useHiClientZ } from "./components/store/useHiClientzData";
import { useFetchAlerts } from "./utils/apiService";
import type { Alert, Cart } from "./components/types/hiClientzData";
import SpinnerMemo from "./components/atoms/loadingSpinner";
import toast from "react-hot-toast";
import { LuBellRing } from "react-icons/lu";
import { NativeSettings, AndroidSettings } from "capacitor-native-settings";
import { usePushNotifications } from "./hooks/usePushNotifications";
import { useUserToken } from "@hi/common/src/useUserToken";
import { apiRpc } from "@hi/common";
import { useErrorHandling } from "./components/utils/helpers";
import { FiDownload } from "react-icons/fi";

function App() {
  const navigate = useNavigate();
  const { fetchAlerts } = useFetchAlerts();
  const accessToken = useUserToken((s) => s.accessToken);
  const pathName = useLocation().pathname;
  const businessIdMatch = pathName.match(/^\/([^/]+)\/alerts$/);
  const businessId = businessIdMatch ? businessIdMatch[1] : null;
  const [isOnline, setIsOnline] = useState(true);
  const [isSlow, setIsSlow] = useState(false);
  const { errorText } = useErrorHandling();
  const {
    offlineCount,
    onlineCount,
    setOnlineCount,
    setOfflineCount,
    setOnlineAlertData,
    setOfflineAlertData,
    setRefetchOnlineAlerts,
    setRefetchOfflineAlerts,
    loading,
    triggerSound,
    notificationStatus,
    setNotificationStatus,
    setRefetchCart,
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
    setRefetchOnlineAlerts(refetchOnlineAlerts);
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

  const getAllCarts = async () => {
    if (!businessId) return;

    const response = await apiRpc.cart.$get({
      query: {
        businessId: businessId,
      },
    });
    if (response.status === 401) {
      errorText();
    }
    const res = await response.json();
    setRefetchCart(refetchCart);
    const carts = res.data as Cart[];
    setCartData(carts);
    setCartCount(carts?.length || 0);
    return res.data;
  };

  const handleOfflineAlerts = async () => {
    if (!businessId) return;
    const data: Alert[] = await fetchAlerts(businessId, "ALL");
    setOfflineAlertData(data);
    setRefetchOfflineAlerts(refetchOfflineAlerts);
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

  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
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
  const { refetch: refetchOnlineAlerts } = useQuery({
    queryKey: ["onlineAlerts", businessId, selectedBiz],
    queryFn: handleOnlineAlerts,
    enabled: !!businessId && !!selectedBiz,
    refetchInterval: isSlow ? 31000 : 17000,
  });

  const { refetch: refetchOfflineAlerts } = useQuery({
    queryKey: ["offlineAlerts", businessId, selectedBiz],
    queryFn: handleOfflineAlerts,
    enabled: !!businessId && !!selectedBiz,
    refetchInterval: isSlow ? 23000 : 19000,
  });

  const { refetch: refetchCart } = useQuery({
    queryKey: ["carts", businessId],
    queryFn: getAllCarts,
    enabled: !!businessId,
    refetchInterval: isSlow ? 29000 : 23000,
  });

  return (
    <main className="relative">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Bungee+Inline&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap"
        rel="stylesheet"
      />
      {!isOnline && (
        <div className="fixed top-0 z-20 w-full text-center text-white bg-red-500 space-grotesk-700">
          Please check your internet connection
        </div>
      )}
      {isOnline && isSlow && (
        <div className="space-grotesk-700 fixed top-0 z-20 w-full bg-[#ef9b0f] text-center text-white">
          ⚠ Your connection is too slow
        </div>
      )}
      {notification ? null : (
        <center className="z-20 w-full p-2 text-center text-white bg-red-200 border space-grotesk-700">
          You Turned off alerts, Turn on to get Alerts
        </center>
      )}
      {!notificationStatus && platform === "android" && (
        <div className="fixed z-20 top-10 left-1/2 -translate-x-1/2 w-full max-w-[30rem] flex items-center justify-between h-12 px-2 text-center text-black bg-[#6f2eff] border space-grotesk-700">
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
      )}
      <a
        className="fixed w-full max-w-[30rem] top-0 left-1/2 -translate-x-1/2 flex items-center justify-center h-8 text-white bg-[#4C4DDC]"
        href="https://assets.hipalz.com/app-debug%20(6).apk"
      >
        <FiDownload className="mr-2 text-white" size={20} />{" "}
        <span>Update App</span>
      </a>
      {loading ? <SpinnerMemo /> : null}
      <MainRouter />
    </main>
  );
}

export default App;
