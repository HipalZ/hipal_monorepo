import axios from '@/axios';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import { PAGE_TYPES, routePaths } from '@/components/utils/routes';
import '@/styles/globals.css';
import { Ubuntu } from '@next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import NextNProgress from 'nextjs-progressbar';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ubuntu = Ubuntu({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-ubuntu',
});

interface AccessControl {
  dish: boolean;
  staff: boolean;
  loyalty: boolean;
  sale: boolean;
  reports: boolean;
  zones_tables: boolean;
}
const routeToPermissionMap: { [key: string]: keyof AccessControl } = {
  '/items': 'dish',
  '/loyalty': 'loyalty',
  '/menu': 'zones_tables',
  '/sales': 'sale',
  '/staff': 'staff',
  '/reports': 'reports',
};
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
export default function App({ Component, pageProps }: AppProps) {
  const { phoneNumber, password, setIsLogin, setUser } = useOwnerLogin();
  const router = useRouter();
  const isLoggedIn = useOwnerLogin((s) => s.isLogin);
  const user = useOwnerLogin((s) => s.user);
  const [isOnline, setIsOnline] = useState(true);
  const [isSlow, setIsSlow] = useState(false);
  useEffect(() => {
    const result = async () => {
      try {
        const config = {
          method: 'POST',
          url: '/v1/users/Owner/Login',
          data: {
            phone: phoneNumber,
            password: password,
          },
        };

        const user = await axios(config);
        const isData = user?.data && Object.keys(user?.data)?.length > 0;
        if (isData) {
          setUser(user.data);
        }
        if (user.status === 200) {
          setIsLogin(true);
          router.push(routePaths[PAGE_TYPES.BUSINESS]());
        }
      } catch (err: any) {}
    };
    if (isLoggedIn && router.pathname === '/') {
      result();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      const pathSegments = router.pathname.split('/');
      const routeKey = pathSegments.length > 3 ? `/${pathSegments[3]}` : null;
      if (routeKey && user.role !== 'RESTAURANT_OWNER' && routeToPermissionMap[routeKey]) {
        const permissionKey = routeToPermissionMap[routeKey];
        if (!user.accessControl[permissionKey]) {
          toast.error("You don't have access to this page.");
          router.push('/business');
          return;
        }
      }
    }
  }, [isLoggedIn, router, user.role, user.accessControl]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(function (registration) {
          console.log('ServiceWorker registration successful with scope:', registration.scope);
        })
        .catch(function (error) {
          console.log('ServiceWorker registration failed:', error);
        });
    }
  }, []);

  useEffect(() => {
    document.body.style.overscrollBehaviorY = 'none';

    return () => {
      document.body.style.overscrollBehaviorY = '';
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      const timeout = setTimeout(() => {
        toast.error('Session TimeOut');
        router.push('/');
      }, 60000);

      return () => clearTimeout(timeout);
    }
  }, [isLoggedIn]);

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
  return (
    <div className={`${ubuntu.variable} font-sans`}>
      {/* <!-- End Google Tag Manager (noscript) --> */}
      <Script id="google-analytics" strategy="afterInteractive">{`(function (w, d, s, l, i) {
				w[l] = w[l] || [];
				w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
				var f = d.getElementsByTagName(s)[0],
					j = d.createElement(s),
					dl = l != 'dataLayer' ? '&l=' + l : '';
				j.async = true;
				j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
				f.parentNode.insertBefore(j, f);
			})(window, document, 'script', 'dataLayer', 'GTM-57HCB68')`}</Script>
      <Head>
        {/* Disabling zoom on two finger zoom in or out */}
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <ToastContainer />
      {!isOnline && <div className="bg-red-500 text-center text-white">Please check your internet connection</div>}
      {isOnline && isSlow && <div className="bg-[#ef9b0f] text-center text-white">⚠ Your connection is too slow</div>}
      <QueryClientProvider client={queryClient}>
        <NextNProgress color={'hsl(var(--p))'} />
        <Component {...pageProps} />
      </QueryClientProvider>
    </div>
  );
}
