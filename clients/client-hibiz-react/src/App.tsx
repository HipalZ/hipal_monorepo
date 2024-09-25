import { useEffect, useState } from "react";
import MainRouter from "./routes";

////////

function App() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const checkOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
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
  return (
    <div className="App">
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
    </div>
  );
}
////////

export default App;
