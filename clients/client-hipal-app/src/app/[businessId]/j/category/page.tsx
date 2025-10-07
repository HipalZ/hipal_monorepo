import dynamics from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import type {
  BusinessDetails
} from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import { getJewelleryData } from "@/apis/jewellery";
// import JewelleryCategoryPageBtn from "../../../../components/jewellery/category/JewelleryCategoryButton";

// export const dynamic = "force-dynamic";
// export const fetchCache = "force-no-store";
export const revalidate = 300;

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

const JewelleryCategoryPageBtn = dynamics(
  () => import("@/components/jewellery/category/JewelleryCategoryButton"),
  {
    ssr: false,
    loading: () => (
      <div className="h-16 text-black">
        {" "}
        <LoadingSpinnerCircle />
      </div>
    ),
  },
);

const JewelleryCategoryMain = dynamics(
  () => import("@/components/jewellery/category/JewelleryCategoryMain"),
  {
    ssr: false,
    loading: () => (
      <div className="h-16 text-black">
        {" "}
        <LoadingSpinnerCircle />
      </div>
    ),
  },
);

const LiveCart = dynamics(
  () => import("@/components/molecules/bottomButton/livecart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-16 text-black">
        {" "}
        <LoadingSpinnerCircle />
      </div>
    ),
  },
);

const TopBackground = dynamics(
  () => import("@/components/molecules/topBackground"),
  {
    ssr: true,
    loading: () => (
      <div className="h-16 text-black">
        {" "}
        <LoadingSpinnerCircle />
      </div>
    ),
  },
);

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
            url: logoUrl,
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

async function fetchData(businessId: string, tableName?: string) {
  const data = await getJewelleryData(businessId);
  return data;
}

export default async function Page({
  params,
}: {
  params: { businessId: string };
}) {
  const { businessId } = params;

  const data = await fetchData(businessId);
  console.log("Fetched Data:", data);

  return (
    <main className="min-h-screen">
      <div className="relative flex flex-col w-full">
        <TopBackground
          specialBanner={data?.business?.categoryTopBannerUrl}
          businessData={data}
        />
        <MenuBannerPage
          timings={data?.timings}
          childCategory={data?.childCategories || []}
        />
        <div className="!mt-0 !scroll-smooth relative z-20">
          <JewelleryCategoryMain
            parentCategory={data?.parentCategories || []}
            childCategory={data?.childCategories || []}
            menuLayout={data?.menuData}
          />
        </div>
      </div>
      <LiveCart />
      <JewelleryCategoryPageBtn menuLayout={data?.menuData} />
    </main>
  );
}
