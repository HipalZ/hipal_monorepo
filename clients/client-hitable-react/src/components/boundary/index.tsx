import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserToken } from '@hi/common/src/useUserToken';
import { type ReactNode, Suspense, useCallback, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUpdateNotifications } from '../../utils/apiService';
import SpinnerMemo from '../atoms/loadingSpinner';
import { useHiClientZ } from '../store/useHiClientzData';

/** Fallback shown when something blows up */
const ErrorFallback = ({ resetErrorBoundary }: { resetErrorBoundary: () => void }) => {
  const navigate = useNavigate();
  const setAccessToken = useUserToken((s) => s.setAccessToken);
  const setRefreshToken = useUserToken((s) => s.setRefreshToken);
  const setSelectedBiz = useHiClientZ((s) => s.setSelectedBiz);
  const updateNotificationsApi = useUpdateNotifications();

  // One place that clears local state and reloads the app cleanly
  const hardRefresh = useCallback(async () => {
    try {
      setAccessToken('');
      setRefreshToken('');
      setSelectedBiz({});
      await updateNotificationsApi(false);
    } catch {
    } finally {
      resetErrorBoundary();
      window.location.replace('/');
    }
  }, [resetErrorBoundary, setAccessToken, setRefreshToken, setSelectedBiz, updateNotificationsApi]);

  const goHome = useCallback(() => {
    resetErrorBoundary();
    navigate('/');
  }, [navigate, resetErrorBoundary]);

  useEffect(() => {
    const onOnline = () => {
      resetErrorBoundary();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [resetErrorBoundary]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Internet connection lost</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">If your connection dropped or the app crashed, refresh to restart.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={goHome} variant="outline" className="w-full">
              Go Home
            </Button>
            <Button onClick={hardRefresh} className="w-full">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Boundary = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const validateToken = useUserToken((s) => s.validateToken);
  const renderRef = useRef(false);

  // On first mount, kick to login if token is invalid
  useEffect(() => {
    if (renderRef.current) return;
    if (!validateToken()) {
      navigate('/');
    }
    renderRef.current = true;
  }, [validateToken, navigate]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      // When these change, ErrorBoundary resets its internal error state
      resetKeys={[location.pathname, location.search, location.hash]}
    >
      <Suspense fallback={<SpinnerMemo />}>{children}</Suspense>
    </ErrorBoundary>
  );
};

export default Boundary;
