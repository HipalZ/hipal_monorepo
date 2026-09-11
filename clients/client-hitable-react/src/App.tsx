import { useCheckoutTaskCount } from '@/hooks/useCheckoutTasks';
import { useRoomAlerts } from '@/hooks/useHotelApis';
import { apiRpc } from '@hi/common';
import { useUserToken } from '@hi/common/src/useUserToken';
import { lazy, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SpinnerMemo from './components/atoms/loadingSpinner';
import SubscriptionEnded, { isSubscriptionEnded } from './components/atoms/subscriptionEnded';
import AlertReadinessPrompt from './components/hotel/AlertReadinessPrompt';
import useBusinessData from './components/store/useBusinessData';
import { useHiClientZ } from './components/store/useHiClientzData';
import { useLiteStore } from './components/store/useLiteStore';
import { useCartsPoll, useOfflineAlerts, useOnlineAlerts } from './hooks/useF&BHook';
import { usePushNotifications } from './hooks/usePushNotifications';
import MainRouter from './routes';
const ErrorPopup = lazy(() => import('./components/ErrorPopup'));
const InternetConnection = lazy(() => import('./components/atoms/internet'));

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const getBusinessIdFromPath = (pathname: string) => {
  const hotelMatch = pathname.match(/^\/hotel\/([a-f\d]{24})(?:\/|$)/i);
  if (hotelMatch?.[1]) return hotelMatch[1];

  const businessMatch = pathname.match(/^\/([a-f\d]{24})(?:\/|$)/i);
  if (businessMatch?.[1]) return businessMatch[1];

  return '';
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useUserToken((s) => s.accessToken);
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const setOutletInfo = useBusinessData((s) => s.setOutletInfo);
  const { loading, notificationStatus } = useLiteStore();
  const { initializePushNotifications, initializedRef } = usePushNotifications();
  const { selectedBiz, pushToken, captainData } = useHiClientZ((s) => ({
    selectedBiz: s.selectedBiz,
    pushToken: s.pushToken,
    captainData: s.captainData,
  }));
  const pathBusinessId = useMemo(() => getBusinessIdFromPath(location.pathname), [location.pathname]);
  const selectedBusinessId = selectedBiz?.businessId?._id || '';
  const activeBusinessId = pathBusinessId || selectedBusinessId;
  const isProtectedBusinessRoute =
    Boolean(pathBusinessId) || (location.pathname === '/viewInBiz' && Boolean(selectedBusinessId));
  const [subscriptionBusinessName, setSubscriptionBusinessName] = useState('');
  const isBlockedBySubscription =
    isProtectedBusinessRoute &&
    outletInfo?.businessId === activeBusinessId &&
    isSubscriptionEnded(outletInfo);

  const checkAllowRedirectionConditions = () => {
    const isValidBusiness = captainData?.customRole?.some(
      (role) => role?.isDeleted !== true && role.businessId?._id === selectedBiz?.businessId?._id,
    );
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
    let isActive = true;

    const fetchOutletInfo = async () => {
      if (!activeBusinessId || !objectIdRegex.test(activeBusinessId)) return;
      if (outletInfo?.businessId === activeBusinessId && typeof outletInfo.subscriptionEnded !== 'undefined') {
        setSubscriptionBusinessName(outletInfo.name || selectedBiz?.businessId?.name || '');
        return;
      }

      try {
        const response = await apiRpc.businesses.outletInfo[':businessId'].$get(
          {
            param: {
              businessId: activeBusinessId,
            },
          },
          {
            init: {
              cache: 'no-store',
            },
          },
        );
        const result = (await response.json()) as {
          data?: typeof outletInfo;
        };

        if (!isActive || !result.data) return;

        setOutletInfo(result.data);
        setSubscriptionBusinessName(result.data.name || selectedBiz?.businessId?.name || '');
      } catch {
        if (isActive) {
          setSubscriptionBusinessName(selectedBiz?.businessId?.name || '');
        }
      }
    };

    fetchOutletInfo();

    return () => {
      isActive = false;
    };
  }, [activeBusinessId, outletInfo?.businessId, outletInfo?.subscriptionEnded, selectedBiz?.businessId?.name, setOutletInfo]);

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
      <AlertReadinessPrompt enabled={Boolean(accessToken)} />
      <InternetConnection />
      {loading ? <SpinnerMemo /> : null}
      {isBlockedBySubscription ? (
        <SubscriptionEnded businessName={subscriptionBusinessName || outletInfo?.name || selectedBiz?.businessId?.name} />
      ) : (
        <MainRouter />
      )}
      <ErrorPopup />
    </main>
  );
}

export default App;
