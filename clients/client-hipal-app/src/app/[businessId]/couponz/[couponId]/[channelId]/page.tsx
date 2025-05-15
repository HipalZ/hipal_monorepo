import dynamics from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { fetchBusinessData } from "@/apis/couponz";
import type { IBiz } from "@/components/types/businessData";
import { notFound } from "next/navigation";
import { apiRpc } from "@hi/common";

const MainCoupon = dynamics(
  () => import("@/components/templates/couponz/mainCoupon"),
  { loading: () => <SkeletonLoader height={200} />, ssr: false },
);

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata({
  params,
}: {
  params: { businessId: string; couponId: string; channelId: string };
}) {
  const { couponId } = params;

  const couponResponse = await apiRpc.couponz[":couponId"].$get({
    param: { couponId },
  });
  const couponJson = await couponResponse.json();

  if (!couponJson?.data) {
    return notFound();
  }

  const { name, image } = couponJson.data;
  const fallbackDescription = "Check out our latest coupon deals!";

  return {
    title: name || "Couponz",
    description: fallbackDescription,
    openGraph: {
      title: name || "Couponz",
      description: fallbackDescription,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
      type: "website",
    },
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
