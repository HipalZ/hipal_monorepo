import { businessApis } from "@/apis/explore";
import PaymentWithCouponz from "@/components/templates/newPayment";

export const revalidate = 300;

export async function generateMetadata() {
  return {
    title: "Payment",
    description: "Payment page for businesses",
  };
}

export default async function Page({
  params,
}: { params: { businessId: string } }) {
  const data = await businessApis.all(params.businessId);
  return <PaymentWithCouponz data={data} />;
}
