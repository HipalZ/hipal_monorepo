import { categoryApis } from "@/apis/category";
import { fetchAllBusinessIds } from "@/apis/explore";
import Category from "@/components/templates/category";
import { updateTheme } from "@/components/utils/themes";

export async function generateStaticParams() {
    const businessIds = await fetchAllBusinessIds();
    return businessIds.map((businessId: string) => ({
        businessId: businessId,
    }));
}

async function fetchData(businessId: string) {
    const data = await categoryApis.all(businessId);
    return data;
}

export async function generateMetadata() {
    return {
        title: `Category`,
        description: "Category page for business",
    };
}

export default async function Page({ params }: { params: { businessId: string } }) {
    const data = await fetchData(params.businessId);
    return <Category data={data} />;
}


