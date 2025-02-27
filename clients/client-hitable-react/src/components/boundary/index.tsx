import { type ReactNode, Suspense, useEffect, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";
import { useUserToken } from "@hi/common/src/useUserToken";
import SpinnerMemo from "../atoms/loadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Custom Fallback Component
const ErrorFallback = ({ resetErrorBoundary }: { resetErrorBoundary: () => void }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">An unexpected error occurred. You can try refreshing the page or go back.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={resetErrorBoundary} variant="outline" className="w-full">
              Refresh
            </Button>
            <Button onClick={() => navigate(-1)} variant="default" className="w-full">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Boundary = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const validateToken = useUserToken((s) => s.validateToken);
  const renderRef = useRef(false);

  useEffect(() => {
    if (renderRef.current) return;

    if (!validateToken()) {
      navigate("/");
    }

    renderRef.current = true;
  }, [validateToken, navigate]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<SpinnerMemo />}>{children}</Suspense>
    </ErrorBoundary>
  );
};

export default Boundary;
