import { businessApis } from "@/apis/explore";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import UniquelyDishes from "@/components/organisms/explore/uniquelyDishes";
import type {
  BusinessDetails,
  IBannerPayload,
  IBusinessData,
} from "@/components/types/businessData";
import dynamics from "next/dynamic";

import { cn, defaultThemes } from "@/components/utils/helpers";
import { apiRpc } from "@hi/common";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// export const revalidate = 300;
export const fetchCache = "force-no-store";

// Dynamic Imports with Skeleton Loaders
const AllCouponz = dynamic(
  () => import("@/components/templates/couponz/allCouponz"),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);
const EmblaCarousel2 = dynamic(
  () => import("@/components/atoms/emblaCarousel/emblaCarousel2"),
  {
    ssr: true,
    loading: () => <SkeletonLoader height={200} />,
  },
);
const BannerLayouts = dynamic(
  () => import("@/components/organisms/explore/bannerNewCards"),
  {
    ssr: true,
    loading: () => <SkeletonLoader height={200} />,
  },
);
const MainBackground = dynamic(
  () => import("@/components/organisms/explore/mainBackground"),
  {
    ssr: true,
    loading: () => <SkeletonLoader height={200} />,
  },
);
const HeroSection = dynamic(
  () => import("@/components/organisms/explore/heroSection"),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);
const Footer = dynamic(() => import("@/components/molecules/footer"), {
  loading: () => <SkeletonLoader height={50} />,
  ssr: true,
});
const SubLoyalty = dynamic(() => import("@/components/atoms/subLoyalty"), {
  loading: () => <SkeletonLoader height={50} />,
});
const BottomButton = dynamic(
  () => import("@/components/molecules/bottomButton"),
  {
    loading: () => <SkeletonLoader height={50} />,
  },
);
const BirthdayCard = dynamic(
  () => import("@/components/organisms/explore/birthday/birthdayCard"),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);
const PageName = dynamic(() => import("@/components/molecules/pageName"), {
  loading: () => <SkeletonLoader height={50} />,
});

const BusinessImages = dynamic(() => import("@/components/ThumbnailImages"), {
  loading: () => <SkeletonLoader height={300} />,
});

export async function generateMetadata({
  params,
}: {
  params: { businessId: string };
}) {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  const { businessId } = params;

  if (!objectIdRegex.test(businessId)) {
    try {
      const res = await apiRpc.businesses.n[":customLink"].$get({
        param: { customLink: businessId },
      });
      const response = (await res.json()) as {
        data: BusinessDetails;
        message: string;
        error: boolean;
      };

      const businessData = response?.data;
      if (!businessData) {
        return {
          title: "Explore",
          description: "Explore page for businesses",
        };
      }

      const { name, description, logoUrl } = businessData;
      const metaDescription = description || "Explore our business offerings!";

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
    } catch (error) {
      console.error("Error fetching business metadata:", error);
    }
  }

  return {
    title: "Explore",
    description: "Explore page for businesses",
  };
}

export default async function Explore({
  params,
}: {
  params: { businessId: string };
}) {
  const data = (await businessApis.all(params.businessId)) as IBusinessData;

  // Check if banners exist and are published
  const hasPublishedBanners = data?.banners?.some(
    (banner: IBannerPayload) => banner?.isPublished,
  );

  // Check if unique dishes exist
  const hasUniqueDishes =
    data?.uniquelyDishes && data?.uniquelyDishes.length > 0;

  // Check if banners length is exactly 1
  const hasSingleBanner = data?.banners?.length === 1;

  return (
    <Suspense fallback={<SkeletonLoader height={200} />}>
      <main className="relative w-full pb-16 overflow-hidden">
        <MainBackground data={data} />
        <div className="z-10 w-full text-4xl shadow-xl bg-base-100">
          <BirthdayCard />
          <HeroSection data={data} />
          <AllCouponz />

          {/* Banners Section */}
          {hasPublishedBanners && (
            <section className="w-full px-4 mt-8 rounded-3xl">
              <article className="relative bg-base-200 rounded-3xl">
                <h2 className="py-4 mt-4 text-2xl font-bold text-center text-primary bg-base-200 rounded-t-3xl">
                  In Spotlight
                </h2>
                <article
                  className={cn(
                    hasSingleBanner ? "justify-center" : "",
                    "h-[26rem] flex gap-4 bg-base-200 rounded-b-3xl flex-nowrap w-full",
                  )}
                >
                  <EmblaCarousel2 customCarousel={hasSingleBanner}>
                    {data?.banners?.map((banner, index) => {
                      if (!banner?.isPublished) return null;
                      return (
                        <div
                          key={index.toString()}
                          className={cn(
                            "embla__slide",
                            hasSingleBanner
                              ? "justify-start embla__container"
                              : "",
                          )}
                        >
                          <div className="embla-_parallax">
                            <div className={cn("embla-_parallax__layer")}>
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
                          </div>
                        </div>
                      );
                    })}
                  </EmblaCarousel2>
                </article>
              </article>
            </section>
          )}

          {/* Unique Dishes Section */}
          {hasUniqueDishes && (
            <div className="mt-8 overflow-auto">
              <UniquelyDishes uniquelyDishes={data?.uniquelyDishes} />
            </div>
          )}
          <SubLoyalty loyalty={data?.loyalty} />

          <BusinessImages businessId={data.business?.businessId} />

          <Footer
            themes={data?.settings || defaultThemes}
            socialMediaLinks={data?.business?.socialMediaLinks}
            footerDescription={data?.business?.footerDescription}
          />
          <PageName />
        </div>
        <BottomButton selected={"home"} />
      </main>
    </Suspense>
  );
}
