import { categoryApis } from "@/apis/category";
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
        <TopBackground specialBanner={data?.business?.specialBannerUrl} />
        <CategoryHeader
          parentCategory={data?.parentCategories}
          childCategory={data?.childCategories}
        />
        <div>
          <div className="!mt-0 !scroll-smooth">
            <DishesList
               parentCategory={data?.parentCategories}
               childCategory={data?.childCategories}
            />
          </div>
          <Footer themes={data?.settings || defaultThemes} socialMediaLinks={data?.business?.socialMediaLinks} footerDescription={data?.business?.footerDescription}/>
          <PageName endBannerUrl={data?.business?.endBannerUrl}/>
        </div>
      </div>
      <CategoryPageBtn />
    </>
  );
}
