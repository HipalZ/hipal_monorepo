import { fetchAllBusinessIds, loyaltyApis } from "@/apis/loyalty";
import LoyaltyCardPage from "@/components/templates/loyalty";

export async function generateStaticParams() {
  const businessIds = await fetchAllBusinessIds();
  return businessIds.map((businessId: string) => ({
    businessId: businessId,
  }));
}

export async function generateMetadata() {
  return {
    title: "Loyalty page",
    description: "Loyalty page for businesses",
  };
}

export default async function Page({ params }: { params: { businessId: string } }) {
  
  const data = await loyaltyApis.all(params.businessId);
  return <LoyaltyCardPage data={data} />;
}
