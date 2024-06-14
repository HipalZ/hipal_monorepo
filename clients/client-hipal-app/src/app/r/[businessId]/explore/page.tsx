import Explore from "@/components/templates/explore";
import { businessApis, fetchAllBusinessIds } from "@/apis/explore";

export async function generateStaticParams() {
  const businessIds = await fetchAllBusinessIds();
  return businessIds.map((businessId: string) => ({
    businessId: businessId,
  }));
}

export async function generateMetadata({ params }: { params: { businessId: string } }) {
  const businessId = params.businessId;
  const data = await businessApis.all(businessId);
  return {
    title: `Explore ${data.business?.businessName}`,
    description: data.settings?.description || "Explore page for businesses",
  };
}

export default async function Page({ params }: { params: { businessId: string } }) {
  
  const data = await businessApis.all(params.businessId);
  return <Explore data={data} />;
}
