import { businessApis, fetchAllBusinessIds } from "@/apis/explore";
import Review from "@/components/templates/review";

export async function generateStaticParams() {
  const businessIds = await fetchAllBusinessIds();
  return businessIds.map((businessId: string) => ({
    businessId: businessId,
  }));
}

export async function generateMetadata() {
  return {
    title: "Review",
    description: "Review page for businesses",
  };
}

export default async function Page({ params }: { params: { businessId: string } }) {
  const data = await businessApis.all(params.businessId);
  return <Review data={data} />;
}