import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useUserToken } from "@hi/common/src/useUserToken";
import { type ReactNode, Suspense, useEffect, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Routes that must render for a signed-out visitor.
 *
 * These were only ever reachable by clicking through from the login screen:
 * this guard runs once per mount, so an in-app <Link> never re-triggers it,
 * but pasting the URL did and bounced you to /login. Apple's reviewer opens
 * the support URL cold, so /support has to survive a direct hit.
 */
const PUBLIC_PATHS = ["/login", "/support", "/terms&conditions"];

const isPublicPath = (pathname: string) => {
  // decodeURIComponent so an encoded "&" in /terms&conditions still matches.
  let current = pathname;
  try {
    current = decodeURIComponent(pathname);
  } catch {
    /* malformed escape — fall back to the raw path */
  }
  return PUBLIC_PATHS.some((p) => current.toLowerCase().startsWith(p));
};

const Boundary = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const validateToken = useUserToken((s) => s.validateToken);
  const renderRef = useRef(false);

  useEffect(() => {
    if (renderRef.current) return;

    if (!isPublicPath(location?.pathname || "") && !validateToken()) {
      const from = location?.pathname || "";
      if (from.includes("/app/")) {
        toast.error("Session expired, please login again");
      }
      navigate("/login");
    }

    renderRef.current = true;
  }, [validateToken, navigate, location]);

  return (
    <ErrorBoundary fallback={<LoadingSpinner />}>
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </ErrorBoundary>
  );
};

export default Boundary;
