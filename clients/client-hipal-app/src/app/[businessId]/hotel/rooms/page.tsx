import dynamic from 'next/dynamic'
import { getBusinessData } from '@/apis/commonApis'
import SkeletonLoader from '@/components/atoms/loader/skeletonLoader'
import type { BusinessDetails } from '@/components/types/businessData'

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

const BottomBtnRoom = dynamic(
    () => import("@/components/hotels/BottomBtnHotel").then((mod) => mod.BottomBtnRoom),
    {
        loading: () => <SkeletonLoader height={200} />,
    },
)

const NavBarHotel = dynamic(
    () => import("@/components/hotels/NavBarHotel").then((mod) => mod.NavBarHotel),
    {
        loading: () => <SkeletonLoader height={200} />,
    },
)

const Room = async ({
    params,
}: {
    params: { businessId: string }
}) => {

 
    return (
        <HotelBackgroundContainer >
            <ViewPortContainer className="relative mx-auto max-w-[30rem] min-h-screen">
                <NavBarHotel text="Room View" hideLogo centerText showBackButton  />
                
                <BottomBtnRoom />
            </ViewPortContainer>
        </HotelBackgroundContainer>

    )
}

export default Room
