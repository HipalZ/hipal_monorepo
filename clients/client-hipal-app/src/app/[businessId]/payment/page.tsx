import { businessApis } from "@/apis/explore";
import Payment from "@/components/templates/payment";

export async function generateMetadata() {
  return {
    title: "Payment",
    description: "Payment page for businesses",
  };
}

export default async function Page({ params }: { params: { businessId: string } }) {
  const data = await businessApis.all(params.businessId);
  return <Payment data={data} />;
}
