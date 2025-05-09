import type { BusinessDetails } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import dynamic from "next/dynamic.js";
import { getThemeSettings } from "@/apis/hotel";
import { getBusinessData } from "@/apis/commonApis/index";

const BookingBottomButton = dynamic(
  () => import("@/components/booking/BookingBottomButton"),
  {
    loading: () => <SkeletonLoader height={200} />,
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
              url: logoUrl,
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

const ViewPortContainer = dynamic(
  () =>
    import("@/components/atoms/WidthWrapper").then(
      (mod) => mod.ViewPortContainer,
    ),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const TopSectionOfBooking = dynamic(
  () =>
    import("@/components/booking/TopSectionOfBooking").then(
      (mod) => mod.TopSectionOfBooking,
    ),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const BookingInfoSection = dynamic(
  () =>
    import("@/components/booking/BookingIntro").then(
      (mod) => mod.BookingInfoSection,
    ),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const BusinessImages = dynamic(() => import("@/components/ThumbnailImages"), {
  loading: () => <SkeletonLoader height={300} />,
});

const BookingPage = async ({
  params,
}: {
  params: { businessId: string };
}) => {
  const business = (await getBusinessData(
    params.businessId,
  )) as BusinessDetails;
  const themeData = await getThemeSettings(business?.businessId);

  return (
    <ViewPortContainer className="relative mx-auto max-w-[30rem]">
      <TopSectionOfBooking
        business={business}
        themeData={themeData}
        height="h-[50vh] md:h-[40vh]"
      />
      <BookingInfoSection business={business} />
      <BusinessImages businessId={business?.businessId} />
      <BookingBottomButton />
    </ViewPortContainer>
  );
};

export default BookingPage;
