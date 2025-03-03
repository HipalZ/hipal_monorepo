import { businessApis } from "@/apis/explore";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import UniquelyDishes from "@/components/organisms/explore/uniquelyDishes";
import type {
  BusinessDetails,
  IBannerPayload,
  IBusinessData,
  IOutlet,
} from "@/components/types/businessData";
import { cn, defaultThemes } from "@/components/utils/helpers";
import { apiRpc } from "@hi/common";
import dynamics from "next/dynamic";
import { Suspense } from "react";

// export const dynamic = "force-dynamic";
// export const fetchCache = "force-no-store";
export const revalidate = 300;
//
const AllCouponz = dynamics(
  () => import("@/components/templates/couponz/allCouponz"),
  { loading: () => <SkeletonLoader height={200} /> },
);
const EmblaCarousel2 = dynamics(
  () => import("@/components/atoms/emblaCarousel/emblaCarousel2"),
  {
    ssr: true,
    loading: () => <SkeletonLoader height={200} />,
  },
);
const BannerLayouts = dynamics(
  () => import("@/components/organisms/explore/bannerNewCards"),
  {
    ssr: true,
    loading: () => <SkeletonLoader height={200} />,
  },
);

const MainBackground = dynamics(
  () => import("@/components/organisms/explore/mainBackground"),
  { ssr: true, loading: () => <SkeletonLoader height={200} /> },
);
const HeroSection = dynamics(
  () => import("@/components/organisms/explore/heroSection"),
  { loading: () => <SkeletonLoader height={200} /> },
);

const Footer = dynamics(() => import("@/components/molecules/footer"), {
  loading: () => <SkeletonLoader height={50} />,
  ssr: true,
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

export async function generateMetadata({
  params,
}: {
  params: { businessId: string };
}) {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  const { businessId } = params;

  let bId = businessId;

  if (!objectIdRegex.test(businessId)) {
    const res = await apiRpc.businesses.n[":customLink"].$get({
      param: { customLink: businessId },
    });
    const response = await res.json() as {
      data: IBusinessData;
      message: string;
      error: boolean;
    };

    bId = response?.data?.businessId;

    if (!bId) {
      return {
        title: "Explore",
        description: "Explore page for businesses",
      };
    }
  }

  try {
    const data = await apiRpc.businesses.outletInfo[":businessId"].$get({
      param: { businessId: bId },
    });
    const json = await data.json();
    const outletInfo = json?.data as IOutlet;

    if (!outletInfo?.name) {
      return {
        title: "Explore",
        description: "Explore page for businesses",
      };
    }

    const { name, description, logoUrl } = outletInfo;
    const metaDescription = description || "Explore our business offerings!";

    return {
      title: name,
      description: metaDescription,
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
    return {
      title: "Explore",
      description: "Explore page for businesses",
    };
  }
}
export default async function Explore({
  params,
}: { params: { businessId: string } }) {
  const data = (await businessApis.all(params.businessId)) as IBusinessData;

  return (
    <Suspense fallback={<SkeletonLoader height={200} />}>
      <main className="relative w-full pb-16 overflow-hidden">
        <MainBackground data={data} />
        <div className="z-10 w-full text-4xl shadow-xl bg-base-100">
          <HeroSection data={data} />
          {/* <MenuIntroduction /> */}
          <SubLoyalty loyalty={data?.loyalty} />

          <AllCouponz />

          {data?.banners?.some(
            (banner: IBannerPayload) => banner?.isPublished,
          ) && (
              <section className="w-full px-4 mt-8 rounded-3xl">
                <article className="relative bg-base-200 rounded-3xl">
                  <h2 className="py-4 mt-4 text-2xl font-bold text-center text-primary bg-base-200 rounded-t-3xl">
                    In Spotlight
                  </h2>
                  <article
                    className={cn(
                      data?.banners?.length === 1 ? "justify-center" : "",
                      "h-[26rem] flex gap-4 bg-base-200 rounded-b-3xl flex-nowrap w-full",
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
        <BottomButton selected={"home"} />
      </main>
    </Suspense>
  );
}
