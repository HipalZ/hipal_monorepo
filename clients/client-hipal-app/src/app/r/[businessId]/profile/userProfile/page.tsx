import { fetchAllBusinessIds, profileApi } from "@/apis/profile";
import Profile from "@/components/templates/profile/userProfile";

export async function generateStaticParams() {
  const businessIds = await fetchAllBusinessIds();
  return businessIds.map((businessId: string) => ({
    businessId: businessId,
  }));
}

export async function generateMetadata() {
  return {
    title: "Explore",
    description: "Explore page for businesses",
  };
}

export default async function Page({ params }: { params: { businessId: string } }) {
  const data = await profileApi.all(params.businessId);
  return <Profile data={data} />;
}
