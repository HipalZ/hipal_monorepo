import LoadingSpinner from "@/components/atom/loadingSpinner";
import { Suspense, lazy, memo } from "react";

// Dynamic imports

const BusinessData = lazy(() => import("@/components/templates/businessData"));

const Business = () => {
  return <BusinessData />;
};

const MemoBusiness = memo(Business);

export default MemoBusiness;
