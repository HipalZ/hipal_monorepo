import { businessApis } from "@/apis/explore";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import BannerLayouts from "@/components/organisms/explore/bannerNewCards";
import UniquelyDishes from "@/components/organisms/explore/uniquelyDishes";
import type {
  IBannerPayload,
  IBusinessData,
} from "@/components/types/businessData";
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

const Footer = dynamic(() => import("@/components/molecules/footer"), {
  loading: () => <SkeletonLoader height={50} />,
});

const SubLoyalty = dynamic(() => import("@/components/atoms/subLoyalty"), {
  loading: () => <SkeletonLoader height={50} />,
});
const BottomButton = dynamic(
  () => import("@/components/molecules/bottomButton"),
  { loading: () => <SkeletonLoader height={50} /> },
);
const PageName = dynamic(() => import("@/components/molecules/pageName"), {
  loading: () => <SkeletonLoader height={50} />,
});

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
      <MainBackground explore={data?.business} />
      <div className="z-10 flex flex-col w-full -mt-10 space-y-6 text-4xl shadow-xl bg-base-100 rounded-t-3xl">
        <HeroSection data={data} />
        <Rewards />
        {data?.banners?.map((banner: IBannerPayload, index: number) => {
          return (
            <BannerLayouts
              key={`banner?._id+${index.toString()}`}
              selectedLayout={banner?.layout || ""}
              heading={banner?.heading || ""}
              paragraph={banner?.paragraph || ""}
              callToAction={banner?.callToAction || ""}
              img={{ logo: banner?.bannerImage || "" }}
              selectedColor={{
                bgColor: banner?.backgroundColor || "",
                textColor: banner?.backgroundColor || "",
              }}
              paragraphStyle={{ color: banner?.paragraphColor || "" }}
              buttonStyle={{
                color: banner?.buttonColor || "",
              }}
            />
          );
        })}
        <SubLoyalty loyalty={data?.loyalty} />
        <div className="overflow-auto">
          <UniquelyDishes uniquelyDishes={data?.uniquelyDishes} />
        </div>
        <Footer
          themes={data?.settings || defaultThemes}
          socialMediaLinks={data?.business?.socialMediaLinks}
          footerDescription={data?.business?.footerDescription}
        />
        <PageName endBannerUrl={data?.business?.endBannerUrl} />
      </div>
      <BottomButton />
    </div>
  );
}
