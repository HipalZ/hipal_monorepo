import axios from '@/axios';
import { useAlert } from '@/components/store/useAlert';
import { useLogin } from '@/components/store/useLogin';
import { PAGE_TYPES, singleRoute } from '@/components/utils/routes';
import '@/styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getToken } from 'firebase/messaging';
import { Howl } from 'howler';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { messaging } from '../../firebase/clientApp';
// import packageJson from "../../package.json";
// Create a client
const queryClient = new QueryClient();
let intervalId;

export default function App({ Component, pageProps }: AppProps) {
  const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date());
  const userDetail = useLogin((s) => s.userDetails);
  const isLogin = useLogin((s) => s.isLogin);
  const router = useRouter();
  const { businessId, zoneId } = router.query as {
    businessId: string;
    zoneId: string;
  };

  const [isOnline, setIsOnline] = useState(true);
  const [isSlow, setIsSlow] = useState(false);

  // useEffect(() => {
  // 	const currentVersion = packageJson.version;
  // 	const storedVersion = localStorage.getItem('appVersion');

  // 	if (storedVersion !== currentVersion) {
  // 		localStorage.clear();
  // 		localStorage.setItem('appVersion', currentVersion);
  // 		window.location.reload();
  // 	}
  // }, []);

  useEffect(() => {
    if (businessId === 'undefined') {
      router.push('/');
    }
  }, [businessId]);

  useEffect(() => {
    const pathPrefix = router.asPath.split('/')[3];

    if (pathPrefix === 'zone' && !isLogin) {
      router.push(singleRoute[PAGE_TYPES.LOGIN](businessId));
    }
  }, [isLogin, router]);

  const { setAlertData, setOrderData, newAlertsCount, setNewAlertsCount, newOrderCount, setNewOrderCount } = useAlert();

  async function onAlertData() {
    try {
      const response = await axios.get('/v1/kitchens/get/AllAlertByWaiter', {
        params: {
          staffId: userDetail?.id,
          businessId,
          isAlertOn: true,
          zoneId,
        },
      });

      const responseData = response.data;
      setNewAlertsCount(responseData.length);

      if (responseData.length > newAlertsCount) {
        initializeMessaging('Need Your Attention', 'Hey Pal, Someone needs you');
        const sound = new Howl({
          src: ['/sounds/hotel_bell.mp3'],
          autoplay: true,
          loop: true,
        });
        sound.play();
        setTimeout(() => {
          sound.pause();
        }, 3000);
      }

      setAlertData(responseData);
    } catch (error) {
      console.error('Error retrieving alert data:', error);
    }
  }

  const result = async () => {
    try {
      const config = {
        method: 'GET',
        url: `/v1/kitchens/all/WaiterOrder?businessId=${businessId}&zoneId=${zoneId}&staffId=${userDetail?.id}`,
      };
      const response = await axios(config);
      const data = response.data;
      setNewOrderCount(data.length);
      if (data.length > newOrderCount) {
        initializeMessaging('New order', 'Hey pal, we have new order');
        const sound = new Howl({
          src: ['/sounds/order.mp3'],
          autoplay: true,
          loop: true,
        });
        sound.play();
        setTimeout(() => {
          sound.pause();
        }, 3000);
      }
      setOrderData(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const resetTimer = () => {
      if (!intervalId) {
        setLastActivityTime(new Date());
      }
    };

    const events = ['touchstart', 'touchend'];
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, false);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, false);
      });
    };
  }, []);

  useEffect(() => {
    if (isLogin && zoneId && businessId) {
      if (!intervalId) {
        intervalId = setInterval(() => {
          const currentTime = new Date();
          const elapsedTime = (currentTime.getTime() - lastActivityTime.getTime()) / 1000;
          if (elapsedTime < 3600) {
            // 10 minutes = 600 seconds
            onAlertData();
            result();
          } else {
            clearInterval(intervalId);
            intervalId = null;
          }
        }, 15000);

        return () => {
          clearInterval(intervalId);
          intervalId = null;
        };
      }
    }
  }, [zoneId, businessId, newAlertsCount, newOrderCount, lastActivityTime]);

  async function requestPermission(body: string, title: string) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      try {
        // Register the service worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Service worker registered:', registration);
        }

        // Generate token
        const token = await getToken(messaging, {
          vapidKey: 'BN6L7-X1wIaV6QWOufYuVyeVDuyoo0QvsKCzUu3jcCrETjGf7x8jKv6gw8-FduZwH1CbDilLI5IVdJ-04JmMdw8',
        });
        if (token) {
          try {
            let config = {
              method: 'POST',
              url: '/v1/users/registrationToken/Send',
              data: {
                registrationToken: token,
                title: title,
                body: body,
              },
            };
            const response = await axios(config);
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    } else if (permission === 'denied') {
      console.log('Permission denied');
    }
  }

  // Request user permission and register the service worker
  async function initializeMessaging(body: string, title: string) {
    await requestPermission(body, title);
  }

  useEffect(() => {
    const checkOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      console.log(`Network status: ${online ? 'Online' : 'Offline'}`);
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

  useEffect(() => {
    const getBusinessIdFromPath = () => {
      const match = router.asPath.match(/\/l\/([^\/]+)\/login/);
      return match ? match[1] : null;
    };

    const businessId = getBusinessIdFromPath();

    if (businessId) {
      if (router.asPath === `/l/${businessId}/login`) {
        toast.success('Redirecting to lite login page...');
        router.push(`/l/${businessId}/litelogin`);
      }
    }
  }, [router.asPath]);

  return (
    <div>
      <ToastContainer className="z-[999999]" />
      {!isOnline && <div className="bg-red-500 text-center text-white">Please check your internet connection</div>}
      {isOnline && isSlow && <div className="bg-[#ef9b0f] text-center text-white">⚠ Your connection is too slow</div>}
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </div>
  );
}
