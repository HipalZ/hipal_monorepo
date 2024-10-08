import { useEffect, useState } from "react";
import { useLiteStore } from "./components/store/useLiteStore";
import MainRouter from "./routes";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useHiClientZ } from "./components/store/useHiClientzData";
import { fetchAlerts } from "./utils/apiService";
import type { Alert } from "./components/types/hiClientzData";
import { useCheckPlatform } from "./components/utils/helpers";
import SpinnerMemo from "./components/atoms/loadingSpinner";
import { usePushNotifications } from "./hooks/usePushNotifications";

function App() {
  const [isOnline, setIsOnline] = useState(true);
  const pushTokenInitialize = usePushNotifications();
  const { pushToken, setPushToken } = useHiClientZ((s) => ({
    pushToken: s.pushToken,
    setPushToken: s.setPushToken,
  }));
  useEffect(() => {
    if (pushToken && pushToken?.length > 0) return;
    setPushToken(pushTokenInitialize);
  }, [pushTokenInitialize, setPushToken, pushToken]);
  const triggerSound = useLiteStore((s) => s.triggerSound);
  const [isSlow, setIsSlow] = useState(false);
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
  } = useLiteStore();

  const { selectedBiz } = useHiClientZ((s) => ({
    selectedBiz: s.selectedBiz,
  }));
  const pathName = useLocation().pathname;
  const businessIdMatch = pathName.match(/^\/([^/]+)\/alerts$/);
  const businessId = businessIdMatch ? businessIdMatch[1] : null;
  const { isWeb } = useCheckPlatform();

  const handleOnlineAlerts = async () => {
    if (!businessId) return;
    const data: Alert[] = await fetchAlerts(businessId, "ONLINE");
    setOnlineAlertData(data);
    setRefetchOnlineAlerts(refetchOnlineAlerts);
    setOnlineCount(data.length);
    if (data && data?.length > onlineCount && isWeb) {
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
    setRefetchOfflineAlerts(refetchOfflineAlerts);
    setOfflineCount(data.length);
    if (data && data.length > offlineCount && isWeb) {
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
    refetchInterval: isSlow ? 30000 : 17000,
  });

  const { refetch: refetchOfflineAlerts } = useQuery({
    queryKey: ["offlineAlerts", businessId, selectedBiz],
    queryFn: handleOfflineAlerts,
    enabled: !!businessId && !!selectedBiz,
    refetchInterval: isSlow ? 30000 : 19000,
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
      {loading ? <SpinnerMemo /> : null}
      <MainRouter />
    </main>
  );
}

export default App;
