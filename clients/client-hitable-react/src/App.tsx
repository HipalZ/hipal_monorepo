import { lazy, useEffect } from "react";
import MainRouter from "./routes";
import { useLocation, useNavigate } from "react-router-dom";
import { usePushNotifications } from "./hooks/usePushNotifications";
import { useUserToken } from "@hi/common/src/useUserToken";
import { handleNavigation, useErrorHandling } from "./components/utils/helpers";
import useBusinessData from "./components/store/useBusinessData";
import { useLiteStore } from "./components/store/useLiteStore";
import { useHiClientZ } from "./components/store/useHiClientzData";
import { useEscalatedAlerts, useRoomAlerts } from "@/hooks/useHotelApis";

import {
  useOnlineAlertsQuery,
  useOfflineAlertsQuery,
  useCartsQuery,
} from "@/hooks/useHiClients";

const ErrorPopup = lazy(() => import("./components/ErrorPopup"));
const InternetConnection = lazy(() => import("./components/atoms/internet"));

function App() {
  // const navigate = useNavigate();
  const accessToken = useUserToken((s) => s.accessToken);
  const pathName = useLocation().pathname;
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const version = Number(import.meta.env.VITE_APP_VERSION || 0);
  const navigate = useNavigate();
  const isSlow = useLiteStore((s) => s.isSlow);
  const notificationStatus = useLiteStore((s) => s.notificationStatus);

  const { initializePushNotifications, initializedRef } =
    usePushNotifications();
  const selectedBiz = useHiClientZ((s) => s.selectedBiz);
  const pushToken = useHiClientZ((s) => s.pushToken);
  const captainData = useHiClientZ((s) => s.captainData);

  const businessIdMatch = pathName.match(/^\/([^/]+)\/alerts/);
  const businessIdFromPath = businessIdMatch ? businessIdMatch[1] : null;
  const businessId = businessIdFromPath ?? selectedBiz?.businessId?._id ?? null;

  const checkAllowRedirectionConditions = () => {
    const isValidBusiness = captainData?.customRole?.some(
      (role) => role.businessId?._id === selectedBiz?.businessId?._id,
    );

    if (
      accessToken &&
      pushToken &&
      selectedBiz?.businessId?.name &&
      isValidBusiness &&
      outletInfo?.outLetType !== "HOTEL"
    ) {
      const link = handleNavigation(
        outletInfo?.outLetType,
        selectedBiz?.businessId?._id,
      );
      navigate(link);
    }
  };
  useErrorHandling();
  useOfflineAlertsQuery(businessId, isSlow, version);
  useOnlineAlertsQuery(businessId, isSlow);
  useCartsQuery(businessId, isSlow);

  // Hotel-specific polling
  useRoomAlerts();
  useEscalatedAlerts();

  useEffect(() => {
    checkAllowRedirectionConditions();
  }, []);

  useEffect(() => {
    initializedRef.current = false;
    initializePushNotifications();
  }, [notificationStatus, accessToken]);

  return (
    <main className="relative">
      <InternetConnection />
      {/* <UpdateApp /> */}

      <MainRouter />
      <ErrorPopup />
    </main>
  );
}

export default App;
