import dynamic from "next/dynamic";
import { getBusinessData } from "@/apis/commonApis";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import type { BusinessDetails } from "@/components/types/businessData";
import { getRoomTypes } from "@/apis/hotel";
import { redirect } from "next/navigation";
// import { DisplayRoomTypes } from "@/components/hotels/room/DisplayRoomsHotel"

export const dynamics = "force-dynamic";
export const fetchCache = "force-no-store";
// const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: { businessId: string };
}) {
  const businessData = (await getBusinessData(
    params.businessId
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

const HotelBackgroundContainer = dynamic(
  () =>
    import("@/components/atoms/WidthWrapper").then(
      (mod) => mod.HotelBackgroundContainer
    ),
  {
    loading: () => <SkeletonLoader height={200} />,
  }
);

const ViewPortContainer = dynamic(
  () =>
    import("@/components/atoms/WidthWrapper").then(
      (mod) => mod.ViewPortContainer
    ),
  {
    loading: () => <SkeletonLoader height={200} />,
  }
);

const NavBarHotel = dynamic(
  () =>
    import("@/components/hotels/NavBarHotel").then((mod) => mod.NavBarHotel),
  {
    loading: () => <SkeletonLoader height={200} />,
  }
);

const ResponsiveImage = dynamic(
  () => import("@/components/hotels/room/RoomTopSection"),
  {
    loading: () => <SkeletonLoader height={200} />,
  }
);

const DisplayRoomTypes = dynamic(
  () =>
    import("@/components/hotels/room/DisplayRoomsHotel").then(
      (mod) => mod.DisplayRoomTypes
    ),
  {
    loading: () => <SkeletonLoader height={200} />,
  }
);

const Room = async ({ params }: { params: { businessId: string } }) => {
  const data = await getRoomTypes(params.businessId);
  const { business, roomTypes } = data;
  if (business?.outLetType !== "HOTEL") {
    redirect("/not-allowed");
  }

  return (
    <HotelBackgroundContainer>
      <ViewPortContainer className="relative mx-auto max-w-[30rem] min-h-screen">
        <NavBarHotel
          text="Room Types"
          hideLogo
          hideChat
          centerText
          showBackButton
          businessName={business?.name}
        />
        <ResponsiveImage
          imageUrl={business?.endBannerUrl}
          alt="Room Top Section"
        />
        <DisplayRoomTypes
          roomTypes={roomTypes}
          imageUrl={business?.specialBannerUrl}
        />
      </ViewPortContainer>
    </HotelBackgroundContainer>
  );
};

export default Room;
