import { useEffect, useRef, useState } from "react";
import MainRouter from "./routes";
import ErrorPopup from "./components/error";
import SubscriptionEnded, {
  isSubscriptionEnded,
} from "./components/atoms/subscriptionEnded";
import useBusinessData from "./components/store/useBusinessData";
import { useLocation } from "react-router-dom";

const selectedBusinessPath = /^\/app\/(business|hotel)\/[a-f\d]{24}(?:\/|$)/i;

function App() {
  const isOnlineRef = useRef(navigator.onLine);
  const [isSlow, setIsSlow] = useState(false);
  const location = useLocation();
  const businessData = useBusinessData((s) => s.businessData);
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const shouldBlockWorkspace =
    selectedBusinessPath.test(location.pathname) && isSubscriptionEnded(outletInfo);

  useEffect(() => {
    const checkOnlineStatus = () => {
      const online = navigator.onLine;
      isOnlineRef.current = online
      console.log(`Network status: ${online ? "Online" : "Offline"}`);
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
          setIsSlow(false)
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
  return (
    <div className="App">
      {!isOnlineRef.current && (
        <div className="text-center text-white bg-red-500">
          Please check your internet connection
        </div>
      )}
      {isOnlineRef.current && isSlow && (
        <div className="bg-[#ef9b0f] text-center text-white">
          ⚠ Your connection is too slow
        </div>
      )}
      {shouldBlockWorkspace ? (
        <SubscriptionEnded businessName={outletInfo?.name || businessData?.name} />
      ) : (
        <MainRouter />
      )}
      <ErrorPopup />
    </div>
  );
}
////////

export default App;
