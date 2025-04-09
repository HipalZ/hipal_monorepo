import dynamic from "next/dynamic"
import type { BusinessDetails, IBusinessData } from "@/components/types/businessData"
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader"
import { getInfoForHotel, getThemeSettings } from "@/apis/hotel"
import { getBusinessData } from "@/apis/commonApis"
import { NavBarHotel } from "@/components/hotels/NavBarHotel"
// import {BottomBtnHotel} from "@/components/hotels/BottomBtnHotel"

export const dynamics = "force-dynamic";
export const fetchCache = "force-no-store";

// Correctly import the ViewPortContainer component

const HotelBackgroundContainer = dynamic(
  () => import("@/components/atoms/WidthWrapper").then((mod) => mod.HotelBackgroundContainer),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
)

const ViewPortContainer = dynamic(
  () => import("@/components/atoms/WidthWrapper").then((mod) => mod.ViewPortContainer),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
)

const TopSectionOfHotel = dynamic(
  () => import("@/components/hotels/TopSection").then((mod) => mod.TopSectionOfHotel),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
)

const HotelInfoSection = dynamic(
  () => import("@/components/hotels/HotelInfo").then((mod) => mod.HotelInfoSection),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
)

const BannerSectionHotels = dynamic(
  () => import("@/components/hotels/BannerSectionHotels"),
  {
    loading: () => <SkeletonLoader height={200} />
  },
)

const BottomBtnHotel = dynamic(
  () => import("@/components/hotels/BottomBtnHotel").then((mod) => mod.BottomBtnHotel),
  {
    loading: () => <SkeletonLoader height={200} />
  },
)

export async function generateMetadata({
  params,
}: {
  params: { businessId: string }
}) {

  const businessData = await getBusinessData(params.businessId) as BusinessDetails
  const { name, description, logoUrl } = businessData
  const metaDescription = description || "Welcome to our business offerings!"

  if (!businessData) {
    return {
      title: "Hotel",
      description: "Hotel page for businesses",
    }
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
  }
}

async function getHotelData(businessId: string) {
  try {
    return await getInfoForHotel(businessId)
  } catch (error) {
    console.error("Failed to fetch hotel data:", error)
    return null
  }
}

const Hotel = async ({
  params,
}: { params: { businessId: string } }) => {

  const data = await getHotelData(params.businessId) as IBusinessData
  const { business, banners } = data
  const themeData = await getThemeSettings(business?.businessId)

  return (
    <HotelBackgroundContainer >

      <ViewPortContainer className="relative mx-auto max-w-[30rem]">

        {/* <NavBarHotel logoUrl={business?.logoUrl} businessName={business?.name} /> */}

        <TopSectionOfHotel business={business} height="h-[50vh] md:h-[40vh]" />

        <HotelInfoSection business={business} />

        <BannerSectionHotels banners={banners} />

        <BottomBtnHotel themeData={themeData} />

      </ViewPortContainer>
    </HotelBackgroundContainer>
  )
}

export default Hotel

