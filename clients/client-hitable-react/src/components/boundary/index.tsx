"use client";
import { type ReactNode, Suspense, useEffect, useRef } from "react";

import { ErrorBoundary } from "react-error-boundary";
import SpinnerMemo from "../atoms/loadingSpinner";
import { useNavigate } from "react-router-dom";
import { useUserToken } from "@hi/common/src/useUserToken";
import toast from "react-hot-toast";

const Boundary = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const validateToken = useUserToken((s) => s.validateToken);
  const renderRef = useRef(false);

  useEffect(() => {
    if (renderRef.current) return;

    if (!validateToken()) {
//       toast.error("Session expired, please login again");
      navigate("/");
    }

    renderRef.current = true;
  }, [validateToken, navigate]);

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Suspense fallback={<SpinnerMemo />}>{children}</Suspense>
    </ErrorBoundary>
  );
};

export default Boundary;
