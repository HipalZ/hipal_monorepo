import MainCoupon from "@/components/templates/couponz/mainCoupon";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata() {
  return {
    title: "Couponz",
    description: "Couponz page for businesses",
  };
}

export default async function Page() {
  return <MainCoupon />;
}
