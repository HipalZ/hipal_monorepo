"use client";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useUserToken } from "@hi/common/src/useUserToken";
import { type ReactNode, Suspense, useEffect, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

const Boundary = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const validateToken = useUserToken((s) => s.validateToken);
  const renderRef = useRef(false);

  useEffect(() => {
    if (renderRef.current) return;

    if (!validateToken()) {
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
