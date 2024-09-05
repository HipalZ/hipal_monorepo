import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { fetchCommonData } from "@/apis/commonApis";

export async function generateMetadata() {
  return {
    title: "Invoices",
    description: "Invoices page for business",
  };
}

const Invoices = dynamic(() => import("@/components/templates/invoices"), {
  ssr: false,
  loading: () => <SkeletonLoader />,
});

export default async function Invoice({
  params,
}: { params: { businessId: string } }) {
  const data = await fetchCommonData(params.businessId);
  return (
    <Suspense fallback={<SkeletonLoader height={200} />}>
      <main className="h-full text-black bg-white min-h-[60rem]">
        <Invoices data={data} />
      </main>
    </Suspense>
  );
}
