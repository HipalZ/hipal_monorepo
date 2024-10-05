import { categoryApis } from "@/apis/category";
import dynamics from "next/dynamic";
import { defaultThemes } from "@/components/utils/helpers";
import CategorySkeleton from "@/components/atoms/progressBar/categoryLoader";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
// export const revalidate = 600;

const CategoryHeader = dynamics(
  () => import("@/components/organisms/category/categoryHeader"),
  {
    ssr: false,
    loading: () => <CategorySkeleton />,
  },
);
const PageName = dynamics(() => import("@/components/molecules/pageName"), {
  ssr: false,
  loading: () => <CategorySkeleton />,
});
const Footer = dynamics(() => import("@/components/molecules/footer"), {
  ssr: false,
  loading: () => <CategorySkeleton />,
});
const DishesList = dynamics(
  () => import("@/components/organisms/category/dishesList"),
  {
    ssr: false,
    loading: () => <CategorySkeleton />,
  },
);
const CategoryPageBtn = dynamics(
  () => import("@/components/molecules/bottomButton/categoryPageBtn"),
  {
    ssr: false,
    loading: () => <CategorySkeleton />,
  },
);
const TopBackground = dynamics(
  () => import("@/components/molecules/topBackground"),
  {
    ssr: false,
    loading: () => <CategorySkeleton />,
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
        <CategoryHeader childCategory={data?.childCategories || []} />
        <div className="!mt-0 !scroll-smooth">
          <DishesList
            parentCategory={data?.parentCategories || []}
            childCategory={data?.childCategories || []}
            timings={data?.timings}
          />
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
      <CategoryPageBtn />
    </main>
  );
}
