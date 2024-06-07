import LoadingSpinner from "@/components/atom/loadingSpinner";
import { Suspense, lazy, memo } from "react";

// Dynamic imports

const BusinessData = lazy(() => import('@/components/templates/businessData'));

const Business = memo(() => {
	return <Suspense fallback={<LoadingSpinner />}>
		<BusinessData />
	</Suspense>
});

export default Business
