import Couponz from "@/components/templates/couponz/singleCoupon";
import ApplyCouponz from "@/components/templates/couponz/applyCouponz";
import BirthdayPopup from "@/components/templates/couponz/occasionPopup";
import Congratulationz from "@/components/templates/couponz/congratulationz";
import SeeMyCouponz from "@/components/templates/couponz/seeMyCouponz";
import PaymentWithCouponz from "@/components/templates/newPayment";
import MainCoupon from "@/components/templates/couponz/mainCoupon";

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
  return <MainCoupon />;
}
