import { startTransition, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useOwnerLogin } from './components/store/useOwnerLogin';
import MainRouter from './routes';

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
  '/zonesandtables': 'zones_tables',
  '/sales': 'sale',
  '/staff': 'staff',
  '/reports': 'reports',
};

function App() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlow, setIsSlow] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useOwnerLogin((s) => s.isLogin);
  const user = useOwnerLogin((s) => s.user);

  useEffect(() => {
    if (isLoggedIn) {
      const pathSegments = location.pathname.split('/');
      const routeKey = pathSegments.length > 3 ? `/${pathSegments[3]}` : null;
      if (routeKey && user.role !== 'RESTAURANT_OWNER' && routeToPermissionMap[routeKey]) {
        const permissionKey = routeToPermissionMap[routeKey];
        if (!user.accessControl[permissionKey]) {
          toast.error("You don't have access to this page.");
          startTransition(() => {
            navigate('/business');
          });
        }
      }
    }
  }, [isLoggedIn, location.pathname, user.role, user.accessControl]);

  useEffect(() => {
    if (!isLoggedIn) {
      const timeout = setTimeout(() => {
        toast.error('Session TimeOut');
        startTransition(() => {
          navigate('/');
        });
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
    <div className="App">
      {!isOnline && <div className="text-center text-white bg-red-500">Please check your internet connection</div>}
      {isOnline && isSlow && <div className="bg-[#ef9b0f] text-center text-white">⚠ Your connection is too slow</div>}
      <MainRouter />
    </div>
  );
}

export default App;
