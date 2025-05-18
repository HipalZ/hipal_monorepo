import { businessApis } from "@/apis/explore";
import type {
  BusinessDetails,
  IBannerPayload,
  IBusinessData,
} from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { cn, defaultThemes } from "@/components/utils/helpers";

// export const dynamic = "force-dynamic";
// export const fetchCache = "force-no-store";
export const revalidate = 300;

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
    const response = (await res.json()) as {
      data: BusinessDetails;
      message: string;
      error: boolean;
    };

    const businessData = response?.data;
    if (!businessData) {
      return {
        title: "Services",
        description: "Services page for businesses",
      };
    }

    const { name, description, logoUrl } = businessData;
    const metaDescription = description || "Services our business offerings!";

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
    title: "Services",
    description: "Services page for businesses",
  };
}

const MainBackground = dynamic(
  () => import("@/components/organisms/explore/mainBackground"),
  { loading: () => <SkeletonLoader height={200} /> },
);

const HeroSection = dynamic(
  () => import("@/components/organisms/explore/heroSection"),
  { loading: () => <SkeletonLoader height={200} /> },
);

const SubLoyalty = dynamic(() => import("@/components/atoms/subLoyalty"), {
  loading: () => <SkeletonLoader height={200} />,
});

const Footer = dynamic(() => import("@/components/molecules/footer"), {
  loading: () => <SkeletonLoader height={200} />,
});

const AllCouponz = dynamic(
  () => import("@/components/templates/couponz/allCouponz"),
  { loading: () => <SkeletonLoader height={200} /> },
);

const EmblaCarousel2 = dynamic(
  () => import("@/components/atoms/emblaCarousel/emblaCarousel2"),
  { loading: () => <SkeletonLoader height={200} /> },
);
const BannerLayouts = dynamic(
  () => import("@/components/organisms/explore/bannerNewCards"),
  { loading: () => <SkeletonLoader height={200} /> },
);

const ServiceBottomButton = dynamic(
  () => import("@/components/molecules/bottomButton/ServiceButton"),
  { loading: () => <SkeletonLoader height={200} /> },
);

const BusinessImages = dynamic(() => import("@/components/ThumbnailImages"), {
  loading: () => <SkeletonLoader height={300} />,
});

const Services = async ({
  params,
}: {
  params: { businessId: string };
}) => {
  const data = (await businessApis.all(params.businessId)) as IBusinessData;

  return (
    <Suspense fallback={<SkeletonLoader height={200} />}>
      <main className="relative w-full pb-16 overflow-hidden ">
        <MainBackground data={data} />
        <div className="z-10 w-full text-4xl shadow-xl bg-base-100">
          <HeroSection data={data} />
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
          <SubLoyalty loyalty={data?.loyalty} />

          <BusinessImages businessId={data.business?.businessId} />
          <Footer
            themes={data?.settings || defaultThemes}
            socialMediaLinks={data?.business?.socialMediaLinks}
            footerDescription={data?.business?.footerDescription}
          />
          <ServiceBottomButton />
        </div>
      </main>
    </Suspense>
  );
};

export default Services;
