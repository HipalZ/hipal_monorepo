import { useQuery } from "@tanstack/react-query";
import { Howl } from "howler";
import { useEffect, useState } from "react";
import { useHiClientZ } from "./components/store/useHiClientzData";
import { useLiteStore } from "./components/store/useLiteStore";
import MainRouter from "./routes";
import { apiRpc } from "@hi/common";
import { messaging, getToken } from "./hooks/clientApp";
import { useLocation } from "react-router-dom";
import { URL } from "./configs";
//
function App() {
  const selectedBiz = useHiClientZ((state) => state.selectedBiz);
  const triggerSound = useLiteStore((s) => s.triggerSound);
  const {
    setLoading,
    setOnlineCount,
    onlineCount,
    offlineCount,
    setOfflineCount,
    setOnlineAlertData,
    setOfflineAlertData,
    setRefetchOnlineAlerts,
    setRefetchOfflineAlerts,
  } = useLiteStore();
  const [isOnline, setIsOnline] = useState(true);
  const [isSlow, setIsSlow] = useState(false);
  const businessId = selectedBiz?.businessId?._id;
  const location = useLocation();
  const fetchAlerts = async (alertType: string) => {
    const endpoint = alertType === "ONLINE" ? "paymentAlerts" : "offlineAlerts";
    setLoading(true);
    const res = await apiRpc.payments[":id"][endpoint].$get({
      query: {
        businessId,
        alertType,
      },
      param: {
        id: businessId,
      },
    });
    const response = (await res.json()) || [];
    setLoading(false);
    return response.data || [];
  };

  const handleOnlineAlerts = async () => {
    const data = await fetchAlerts("ONLINE");
    setOnlineAlertData(data);
    setOnlineCount(data.length);
    if (data.length > onlineCount) {
      const url = `${URL}${location?.pathname}`;
      // initializeMessaging(url, "checkout the recent payment");
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
    setRefetchOnlineAlerts(refetchOnlineAlerts);
    return data;
  };

  const handleOfflineAlerts = async () => {
    const data = await fetchAlerts("ALL");
    setOfflineAlertData(data);
    setOfflineCount(data.length);
    if (data.length > offlineCount) {
      const url = `${URL}${location?.pathname}`;
      const sound = new Howl({
        src: ["/sounds/order.mp3"],
        autoplay: triggerSound,
        loop: true,
      });
      // initializeMessaging(url, "Confirm the offline payment");
      sound.play();
      setTimeout(() => {
        sound.pause();
      }, 3000);
    }
    setRefetchOfflineAlerts(refetchOfflineAlerts);
    return data;
  };

  async function initializeMessaging(body: string, title: string) {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
        );
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (token) {
          await apiRpc.users.send.PushNotification.$post({
            json: {
              registrationToken: token,
              title,
              body,
            },
          });
        }
      }
    } else if (permission === "denied") {
      console.log("Permission denied");
    }
  }

  useEffect(() => {
    const checkOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
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

  const { refetch: refetchOnlineAlerts } = useQuery({
    queryKey: ["onlineAlerts", businessId],
    queryFn: handleOnlineAlerts,
    enabled: !!businessId && !!selectedBiz,
    refetchInterval: 17000, // 17 seconds
  });

  const { refetch: refetchOfflineAlerts } = useQuery({
    queryKey: ["offlineAlerts", businessId],
    queryFn: handleOfflineAlerts,
    enabled: !!businessId && !!selectedBiz,
    refetchInterval: 19000, // 19 seconds
  });

  return (
    <>
      {!isOnline && (
        <div className="text-center text-white bg-red-500">
          Please check your internet connection
        </div>
      )}
      {isOnline && isSlow && (
        <div className="bg-[#ef9b0f] text-center text-white">
          ⚠ Your connection is too slow
        </div>
      )}
      <MainRouter />
    </>
  );
}

export default App;
