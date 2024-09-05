import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { fetchCommonData } from "@/apis/commonApis";

export async function generateMetadata() {
  return {
    title: "Qrs",
    description: "Qrs page for business",
  };
}

const QrInvoices = dynamic(() => import("@/components/templates/qrInvoices"), {
  ssr: false,
  loading: () => <SkeletonLoader />,
});

export default async function QrInvoice({
  params,
}: { params: { businessId: string } }) {
  const data = await fetchCommonData(params.businessId);
  return (
    <Suspense fallback={<SkeletonLoader height={200} />}>
      <main className="h-full text-black bg-white min-h-[60rem]">
        <QrInvoices data={data} />
      </main>
    </Suspense>
  );
}
