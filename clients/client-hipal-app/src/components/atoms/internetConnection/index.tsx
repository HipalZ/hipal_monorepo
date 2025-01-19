"use client"
import { memo, useEffect, useRef, useState } from "react";

const MemoInternetConnection = () => {
    const isOnlineRef = useRef(navigator.onLine);
    const [isSlow, setIsSlow] = useState(false);

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
        <>
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
        </>
    )
}

const InternetConnection = memo(MemoInternetConnection)
export default InternetConnection