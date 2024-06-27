"use client"
import { PatternKeys, createSrcColor } from "@/components/utils/helpers";
import { useCallback, useEffect, useMemo, useState } from "react"

import BottomButton from "@/components/molecules/bottomButton";
import DishData from "@/components/atoms/dishDescription"
import Footer from "@/components/molecules/footer"
import HeroSection from "@/components/organisms/explore/heroSection";
import { IBusinessData } from "@/components/types/businessData"
// components import
import MainBackground from "@/components/organisms/explore/mainBackground";
import MainLoyalty from "@/components/atoms/mainLoyalty"
import PageName from "@/components/molecules/pageName";
import PopularRestaurant from "@/components/organisms/explore/popularRestaurant";
import Rewards from "./rewards";
import SpecialOffers from "@/components/organisms/explore/specialOffers";
import SubLoyalty from "@/components/atoms/subLoyalty";
import useBusinessDetails from "../../store/useBusinessDetails"
import useLoyaltyData from "@/components/store/useLoyaltyData"
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useSearchParams } from "next/navigation";
import useTableData from "@/components/store/useTableData";
import { useLogin } from "@/components/store/useLogin";

export default function Explore({ data }: { data: IBusinessData }): JSX.Element {
    const searchParams = useSearchParams()

    const tableName = searchParams?.get('tableName')
    const { setTableName } = useTableData()
    const { setSelectedPay } = usePaymentStore()
    const { loyaltySetting, setLoyaltySetting } = useLoyaltyData()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const isLogin = useLogin((s) => s.isLogin)

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


    useEffect(() => {
        if (data?.loyalty?.loyaltyId) {
            openModal()
            setLoyaltySetting(data?.loyalty)
            findPattern(data?.loyalty?.cardPattern)
        }
        if (data?.business) {
            setBusinessDetails(data.business);
        }
        if(tableName !== null){
            setTableName(tableName)
        }
        setSelectedPay(false)
    }, [])

    return (
        <div className="relative flex flex-col w-full pb-16 ">
            <MainBackground explore={data?.settings?.explore} />

            <div className="z-10 flex flex-col w-full -mt-10 space-y-6 text-4xl shadow-xl bg-base-100 rounded-t-3xl">
                <HeroSection data={data} />
                {
                    isLogin && (
                        <Rewards />
                    )
                }
                <SpecialOffers explore={data?.settings?.explore} />

                {loyaltySetting?._id && (
                    <section className="py-10 h-[25rem] !mt-0 bg-base-200">
                        <center><h4 className="pb-4 text-2xl font-bold text-base-content">REWARDZ</h4></center>
                        <SubLoyalty
                            logo={businessDetails?.logo}
                        />

                    </section>
                )}

                <div className="overflow-auto">
                    <PopularRestaurant popular={data?.settings?.explore?.popular} />
                </div>


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

