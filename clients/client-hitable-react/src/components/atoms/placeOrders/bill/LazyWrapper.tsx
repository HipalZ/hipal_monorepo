import type { FC, ReactNode } from "react";
import { Suspense } from "react";
import SpinnerMemo from "@/components/atoms/loadingSpinner";

interface LazyWrapperProps {
  children: ReactNode;
}

const LazyWrapper: FC<LazyWrapperProps> = ({ children }) => (
  <Suspense fallback={<SpinnerMemo />}>{children}</Suspense>
);

export default LazyWrapper;
