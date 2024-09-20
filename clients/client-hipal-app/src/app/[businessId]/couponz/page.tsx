import dynamics from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { fetchBusinessData } from "@/apis/couponz";
import type { IBiz } from "@/components/types/businessData";

const MainCoupon = dynamics(
  () => import("@/components/templates/couponz/mainCoupon"),
  { loading: () => <SkeletonLoader height={200} />, ssr: false },
);

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata() {
  return {
    title: "Couponz",
    description: "Couponz page for businesses",
  };
}

export default async function Page({
  params,
}: {
  params: { businessId: string; couponId: string; channelId: string };
}) {
  const data = await fetchBusinessData(params.businessId);
  const business: IBiz = data?.data?.business || {};
  return <MainCoupon business={business} />;
}
