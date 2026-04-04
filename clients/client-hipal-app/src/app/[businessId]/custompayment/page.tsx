import { businessApis } from "@/apis/explore";
import CustomPayPage from "@/components/templates/customPay";

export const revalidate = 300;

export async function generateMetadata() {
  return {
    title: "Payment",
    description: "Quick payment page",
  };
}

export default async function Page({
  params,
}: { params: { businessId: string } }) {
  const data = await businessApis.all(params.businessId);
  return <CustomPayPage data={data} />;
}
