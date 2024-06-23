import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from './components/atoms/loadingSpinner';
import { useHiClientZ } from './components/store/useHiClientzData';
import { useLiteStore } from './components/store/useLiteStore';
import axios from './components/utils/axios';
import { Howl } from 'howler';
import MainRouter from './routes';

function App() {
  const { selectedBiz } = useHiClientZ();
  const location = useLocation();
  const isAlerts = location.pathname.includes('alerts');
  const businessId = selectedBiz?.businessId?._id;
  const { loading, setOnlineCount, onlineCount,offlineCount,setOfflineCount,setOnlineAlertData, setOfflineAlertData, setRefetchOnlineAlerts, setRefetchOfflineAlerts } = useLiteStore();

  const fetchAlerts = async (alertType: string) => {
    const url = alertType == 'ONLINE' ? 'paymentAlerts' : 'offlineAlerts';
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
    }
  };

  const handleOnlineAlerts = async () => {
    const data = await fetchAlerts('ONLINE');
    setOnlineAlertData(data);
    setOnlineCount(data.length);
    // if (data.length > onlineCount) {
      // initializeMessaging('New order', 'Hey pal, we have new order');
      const sound = new Howl({
        src: ['/sounds/order.mp3'],
        autoplay: true,
        loop: true,
      });
      sound.play();
      setTimeout(() => {
        sound.pause();
      }, 3000);
    // }
    setRefetchOnlineAlerts(refetchOnlineAlerts);
    return data;
  };

  const handleOfflineAlerts = async () => {
    const data = await fetchAlerts('ALL');
    setOfflineAlertData(data);
    setOfflineCount(data.length);
    // if (data.length > offlineCount) {
      // initializeMessaging('New order', 'Hey pal, we have new order');
      const sound = new Howl({
        src: ['/sounds/order.mp3'],
        autoplay: true,
        loop: true,
      });
      sound.play();
      setTimeout(() => {
        sound.pause();
      }, 3000);
    // }
    setRefetchOfflineAlerts(refetchOfflineAlerts);
    return data;
  };

  const { refetch: refetchOnlineAlerts } = useQuery({
    queryKey: ['onlineAlerts', businessId],
    queryFn: handleOnlineAlerts,
    enabled: !!businessId && !!selectedBiz,
    refetchInterval: 13000, // 15 seconds
  });

  const { refetch: refetchOfflineAlerts } = useQuery({
    queryKey: ['offlineAlerts', businessId],
    queryFn: handleOfflineAlerts,
    enabled: !!businessId && !!selectedBiz,
    refetchInterval: 11000, // 15 seconds
  });

  return (
    <>
      <MainRouter />
      {loading && isAlerts ? <LoadingSpinner /> : null}
    </>
  );
}

export default App;
