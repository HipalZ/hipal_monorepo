import { businessApis, fetchAllBusinessIds } from "@/apis/explore";
import Payment from "@/components/templates/payment";
import { updateTheme } from "@/components/utils/themes";

export async function generateStaticParams() {
  const businessIds = await fetchAllBusinessIds();
  return businessIds.map((businessId: string) => ({
    businessId: businessId,
  }));
}

export async function generateMetadata() {
  return {
    title: `Payment`,
    description: "Payment page for businesses",
  };
}

export default async function Page({ params }: { params: { businessId: string } }) {
  
  const data = await businessApis.all(params.businessId);
  updateTheme(data?.settings?.themes);
  return <Payment data={data} />;
}
