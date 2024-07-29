import { loyaltyApis } from "@/apis/loyalty";
import LoyaltyCardPage from "@/components/templates/loyalty";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export async function generateMetadata() {
  return {
    title: "Loyalty page",
    description: "Loyalty page for businesses",
  };
}

export default async function Page({
  params,
}: { params: { businessId: string } }) {
  const data = await loyaltyApis.all(params.businessId);
  return <LoyaltyCardPage data={data} />;
}
