import { useQuery } from '@tanstack/react-query';
import { Howl } from 'howler';
import { useEffect, useState } from 'react';
import { useHiClientZ } from './components/store/useHiClientzData';
import { useLiteStore } from './components/store/useLiteStore';
import axios from './components/utils/axios';
import MainRouter from './routes';

function App() {
  const selectedBiz = useHiClientZ((state) => state.selectedBiz);
  const triggerSound = useLiteStore((s)=>s.triggerSound);
  const businessId = selectedBiz?.businessId?._id;
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
  const fetchAlerts = async (alertType: string) => {
    const url = alertType == 'ONLINE' ? 'paymentAlerts' : 'offlineAlerts';
    setLoading(true);
    try {
      const config = {
        method: 'GET',
        url: `/v1/payments/:id/${url}?businessId=${businessId}&alertType=${alertType}`,
      };
      const response = await axios(config);
      if (response.status === 200) {
        return response.data.data;
      } else {
        return [];
      }
    } catch (err) {
      console.log(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleOnlineAlerts = async () => {
    const data = await fetchAlerts('ONLINE');
    setOnlineAlertData(data);
    setOnlineCount(data.length);
    if (data.length > onlineCount) {
      // initializeMessaging('New order', 'Hey pal, we have new order');
      const sound = new Howl({
        src: ['/sounds/order.mp3'],
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
    const data = await fetchAlerts('ALL');
    setOfflineAlertData(data);
    setOfflineCount(data.length);
    if (data.length > offlineCount) {
      // initializeMessaging('New order', 'Hey pal, we have new order');
      const sound = new Howl({
        src: ['/sounds/order.mp3'],
        autoplay: triggerSound,
        loop: true,
      });
      sound.play();
      setTimeout(() => {
        sound.pause();
      }, 3000);
    }
    setRefetchOfflineAlerts(refetchOfflineAlerts);
    return data;
  };

  useEffect(() => {
    const checkOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
    };
    const handleConnectionChange = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' || connection.downlink < 0.5) {
          setIsSlow(true);
        } else {
          setIsSlow(false);
        }
      } else {
        console.log('Network Information API not supported.');
      }
    };
    checkOnlineStatus();
    handleConnectionChange();
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
    window.addEventListener('change', handleConnectionChange);
    const intervalId = setInterval(checkOnlineStatus, 5000);
    const intervalId2 = setInterval(handleConnectionChange, 5000);
    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
      window.removeEventListener('change', handleConnectionChange);
      clearInterval(intervalId);
      clearInterval(intervalId2);
    };
  }, []);

  const { refetch: refetchOnlineAlerts } = useQuery({
    queryKey: ['onlineAlerts', businessId],
    queryFn: handleOnlineAlerts,
    enabled: !!businessId && !!selectedBiz,
    refetchInterval: 17000, // 17 seconds
  });

  const { refetch: refetchOfflineAlerts } = useQuery({
    queryKey: ['offlineAlerts', businessId],
    queryFn: handleOfflineAlerts,
    enabled: !!businessId && !!selectedBiz,
    refetchInterval: 19000, // 19 seconds
  });

  return (
    <>
      {!isOnline && <div className="bg-red-500 text-center text-white">Please check your internet connection</div>}
      {isOnline && isSlow && <div className="bg-[#ef9b0f] text-center text-white">⚠ Your connection is too slow</div>}
      <MainRouter />
    </>
  );
}

export default App;
