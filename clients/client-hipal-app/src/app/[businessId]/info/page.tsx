import dynamic from "next/dynamic";
import { getBusinessData, getPropertyImages } from "@/apis/commonApis/index";
import type { BusinessDetails } from "@/components/types/businessData";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";

const ViewPortContainer = dynamic(
  () =>
    import("@/components/atoms/WidthWrapper").then(
      (mod) => mod.ViewPortContainer,
    ),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const RealEstateLanding = dynamic(
  () =>
    import("@/components/info/RealEstateLanding").then((mod) => mod.default),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

export async function generateMetadata({
  params,
}: {
  params: { businessId: string };
}) {
  const businessData = (await getBusinessData(
    params.businessId,
  )) as BusinessDetails;
  const { name, description, logoUrl } = businessData;
  const metaDescription = description || "Welcome to our business offerings!";

  if (!businessData) {
    return {
      title: "Hotel",
      description: "Hotel page for businesses",
    };
  }

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

const InformationPage = async ({
  params,
  searchParams,
}: {
  params: { businessId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const businessData = (await getBusinessData(
    params.businessId,
  )) as BusinessDetails;
  const userId = typeof searchParams.id === "string" ? searchParams.id : "";
  const propertyImages = await getPropertyImages(businessData.businessId);
  return (
    <ViewPortContainer className="relative w-full mx-auto max-w-screen 2xl:px-[10dvh] bg-[#000000] !text-black overflow-auto">
      <RealEstateLanding
        businessData={businessData}
        propertyImages={propertyImages.data}
        userId={userId}
      />
    </ViewPortContainer>
  );
};

export default InformationPage;
