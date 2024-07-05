import { categoryApis } from "@/apis/category";
import { fetchAllBusinessIds } from "@/apis/explore";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { defaultThemes } from "@/components/utils/helpers";

const CategoryHeader = dynamic(
  () => import("@/components/organisms/category/categoryHeader.client"),
  {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  },
);
const PageName = dynamic(() => import("@/components/molecules/pageName"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});
const Footer = dynamic(() => import("@/components/molecules/footer"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});
const DishesList = dynamic(
  () => import("@/components/organisms/category/dishesList"),
  {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  },
);
const CategoryPageBtn = dynamic(
  () => import("@/components/molecules/bottomButton/categoryPageBtn"),
  {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  },
);
const TopBackground = dynamic(
  () => import("@/components/molecules/topBackground"),
  {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  },
);

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
    title: "Category",
    description: "Category page for business",
  };
}

export default async function Page({
  params,
}: { params: { businessId: string } }) {
  const data = await fetchData(params.businessId);
  return (
    <>
      <div className="relative flex flex-col w-full pb-14">
        <TopBackground themes={data?.settings?.themes} />
        <CategoryHeader
          categories={data?.categories}
          allCategoriesTypes={data?.allCategoriesTypes}
          primaryColor={data?.settings?.themes?.primaryColor || ""}
        />
        <div>
          <div className="!mt-0 !scroll-smooth">
            <DishesList
              allCategoriesTypes={data?.allCategoriesTypes}
              categories={data?.categories || []}
            />
          </div>
          <Footer themes={data?.settings?.themes || defaultThemes} />
          <PageName />
        </div>
      </div>
      <CategoryPageBtn />
    </>
  );
}
