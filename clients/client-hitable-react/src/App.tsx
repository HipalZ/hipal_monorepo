import { useCheckoutTaskCount } from '@/hooks/useCheckoutTasks';
import { useRoomAlerts } from '@/hooks/useHotelApis';
import { useUserToken } from '@hi/common/src/useUserToken';
import { lazy, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SpinnerMemo from './components/atoms/loadingSpinner';
import InstallAppBanner from './components/pwa/InstallAppBanner';
import useBusinessData from './components/store/useBusinessData';
import { useHiClientZ } from './components/store/useHiClientzData';
import { useLiteStore } from './components/store/useLiteStore';
import { useCartsPoll, useOfflineAlerts, useOnlineAlerts } from './hooks/useF&BHook';
import { usePushNotifications } from './hooks/usePushNotifications';
import MainRouter from './routes';
const ErrorPopup = lazy(() => import('./components/ErrorPopup'));
const InternetConnection = lazy(() => import('./components/atoms/internet'));
const UpdateApp = lazy(() => import('./components/atoms/updateApp'));

function App() {
  const navigate = useNavigate();
  const accessToken = useUserToken((s) => s.accessToken);
  const pathName = useLocation().pathname;
  const businessIdMatch = pathName.match(/^\/([^/]+)\/alerts/);
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const { loading, notificationStatus } = useLiteStore();
  const { initializePushNotifications, initializedRef } = usePushNotifications();
  const { selectedBiz, pushToken, captainData } = useHiClientZ((s) => ({
    selectedBiz: s.selectedBiz,
    pushToken: s.pushToken,
    captainData: s.captainData,
  }));

  const checkAllowRedirectionConditions = () => {
    const isValidBusiness = captainData?.customRole?.some((role) => role.businessId?._id === selectedBiz?.businessId?._id);
    if (accessToken && pushToken && selectedBiz?.businessId?.name && isValidBusiness && outletInfo?.outLetType !== 'HOTEL') {
      navigate(`/${selectedBiz?.businessId?._id}/alerts`);
    } else if (accessToken && pushToken && selectedBiz?.businessId?.name && isValidBusiness && outletInfo?.outLetType === 'HOTEL') {
      navigate(`hotel/${selectedBiz?.businessId?._id}/`);
    }
  };

  useEffect(() => {
    checkAllowRedirectionConditions();
  }, []);

  useEffect(() => {
    initializedRef.current = false;
    initializePushNotifications();
  }, [notificationStatus, accessToken]);

  useOnlineAlerts();
  useOfflineAlerts();
  useCartsPoll();
  // hotel alerts api
  useRoomAlerts();
  // room-turnover task count → Alerts nav badge
  useCheckoutTaskCount();

  return (
    <main className="!lg:poppins relative">
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
      {/* <UpdateApp /> */}
      {loading ? <SpinnerMemo /> : null}
      <MainRouter />
      <ErrorPopup />
    </main>
  );
}

export default App;
