import { businessApis } from "@/apis/explore";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import UniquelyDishes from "@/components/organisms/explore/uniquelyDishes";
import type {
  IBannerPayload,
  IBusinessData,
} from "@/components/types/businessData";
import { defaultThemes } from "@/components/utils/helpers";
import dynamics from "next/dynamic";
import { Suspense } from "react";
import EmblaCarousel from "@/components/atoms/emblaCarousel";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
// export const revalidate = 30;

const BannerLayouts = dynamics(
  () => import("@/components/organisms/explore/bannerNewCards"),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const MainBackground = dynamics(
  () => import("@/components/organisms/explore/mainBackground"),
  { loading: () => <SkeletonLoader height={200} /> },
);
const HeroSection = dynamics(
  () => import("@/components/organisms/explore/heroSection"),
  { loading: () => <SkeletonLoader height={200} /> },
);
const Rewards = dynamics(
  () => import("@/components/templates/explore/rewards"),
  { loading: () => <SkeletonLoader height={50} /> },
);

const Footer = dynamics(() => import("@/components/molecules/footer"), {
  loading: () => <SkeletonLoader height={50} />,
});

const SubLoyalty = dynamics(() => import("@/components/atoms/subLoyalty"), {
  loading: () => <SkeletonLoader height={50} />,
});
const BottomButton = dynamics(
  () => import("@/components/molecules/bottomButton"),
  { loading: () => <SkeletonLoader height={50} /> },
);
const PageName = dynamics(() => import("@/components/molecules/pageName"), {
  loading: () => <SkeletonLoader height={50} />,
});

// removed getStaticPaths

export async function generateMetadata() {
  return {
    title: "Explore",
    description: "Explore page for businesses",
  };
}
export default async function Explore({
  params,
}: { params: { businessId: string } }) {
  const data = (await businessApis.all(params.businessId)) as IBusinessData;

  return (
    <div className="relative flex flex-col w-full pb-16 overflow-hidden">
      <Suspense fallback={<SkeletonLoader height={300} count={1} />}>
        <MainBackground explore={data?.business} />
      </Suspense>
      <div className="z-10 flex flex-col w-full -mt-10 text-4xl shadow-xl bg-base-100 rounded-t-3xl">
        <Suspense fallback={<SkeletonLoader height={300} count={1} />}>
          <HeroSection data={data} />
        </Suspense>
     
        <div className="bg-base-200">
          <div className="-mt-10 h-[100px] rounded-b-[90%] -ml-12 w-[120%] bg-base-100" />
        </div>
        {data?.banners?.some(
          (banner: IBannerPayload) => banner?.isPublished,
        ) && (
          <Suspense fallback={<SkeletonLoader height={300} count={1} />}>
            <article className="bg-base-200">
              <h2 className="mt-4 text-2xl font-bold text-center bg-base-200">
                In Spotlight
              </h2>
              <article className="h-[28rem] gap-4 flex p-2 space-x-4 overflow-x-auto bg-base-200 rounded-lg flex-nowrap">
                <EmblaCarousel>
                  {data?.banners?.map(
                    (banner: IBannerPayload, index: number) => {
                      if (banner?.isPublished === false) return null;
                      return (
                        <BannerLayouts
                          redirectionId={banner?.redirectionId || ""}
                          redirectionName={banner?.redirectionName || ""}
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
                          paragraphStyle={{
                            color: banner?.paragraphColor || "",
                          }}
                          buttonStyle={{
                            color: banner?.buttonColor || "",
                            buttonColor: banner?.buttonTextColor || "",
                          }}
                        />
                      );
                    },
                  )}
                </EmblaCarousel>
              </article>
            </article>
          </Suspense>
        )}
        <Suspense fallback={<SkeletonLoader height={300} count={1} />}>
          <SubLoyalty loyalty={data?.loyalty} />
        </Suspense>
        {data?.uniquelyDishes && data?.uniquelyDishes.length > 0 ? (
          <div className="mt-12 overflow-auto">
            <Suspense fallback={<SkeletonLoader height={300} count={1} />}>
              <UniquelyDishes uniquelyDishes={data?.uniquelyDishes} />
            </Suspense>
          </div>
        ) : null}
        <Suspense fallback={<SkeletonLoader height={300} count={1} />}>
          <Footer
            themes={data?.settings || defaultThemes}
            socialMediaLinks={data?.business?.socialMediaLinks}
            footerDescription={data?.business?.footerDescription}
          />
        </Suspense>
        <Suspense fallback={<SkeletonLoader height={300} count={1} />}>
          <PageName endBannerUrl={data?.business?.endBannerUrl} />
        </Suspense>
      </div>
      <Suspense fallback={<SkeletonLoader height={50} count={1} />}>
        <BottomButton />
      </Suspense>
    </div>
  );
}
