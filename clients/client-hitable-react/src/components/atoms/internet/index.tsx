import { useHiClientZ } from '@/components/store/useHiClientzData'
import { useLiteStore } from '@/components/store/useLiteStore'
import { memo, useEffect, useRef } from 'react'

const MemoInternetConnection = () => {
    const isOnlineRef = useRef(true)
    const {
        isSlow,
        setIsSlow,
    } = useLiteStore((s) => ({
        isSlow: s.isSlow,
        setIsSlow: s.setIsSlow,
    }))
    const {
        notification,
    } = useHiClientZ((s) => ({
        notification: s.notification,
    }))

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

    return (
        <>
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
        </>
    )
}

const InternetConnection = memo(MemoInternetConnection)
export default InternetConnection