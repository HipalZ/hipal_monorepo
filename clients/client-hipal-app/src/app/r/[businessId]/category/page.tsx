import { categoryApis } from "@/apis/category";
import { fetchAllBusinessIds } from "@/apis/explore";
import Category from "@/components/templates/category";

export async function generateStaticParams() {
    const businessIds = await fetchAllBusinessIds();
    return businessIds.map((businessId: string) => ({
        businessId: businessId,
    }));
}

export default async function Page({ params }: { params: { businessId: string } }) {
    const data = await categoryApis.all(params.businessId);
    return <Category data={data} />;
  }
  