import { fetchAllBusinessIds, loyaltyApis } from "@/apis/loyalty";
import LoyaltyId from "@/components/templates/loyalty/[loyaltyId]";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export async function generateStaticParams() {
  const businessIds = await fetchAllBusinessIds();
  return businessIds.map((businessId: string) => ({
    businessId: businessId,
  }));
}

export async function generateMetadata() {
  return {
    title: "User Loyalty page",
    description: "User Loyalty page for businesses",
  };
}

export default async function Page({
  params,
}: { params: { businessId: string } }) {
  const data = await loyaltyApis.all(params.businessId);
  return <LoyaltyId data={data} />;
}
