import { businessApis, fetchAllBusinessIds } from "@/apis/explore";
import Explore from "@/components/templates/explore";

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
  const data = await businessApis.all(params.businessId);
  return <Explore data={data} />;
}
