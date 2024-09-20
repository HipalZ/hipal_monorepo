import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { Suspense } from "react";

export async function generateMetadata() {
  return {
    title: "Qrs",
    description: "Qrs page for business",
  };
}

export default async function QrInvoice({
  params,
}: { params: { businessId: string } }) {
  return (
    <Suspense fallback={<SkeletonLoader height={200} />}>
      <main>hai</main>
    </Suspense>
  );
}
