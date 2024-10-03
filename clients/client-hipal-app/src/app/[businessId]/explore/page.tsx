import { businessApis } from "@/apis/explore";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import UniquelyDishes from "@/components/organisms/explore/uniquelyDishes";
import type {
  IBannerPayload,
  IBusinessData,
} from "@/components/types/businessData";
import { cn, defaultThemes } from "@/components/utils/helpers";
import dynamics from "next/dynamic";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
// export const revalidate = 600;
//
const AllCouponz = dynamics(
  () => import("@/components/templates/couponz/allCouponz"),
  { loading: () => <SkeletonLoader height={200} /> },
);
const EmblaCarousel2 = dynamics(
  () => import("@/components/atoms/emblaCarousel/emblaCarousel2"),
  { loading: () => <SkeletonLoader height={200} /> },
);
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
          <section className="h-[21rem] overflow-hidden">
            <AllCouponz />
          </section>
          <div className="bg-base-200">
            <div className="h-[40px] rounded-b-[100%] -ml-12 w-[120%] bg-base-100" />
          </div>
          {data?.banners?.some(
            (banner: IBannerPayload) => banner?.isPublished,
          ) && (
            <article className="relative bg-base-200 pb-[3rem]">
              <h2 className="py-4 mt-4 text-2xl font-bold text-center text-primary bg-base-200">
                In Spotlight
              </h2>
              <div className="absolute bottom-0 -translate-x-1/2 transform left-1/2 h-[3rem] w-[125%] bg-primary rounded-t-[100%]" />
              <article
                className={cn(
                  data?.banners?.length === 1 ? "justify-center" : "",
                  "h-[28rem] flex gap-4 bg-base-200 rounded-lg flex-nowrap w-full",
                )}
              >
                <EmblaCarousel2 customCarousel={data?.banners?.length === 1}>
                  {data?.banners?.map((banner, index) => {
                    if (!banner?.isPublished) return null;
                    return (
                      <div
                        key={index.toString()}
                        className={cn(
                          "embla__slide",
                          data?.banners?.length === 1
                            ? "justify-start embla__container"
                            : "",
                        )}
                      >
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
