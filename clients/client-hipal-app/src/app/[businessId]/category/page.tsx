import { categoryApis } from "@/apis/category";
import dynamics from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { defaultThemes } from "@/components/utils/helpers";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const CategoryHeader = dynamics(
  () => import("@/components/organisms/category/categoryHeader"),
  {
    ssr: false,
    loading: () => <SkeletonLoader height={250} />,
  },
);
const PageName = dynamics(() => import("@/components/molecules/pageName"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});
const Footer = dynamics(() => import("@/components/molecules/footer"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});
const DishesList = dynamics(
  () => import("@/components/organisms/category/dishesList"),
  {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  },
);
const CategoryPageBtn = dynamics(
  () => import("@/components/molecules/bottomButton/categoryPageBtn"),
  {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  },
);
const TopBackground = dynamics(
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
    <main>
      <div className="relative flex flex-col w-full pb-14">
        <TopBackground specialBanner={data?.business?.specialBannerUrl} />
        <CategoryHeader
          parentCategory={data?.parentCategories || []}
          childCategory={data?.childCategories || []}
        />
        <div>
          <div className="!mt-0 !scroll-smooth">
            <DishesList childCategory={data?.childCategories || []} />
          </div>
          <section className="pt-6 bg-base-100">
            <Footer
              themes={data?.settings || defaultThemes}
              socialMediaLinks={data?.business?.socialMediaLinks}
              footerDescription={data?.business?.footerDescription}
            />
          </section>
          <PageName />
        </div>
      </div>
      <CategoryPageBtn />
    </main>
  );
}
