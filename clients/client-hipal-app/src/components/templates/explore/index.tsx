"use client"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import {
    beans,
} from "@/components/atoms/card/pathPattern"
import BottomButton from "@/components/molecules/bottomButton";
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
import HeroSection from "@/components/organisms/explore/heroSection";
import SpecialOffers from "@/components/organisms/explore/specialOffers";
import PopularRestaurant from "@/components/organisms/explore/popularRestaurant";
import SubLoyalty from "@/components/atoms/subLoyalty";
import PageName from "@/components/molecules/pageName";
import Footer from "@/components/molecules/footer"
import { PatternKeys, createSrcColor } from "@/components/utils/helpers";

function Explore({ data }: { data: IBusinessData }): JSX.Element {

    const { loyaltySetting, setLoyaltySetting } = useLoyaltyData()
    const [isModalOpen, setIsModalOpen] = useState(false)
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
    const srcColor = useMemo(() => createSrcColor(loyaltySetting), [loyaltySetting]);

    const findPattern = useCallback((pattern: PatternKeys) => {
        const value = srcColor.find((item) => pattern in item.src);
        return value?.src[pattern as keyof typeof value.src];
    }, [srcColor]);

    const goToLoyalty = (str: string) => {
        if (!isLogin) {
            setDirection(str)
            return routePaths[PAGE_TYPES.SIGN_UP](data?.business?._id || '')
        } else {
            setDirection("")
            return routePaths[PAGE_TYPES.LOYALTY](data?.business?._id || '')
        }
    }

    useEffect(() => {
        if (data?.loyalty?.loyaltyId) {
            openModal()
            setLoyaltySetting(data?.loyalty)
            findPattern(data?.loyalty?.cardPattern)
        }
        if (data?.business) {
            setBusinessDetails(data.business);
        }
    }, [])

    const redirectToMenu = () => {
        return `/r/${data?.business?._id}/category/`
    }

    return (
        <div className="relative flex flex-col w-full pb-16 ">
            <MainBackground explore={data?.settings?.explore} />

            <div className="z-10 flex flex-col w-full -mt-10 space-y-6 text-4xl shadow-xl bg-base-100 rounded-t-3xl">
                <HeroSection data={data} />
                {/* {
                    data?.settings?.explore?.highlights && (
                        <div className="-my-2">
                            <StoriesComponent highlights={data?.settings?.explore?.highlights} />
                        </div>
                    )
                } */}

                <SpecialOffers explore={data?.settings?.explore} />

                {loyaltySetting?._id && (
                    <section className="py-10 h-[25rem] !mt-0 bg-black">
                        <center><h4 className="pb-4 text-2xl text-white">REWARDZ</h4></center>
                        <div className="relative p-4 overflow-hidden border rounded-xl border-accent ">
                            <SubLoyalty
                                logo={businessDetails?.logo}
                            />
                        </div>

                    </section>
                )}
                
                <PopularRestaurant popular={data?.settings?.explore?.popular} />
                
                <Footer
                    footerText={data?.settings?.themes?.footerText || ""}
                    instagramLink={data?.settings?.themes?.instagramLink || ""}
                    facebookLink={data?.settings?.themes?.facebookLink || ""}
                    youtubeLink={data?.settings?.themes?.youtubeLink || ""}
                    linkedinLink={data?.settings?.themes?.linkedinLink || ""}
                />
                
                <PageName />
            </div>
            <BottomButton />

            {!isModalOpen && (
                <DishData show={isModalOpen} onClose={() => closeModal()}>
                    <MainLoyalty
                        logo={businessDetails?.logo}
                        cardColor={loyaltySetting?.cardColor}
                        fontColor={loyaltySetting?.fontColor}
                        loyaltySetting={data?.loyalty}
                    />
                </DishData>
            )}
        </div>
    )
}

export default memo(Explore)