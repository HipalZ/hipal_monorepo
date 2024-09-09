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
import EmblaCarousel2 from "@/components/atoms/emblaCarousel/emblaCarousel2";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
// export const revalidate = 30;
//
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

const GoogleReviews = dynamics(
  () => import("@/components/organisms/explore/googleReviews"),
  { loading: () => <SkeletonLoader height={200} /> },
);

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
    <Suspense fallback={<SkeletonLoader height={200} />}>
      <main className="relative flex flex-col w-full pb-16 overflow-hidden">
        <MainBackground explore={data?.business} />
        <div className="z-10 flex flex-col w-full -mt-10 text-4xl shadow-xl bg-base-100">
          <HeroSection data={data} />
          <div className="bg-base-300">
            <div className="-mt-10 h-[100px] rounded-b-[90%] -ml-12 w-[120%] bg-base-100" />
          </div>
          {data?.banners?.some(
            (banner: IBannerPayload) => banner?.isPublished,
          ) && (
            <article className="bg-base-300">
              <h2 className="py-4 mt-4 text-2xl font-bold text-center text-primary bg-base-300">
                In Spotlight
              </h2>
              <article className="h-[28rem] flex p-2 space-x-4 overflow-x-auto bg-base-300 rounded-lg flex-nowrap">
                <EmblaCarousel2>
                  {data?.banners?.map((banner, index) => {
                    if (!banner?.isPublished) return null;
                    return (
                      <div key={index.toString()} className="embla__slide">
                        <BannerLayouts
                          redirectionId={banner?.redirectionId || ""}
                          redirectionName={banner?.redirectionName || ""}
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
                          redirectionType={banner?.redirectionType || ""}
                        />
                      </div>
                    );
                  })}
                </EmblaCarousel2>
              </article>
            </article>
          )}
          <SubLoyalty loyalty={data?.loyalty} />
          {data?.uniquelyDishes && data?.uniquelyDishes.length > 0 ? (
            <div className="mt-8 overflow-auto">
              <UniquelyDishes uniquelyDishes={data?.uniquelyDishes} />
            </div>
          ) : null}
          <GoogleReviews />
          <Footer
            themes={data?.settings || defaultThemes}
            socialMediaLinks={data?.business?.socialMediaLinks}
            footerDescription={data?.business?.footerDescription}
          />
          <PageName />
        </div>
        <BottomButton />
      </main>
    </Suspense>
  );
}
