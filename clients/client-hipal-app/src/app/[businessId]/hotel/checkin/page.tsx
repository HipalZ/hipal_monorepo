import { getBusinessData } from "@/apis/commonApis";
import { getThemeSettings } from "@/apis/hotel";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import CheckInNavbar from "@/components/hotels/room/CheckInNavbar";
import ServiceCategoriesSection from "@/components/hotels/room/ServiceCategoriesSection";
import type { BusinessDetails } from "@/components/types/businessData";
import dynamic from "next/dynamic";

export const dynamics = "force-dynamic";
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
    params.businessId,
  )) as BusinessDetails;

  if (!businessData) {
    return {
      title: room ? `Checkin - ${room}` : "Checkin",
      description: room
        ? `Checkin page for ${room}`
        : "Checkin page for businesses",
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

const HotelBackgroundContainer = dynamic(
  () =>
    import("@/components/atoms/WidthWrapper").then(
      (mod) => mod.HotelBackgroundContainer,
    ),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const ViewPortContainer = dynamic(
  () =>
    import("@/components/atoms/WidthWrapper").then(
      (mod) => mod.ViewPortContainer,
    ),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const ResponsiveImage = dynamic(
  () => import("@/components/hotels/room/RoomTopSection"),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const RoomCard = dynamic(() => import("@/components/hotels/room/RoomNumber"), {
  loading: () => <SkeletonLoader height={200} />,
});

const HotelWelcomeCard = dynamic(
  () => import("@/components/hotels/room/RoomWelcome"),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const ChatHotel = dynamic(() => import("@/components/hotels/room/ChatHotel"), {
  loading: () => <SkeletonLoader height={200} />,
});

const CheckOutRequest = dynamic(
  () => import("@/components/hotels/room/CheckOutRequest"),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const page = async ({
  params,
  searchParams,
}: {
  params: { businessId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const businessData = (await getBusinessData(
    params.businessId,
  )) as BusinessDetails;
  const room =
    typeof searchParams.room === "string" ? searchParams.room : "hipalz";
  const userId = typeof searchParams.id === "string" ? searchParams.id : "";
  const themeData = await getThemeSettings(businessData?.businessId);

  return (
    <HotelBackgroundContainer overlayOpacity={50}>
      <ViewPortContainer className="relative mx-auto max-w-[30rem] pb-[10rem]">
        <CheckInNavbar room={room} themeData={themeData} />

        <ResponsiveImage
          imageUrl={businessData.endBannerUrl || ""}
          alt="Room Top Section"
        />

        <section className="p-6">
          <RoomCard roomNumber={room} />
        </section>

        <HotelWelcomeCard
          hotelName={businessData.name}
          logo={businessData.logoUrl}
          room={room}
          businessId={businessData.businessId}
          customLink={params.businessId}
          userID={userId || ""}
        />

        <ChatHotel
          hotelName={businessData.name}
          logo={businessData.logoUrl}
          room={room}
          businessId={businessData.businessId}
        />

        <section className="px-6 pb-6">
          <ServiceCategoriesSection businessId={businessData.businessId} />
        </section>
        <CheckOutRequest businessId={businessData.businessId} />
      </ViewPortContainer>
    </HotelBackgroundContainer>
  );
};

export default page;
