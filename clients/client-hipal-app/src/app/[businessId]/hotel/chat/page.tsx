import { getBusinessData } from "@/apis/commonApis";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import Chats from "@/components/hotels/room/Chats";
import type { BusinessDetails } from "@/components/types/businessData";
import nextDynamic from "next/dynamic";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { businessId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const room = typeof searchParams.room === "string" ? searchParams.room : "";
  const businessData = (await getBusinessData(
    params.businessId
  )) as BusinessDetails;

  if (!businessData) {
    return {
      title: room ? `Hotel chat - ${room}` : "Hotel chat",
      description: room
        ? `Hotel chat page for ${room}`
        : "Hotel chat page for businesses",
    };
  }

  const { name, description, logoUrl } = businessData;
  const metaDescription = description || "Welcome to our business offerings!";
  const titleWithRoom = room ? `${name} - ${room}` : name;

  return {
    title: titleWithRoom,
    description: metaDescription,
    icons: {
      icon: logoUrl,
    },
    openGraph: {
      title: titleWithRoom,
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

const HotelBackgroundContainer = nextDynamic(
  () =>
    import("@/components/atoms/WidthWrapper").then(
      (mod) => mod.HotelBackgroundContainer
    ),
  {
    loading: () => <SkeletonLoader height={200} />,
  }
);

const ViewPortContainer = nextDynamic(
  () =>
    import("@/components/atoms/WidthWrapper").then(
      (mod) => mod.ViewPortContainer
    ),
  {
    loading: () => <SkeletonLoader height={200} />,
  }
);

const page = async ({
  params,
  searchParams,
}: {
  params: { businessId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const businessData = (await getBusinessData(
    params.businessId
  )) as BusinessDetails;

  if (businessData.outLetType !== "HOTEL") {
    redirect("/not-allowed");
  }

  const room =
    typeof searchParams.room === "string" ? searchParams.room : "hipalz";
  const contactPhone =
    businessData.phone ||
    (businessData as BusinessDetails & { phoneNumber?: string }).phoneNumber;

  return (
    <HotelBackgroundContainer overlayOpacity={50}>
      <ViewPortContainer className="relative mx-auto max-w-[30rem] pb-[1rem]">
        <Chats
          hotelName={businessData.name}
          logo={businessData.logoUrl}
          room={room}
          businessId={businessData.businessId}
          customLink={params.businessId}
          contactPhone={contactPhone}
        />
      </ViewPortContainer>
    </HotelBackgroundContainer>
  );
};

export default page;
