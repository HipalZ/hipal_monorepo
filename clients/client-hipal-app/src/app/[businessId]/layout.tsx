import { fetchCommonData } from "@/apis/commonApis";
import SubscriptionEnded from "@/components/atoms/subscriptionEnded";
import type { BusinessDetails } from "@/components/types/businessData";

export const revalidate = 300;

export default async function BusinessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { businessId: string };
}) {
  const { data } = await fetchCommonData(params.businessId);
  const business = data.business as BusinessDetails;

  if (business?.subscriptionEnded === true) {
    return (
      <SubscriptionEnded businessName={business?.businessName || business?.name} />
    );
  }

  return <>{children}</>;
}
