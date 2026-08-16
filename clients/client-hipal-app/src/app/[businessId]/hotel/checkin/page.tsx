import { getBusinessData } from "@/apis/commonApis";
import { getThemeSettings } from "@/apis/hotel";
import HotelCheckinFooter from "@/components/hotels/room/HotelCheckinFooter";
import HotelCheckinRenderGate from "@/components/hotels/room/HotelCheckinRenderGate";

import type { BusinessDetails } from "@/components/types/businessData";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

export const fetchCache = "force-no-store";

const EmptyLoader = () => null;

const BannerSkeleton = () => (
  <div className="h-[16rem] w-full rounded-[1.25rem] bg-[#E7DDD4]/70" />
);

const CategoryGridSkeleton = () => (
  <section className="grid grid-cols-2 gap-2 pt-2">
    {[0, 1, 2, 3].map((item) => (
      <div
        key={item}
        className="aspect-square rounded-[28px] bg-[#E3D7CB]/70"
      />
    ))}
  </section>
);

export async function generateMetadata({
  searchParams,
}: {
  params: { businessId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const room = typeof searchParams.room === "string" ? searchParams.room : "";

  return {
    title: room ? `Checkin - ${room}` : "Checkin",
    description: room
      ? `Checkin page for ${room}`
      : "Checkin page for businesses",
  };
}

const HotelBackgroundContainer = dynamic(
  () =>
    import("@/components/atoms/WidthWrapper").then(
      (mod) => mod.HotelBackgroundContainer
    ),
  {
    loading: EmptyLoader,
  }
);

const ViewPortContainer = dynamic(
  () =>
    import("@/components/atoms/WidthWrapper").then(
      (mod) => mod.ViewPortContainer
    ),
  {
    loading: EmptyLoader,
  }
);

const RoomCard = dynamic(() => import("@/components/hotels/room/RoomNumber"), {
  loading: BannerSkeleton,
});

const HotelWelcomeCard = dynamic(
  () => import("@/components/hotels/room/RoomWelcome"),
  {
    loading: EmptyLoader,
  }
);

const ChatHotel = dynamic(() => import("@/components/hotels/room/ChatHotel"), {
  loading: EmptyLoader,
});

const ServiceCategoriesSection = dynamic(
  () => import("@/components/hotels/room/ServiceCategoriesSection"),
  {
    loading: CategoryGridSkeleton,
  }
);

const ChatCardSection = dynamic(
  () => import("@/components/hotels/room/ChatCardSection"),
  {
    loading: EmptyLoader,
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
  console.log("businessData", businessData?.menuId);
  if (businessData.outLetType !== "HOTEL") {
    redirect("/not-allowed");
  }
  const room =
    typeof searchParams.room === "string" ? searchParams.room : "hipalz";
  const userId = typeof searchParams.id === "string" ? searchParams.id : "";
  const sessionId =
    typeof searchParams.sessionId === "string" ? searchParams.sessionId : "";
  const themeData = await getThemeSettings(businessData?.businessId);
  const contactPhone =
    businessData.phone ||
    (businessData as BusinessDetails & { phoneNumber?: string }).phoneNumber;

  return (
    <HotelBackgroundContainer overlayOpacity={50}>
      <ViewPortContainer className="relative mx-auto max-w-[30rem] pb-[5rem] bg-gradient-to-br from-[#FEB67680] via-[#FEB67610] to-[#f3ede710]">
        <HotelCheckinRenderGate logoUrl={businessData?.logoUrl} />

        <section className="p-3">
          <RoomCard
            roomNumber={room}
            specialBannerUrl={businessData?.specialBannerUrl}
            logoUrl={businessData?.logoUrl}
            hotelBanners={businessData?.hotelBanners}
            businessData={businessData}
          />
        </section>

        <HotelWelcomeCard
          hotelName={businessData.name}
          logo={businessData.logoUrl}
          room={room}
          businessId={businessData.businessId}
          customLink={params.businessId}
          userID={userId || ""}
          sessionId={sessionId || ""}
        />

        <ChatHotel
          hotelName={businessData.name}
          logo={businessData.logoUrl}
          room={room}
          businessId={businessData.businessId}
          contactPhone={contactPhone}
        />

        <section className="px-2">
          <ServiceCategoriesSection
            menuId={businessData?.menuId}
            businessId={businessData.businessId}
            room={room}
            contactPhone={contactPhone}
          />
        </section>
        <ChatCardSection
          themeData={themeData}
          businessId={businessData.businessId}
        />
        <HotelCheckinFooter socialMediaLinks={businessData.socialMediaLinks} />
      </ViewPortContainer>
    </HotelBackgroundContainer>
  );
};

export default page;
