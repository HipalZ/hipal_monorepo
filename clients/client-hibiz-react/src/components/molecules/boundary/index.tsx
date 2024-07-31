"use client";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useUserToken } from "@hi/common/src/useUserToken";
import { type ReactNode, Suspense, useEffect, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Boundary = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const validateToken = useUserToken((s) => s.validateToken);
  const renderRef = useRef(false);

  useEffect(() => {
    if (renderRef.current) return;

    if (!validateToken()) {
      toast.error("Session expired or Invalid key, login again");
      navigate("/login");
    }

    renderRef.current = true;
  }, [validateToken, navigate]);

  return (
    <ErrorBoundary fallback={<LoadingSpinner />}>
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </ErrorBoundary>
  );
};

export default Boundary;
