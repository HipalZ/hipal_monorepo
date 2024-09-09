import Couponz from "@/components/templates/couponz";
import ApplyCouponz from "@/components/templates/couponz/applyCouponz";
import BirthdayPopup from "@/components/templates/couponz/birthdayPopup";
import Congratulationz from "@/components/templates/couponz/congratulationz";
import SeeMyCouponz from "@/components/templates/couponz/seeMyCouponz";
import PaymentWithCouponz from "@/components/templates/newPayment";

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
  return <Congratulationz />;
}
