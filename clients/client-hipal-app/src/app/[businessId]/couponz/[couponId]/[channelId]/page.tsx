import dynamics from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { fetchCommonData } from "@/apis/commonApis";

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
}: { params: { businessId: string } }) {
  const data = await fetchCommonData(params.businessId);
  return <MainCoupon data={data?.data?.business} />;
}
