import { categoryApis } from "@/apis/category";
import dynamics from "next/dynamic";
import { defaultThemes } from "@/components/utils/helpers";
import MainTypes from "@/components/molecules/categoryTypes/mainTypes";
import TopSectionVideo from "@/components/organisms/menuBanner/topSectionVideo";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import type { BusinessDetails } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";

// export const dynamic = "force-dynamic";
// export const fetchCache = "force-no-store";
export const revalidate = 300;

const CategorySkeleton = dynamics(
  () => import("@/components/atoms/progressBar/categoryLoader"),
  {
    ssr: false,
    loading: () => <div className="h-16 text-black"> Loading .....</div>,
  },
);

const MenuBannerPage = dynamics(
  () => import("@/components/organisms/menuBanner"),
  {
    ssr: false,
    loading: () => (
      <div className="h-16 text-black">
        {" "}
        <SkeletonLoader height={200} />
      </div>
    ),
  },
);

const CategoryPageBtn = dynamics(
  () => import("@/components/molecules/bottomButton/categoryPageBtn"),
  {
    ssr: false,
    loading: () => <div className="h-16 text-black"> Loading .....</div>,
  },
);

const LiveCart = dynamics(
  () => import("@/components/molecules/bottomButton/livecart"),
  {
    ssr: false,
    loading: () => <div className="h-16 text-black"> Loading .....</div>,
  },
);

const CategoryHeader = dynamics(
  () => import("@/components/organisms/category/categoryHeader"),
  {
    ssr: false,
    loading: () => <div className="h-16 text-black"> Loading .....</div>,
  },
);
const PageName = dynamics(() => import("@/components/molecules/pageName"), {
  ssr: false,
  loading: () => <CategorySkeleton />,
});
const Footer = dynamics(() => import("@/components/molecules/footer"), {
  ssr: true,
  loading: () => <CategorySkeleton />,
});
const DishesList = dynamics(
  () => import("@/components/organisms/category/dishesList"),
  {
    ssr: false,
    loading: () => <div className="h-16 text-black"> Loading .....</div>,
  },
);

const TopBackground = dynamics(
  () => import("@/components/molecules/topBackground"),
  {
    ssr: true,
    loading: () => <div className="h-16 text-black"> Loading .....</div>,
  },
);

async function fetchData(businessId: string) {
  const data = await categoryApis.all(businessId);
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: { businessId: string };
}) {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  const { businessId } = params;

  if (!objectIdRegex.test(businessId)) {
    const res = await apiRpc.businesses.n[":customLink"].$get({
      param: { customLink: businessId },
    });
    const response = (await res.json()) as unknown as {
      data: BusinessDetails;
      message: string;
      error: boolean;
    };

    const businessData = response?.data;
    if (!businessData) {
      return {
        title: "Category",
        description: "Category page for businesses",
      };
    }

    const { name, description, logoUrl } = businessData;
    const metaDescription = description || "Welcome to our business offerings!";

    return {
      title: name,
      description: metaDescription,
      icons: {
        icon: logoUrl,
      },
      openGraph: {
        title: name,
        description: metaDescription,
        images: [
          {
            url: logoUrl || "https://example.com/fallback-image.jpg",
            width: 1200,
            height: 630,
            alt: name,
          },
        ],
        type: "website",
      },
    };
  }

  return {
    title: "Category",
    description: "Category page for businesses",
  };
}

export default async function Page({
  params,
}: { params: { businessId: string } }) {
  const data = await fetchData(params.businessId);
  return (
    <main>
      <div className="relative flex flex-col w-full pb-14">
        {/* <TopSectionVideo /> */}
        <TopBackground specialBanner={data?.business?.specialBannerUrl || ""} />
        <MenuBannerPage
          timings={data?.timings}
          childCategory={data?.childCategories || []}
        />
        <div className="!mt-0 !scroll-smooth relative z-20">
          <DishesList
            parentCategory={data?.parentCategories || []}
            childCategory={data?.childCategories || []}
            timings={data?.timings}
          />
        </div>
        <section className="pt-6 bg-[#ffffff]">
          <Footer
            themes={data?.settings || defaultThemes}
            socialMediaLinks={data?.business?.socialMediaLinks}
            footerDescription={data?.business?.footerDescription}
          />
        </section>
        <PageName />
      </div>
      <MainTypes
        parentCategory={data?.parentCategories || []}
        childCategory={data?.childCategories || []}
      />

      <LiveCart />
      <CategoryPageBtn />
    </main>
  );
}
