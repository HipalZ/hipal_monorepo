import { businessApis } from "@/apis/explore";
import Explore from "@/components/templates/explore";

// removed getStaticPaths

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
