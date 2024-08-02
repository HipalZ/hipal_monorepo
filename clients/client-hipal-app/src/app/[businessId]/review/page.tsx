import { businessApis } from "@/apis/explore";
import Review from "@/components/templates/review";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export async function generateMetadata() {
  return {
    title: "Review",
    description: "Review page for businesses",
  };
}

export default async function Page({
  params,
}: { params: { businessId: string } }) {
  const data = await businessApis.all(params.businessId);
  return (
    <main>
      <Review data={data} />
    </main>
  );
}
