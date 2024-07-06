import { businessApis } from "@/apis/explore";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import type { IBusinessData } from "@/components/types/businessData";
import { defaultThemes } from "@/components/utils/helpers";
import dynamic from "next/dynamic";

const MainBackground = dynamic(
  () => import("@/components/organisms/explore/mainBackground"),
  { loading: () => <SkeletonLoader height={200} /> },
);
const HeroSection = dynamic(
  () => import("@/components/organisms/explore/heroSection"),
  { loading: () => <SkeletonLoader height={200} /> },
);
const Rewards = dynamic(
  () => import("@/components/templates/explore/rewards"),
  { loading: () => <SkeletonLoader height={50} /> },
);
const SpecialOffers = dynamic(
  () => import("@/components/organisms/explore/specialOffers"),
  { loading: () => <SkeletonLoader height={200} /> },
);
const Footer = dynamic(() => import("@/components/molecules/footer"), {
  loading: () => <SkeletonLoader height={50} />,
});

const PageName = dynamic(() => import("@/components/molecules/pageName"), {
  loading: () => <SkeletonLoader height={50} />,
});
const PopularRestaurant = dynamic(
  () => import("@/components/organisms/explore/popularRestaurant"),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);
const SubLoyalty = dynamic(() => import("@/components/atoms/subLoyalty"), {
  loading: () => <SkeletonLoader height={50} />,
});
const BottomButton = dynamic(
  () => import("@/components/molecules/bottomButton"),
  { loading: () => <SkeletonLoader height={50} /> },
);

// removed getStaticPaths

export async function generateMetadata() {
  return {
    title: "Explore",
    description: "Explore page for businesses",
  };
}
export default async function Page({
  params,
}: { params: { businessId: string } }) {
  const data = (await businessApis.all(params.businessId)) as IBusinessData;
  return (
    <div className="relative flex flex-col w-full pb-16 ">
      <MainBackground explore={data?.settings?.explore} />
      <div className="z-10 flex flex-col w-full -mt-10 space-y-6 text-4xl shadow-xl bg-base-100 rounded-t-3xl">
        <HeroSection data={data} />
        <Rewards />
        <SpecialOffers explore={data?.settings?.explore} />
        <SubLoyalty loyalty={data?.loyalty} />
        <div className="overflow-auto">
          <PopularRestaurant popular={data?.settings?.explore?.popular} />
        </div>
        <Footer themes={data?.settings?.themes || defaultThemes} />
        <PageName />
      </div>
      <BottomButton />
    </div>
  );
}
