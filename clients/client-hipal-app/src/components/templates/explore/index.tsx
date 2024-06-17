"use client"
import { useRouter } from "next/navigation"
import { memo, useEffect, useState } from "react"
import {
    beans,
    bowl,
    bud,
    flower,
    love,
    triangleToDataurl,
    waveToDataUrl,
} from "@/components/atoms/card/pathPattern"
import useLoyaltyData from "@/components/store/useLoyaltyData"
import DishData from "@/components/atoms/dishDescription"
import MainLoyalty from "@/components/atoms/mainLoyalty"
import { useLogin } from "@/components/store/useLogin"
import { PAGE_TYPES, routePaths } from "@/components/utils/routes"
import { IBusinessData } from "@/components/types/businessData"
import Link from "next/link"
import useBusinessDetails from "../../store/useBusinessDetails"
// components import
import MainBackground from "@/components/organisms/explore/mainBackground";
import BottomButton from "@/components/molecules/bottomButton";
import HeroSection from "@/components/organisms/explore/heroSection";
import StoriesComponent from "@/components/organisms/explore/storiesComponent";
import SpecialOffers from "@/components/organisms/explore/specialOffers";
import PopularRestaurant from "@/components/organisms/explore/popularRestaurant";
import SubLoyalty from "@/components/atoms/subLoyalty";
import PageName from "@/components/molecules/pageName";
import Footer from "@/components/molecules/footer"

function Explore({ data }: { data: IBusinessData }) {
    const { loyaltySetting, setLoyaltySetting } = useLoyaltyData()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const router = useRouter()
    const isLogin = useLogin((s) => s.isLogin)
    const setDirection = useLogin((s) => s.setDirection)
    const businessDetails = useBusinessDetails((s) => s.businessDetails)
    const setBusinessDetails = useBusinessDetails((s) => s.setBusinessDetails)

    const openModal = () => {
        setTimeout(() => setIsModalOpen(true), 5000)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }
    const findPattern = (pattern: string) => {
        let value = srcColor.find((item) => item.src.hasOwnProperty(pattern))
        return value?.src
    }
    const srcColor = [
        {
            src: { wave: waveToDataUrl(loyaltySetting?.cardColor, "white").wave },
        },
        {
            src: {
                triangle: triangleToDataurl("white").triangle,
            },
        },
        {
            src: {
                beans: beans(loyaltySetting?.fontColor).beans,
            },
        },
        {
            src: { bud: bud(loyaltySetting?.fontColor).bud },
        },
        {
            src: { bowl: bowl(loyaltySetting?.fontColor).bowl },
        },
        {
            src: { love: love(loyaltySetting?.fontColor).love },
        },
        {
            src: { flower: flower(loyaltySetting?.fontColor).flower },
        },
    ]

    const goToLoyalty = (str: string) => {
        if (!isLogin) {
            setDirection(str)
            return routePaths[PAGE_TYPES.SIGN_UP](data?.business?._id)
        } else {
            setDirection("")
            return routePaths[PAGE_TYPES.LOYALTY](data?.business?._id)
        }
    }

    useEffect(() => {
        if (data?.loyalty?.loyaltyId) {
            openModal()
            setLoyaltySetting(data?.loyalty)
            findPattern(data?.loyalty?.cardPattern)
            setBusinessDetails(data?.business)
        }
    }, [])

    const redirectToMenu = () => {
        router.push(routePaths[PAGE_TYPES.CATEGORY](data?.business?._id))
    }

    return (
        <div className="relative flex flex-col w-full pb-16 ">
            <MainBackground explore={data?.settings?.explore} />

            <div className="z-10 flex flex-col w-full -mt-10 space-y-6 text-4xl shadow-xl bg-base-100 rounded-t-3xl">
                <HeroSection
                    logo={data?.business?.logo}
                    businessName={data?.business?.businessName}
                    businessId={data?.business?._id}
                    tags={data?.business?.tags}
                    description={data?.business?.description}
                    themes={data?.settings?.themes}
                />
                <div className="-my-2">
                    <StoriesComponent highlights={data?.settings?.explore?.highlights} />
                </div>

                <SpecialOffers specialOffers={data?.settings?.explore?.specialOffers} />

                <PopularRestaurant popular={data?.settings?.explore?.popular} />

                {loyaltySetting?._id && (
                    <Link href={`${goToLoyalty("loyalty")}`} passHref>
                        <div className="relative p-4 mx-4 overflow-hidden border rounded-xl border-accent bg-base-200/50">
                            <div className="absolute right-[2rem] -bottom-[1.1rem] bg-white w-[64px] h-[64px]" />
                            <div className="absolute w-[35%] h-full transform rotate-45 bg-base-300 -bottom-[0.8125rem] -right-12" />
                            <SubLoyalty
                                logo={businessDetails?.logo}
                                cardColor={loyaltySetting?.cardColor}
                                fontColor={loyaltySetting?.fontColor}
                                src={findPattern(loyaltySetting?.cardPattern) || beans(loyaltySetting?.fontColor)}
                            />
                        </div>
                    </Link>
                )}

                <PageName endBanner={data?.settings?.themes?.endBanner} />
                <Footer footerText={data?.settings?.themes?.footerText}
                    instagramLink={data?.settings?.themes?.instagramLink}
                    facebookLink={data?.settings?.themes?.facebookLink}
                    youtubeLink={data?.settings?.themes?.youtubeLink}
                    linkedinLink={data?.settings?.themes?.linkedinLink}
                />
            </div>

            <BottomButton onClick={redirectToMenu}>
                <div className="flex flex-row space-x-2 capitalize">Menu</div>
            </BottomButton>
            {isModalOpen && (
                <DishData show={isModalOpen} onClose={() => closeModal()}>
                    <MainLoyalty
                        logo={businessDetails?.logo}
                        cardColor={loyaltySetting?.cardColor}
                        fontColor={loyaltySetting?.fontColor}
                        src={findPattern(loyaltySetting?.cardPattern) || beans(loyaltySetting?.fontColor)}
                        loyaltySetting={data?.loyalty}
                    />
                </DishData>
            )}
        </div>
    )
}

export default memo(Explore)