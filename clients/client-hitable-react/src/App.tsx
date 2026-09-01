import { useCheckoutTaskCount } from '@/hooks/useCheckoutTasks';
import { useRoomAlerts } from '@/hooks/useHotelApis';
import { useUserToken } from '@hi/common/src/useUserToken';
import { lazy, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SpinnerMemo from './components/atoms/loadingSpinner';
import AlertReadinessPrompt from './components/hotel/AlertReadinessPrompt';
import InstallAppBanner from './components/pwa/InstallAppBanner';
import useBusinessData from './components/store/useBusinessData';
import { useHiClientZ } from './components/store/useHiClientzData';
import { useLiteStore } from './components/store/useLiteStore';
import { useCartsPoll, useOfflineAlerts, useOnlineAlerts } from './hooks/useF&BHook';
import { usePushNotifications } from './hooks/usePushNotifications';
import MainRouter from './routes';
const ErrorPopup = lazy(() => import('./components/ErrorPopup'));
const InternetConnection = lazy(() => import('./components/atoms/internet'));

function App() {
  const navigate = useNavigate();
  const accessToken = useUserToken((s) => s.accessToken);
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const { loading, notificationStatus } = useLiteStore();
  const { initializePushNotifications, initializedRef } = usePushNotifications();
  const { selectedBiz, pushToken, captainData } = useHiClientZ((s) => ({
    selectedBiz: s.selectedBiz,
    pushToken: s.pushToken,
    captainData: s.captainData,
  }));

  const checkAllowRedirectionConditions = () => {
    const isValidBusiness = captainData?.customRole?.some((role) => role?.isDeleted !== true && role.businessId?._id === selectedBiz?.businessId?._id);
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
      <InstallAppBanner />
      <AlertReadinessPrompt enabled={Boolean(accessToken)} />
      <InternetConnection />
      {loading ? <SpinnerMemo /> : null}
      <MainRouter />
      <ErrorPopup />
    </main>
  );
}

export default App;
