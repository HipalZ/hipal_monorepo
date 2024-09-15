import { businessApis } from "@/apis/explore";
import PaymentWithCouponz from "@/components/templates/newPayment";
import Payment from "@/components/templates/payment";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
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
  return (
    <main>
      <PaymentWithCouponz data={data} />
    </main>
  );
}
