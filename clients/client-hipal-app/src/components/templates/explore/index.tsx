"use client";
import { PatternKeys, createSrcColor } from "@/components/utils/helpers";
import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from 'next/dynamic';
import { IBusinessData } from "@/components/types/businessData";
import useBusinessDetails from "../../store/useBusinessDetails";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useSearchParams } from "next/navigation";
import useTableData from "@/components/store/useTableData";
import { useLogin } from "@/components/store/useLogin";
import { useCart } from "@/components/store/useCart";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

// Dynamically import components
const BottomButton = dynamic(() => import("@/components/molecules/bottomButton"), { loading: () => <SkeletonLoader height={50} /> });
const DishData = dynamic(() => import("@/components/atoms/dishDescription"), { loading: () => <SkeletonLoader height={200} /> });
const Footer = dynamic(() => import("@/components/molecules/footer"), { loading: () => <SkeletonLoader height={50} /> });
const HeroSection = dynamic(() => import("@/components/organisms/explore/heroSection"), { loading: () => <SkeletonLoader height={200} /> });
const MainBackground = dynamic(() => import("@/components/organisms/explore/mainBackground"), { loading: () => <SkeletonLoader height={200} /> });
const MainLoyalty = dynamic(() => import("@/components/atoms/mainLoyalty"), { loading: () => <SkeletonLoader height={50} /> });
const PageName = dynamic(() => import("@/components/molecules/pageName"), { loading: () => <SkeletonLoader height={50} /> });
const PopularRestaurant = dynamic(() => import("@/components/organisms/explore/popularRestaurant"), { loading: () => <SkeletonLoader height={200} /> });
const Rewards = dynamic(() => import("../explore/rewards"), { loading: () => <SkeletonLoader height={50} /> });
const SpecialOffers = dynamic(() => import("@/components/organisms/explore/specialOffers"), { loading: () => <SkeletonLoader height={200} /> });
const SubLoyalty = dynamic(() => import("@/components/atoms/subLoyalty"), { loading: () => <SkeletonLoader height={50} /> });

export default function Explore({ data }: { data: IBusinessData }): JSX.Element {
    const searchParams = useSearchParams();

    const tableName = searchParams?.get('tableName');
    const { setTableName, tableName: storeTableName } = useTableData();
    const { setSelectedPay } = usePaymentStore();
    const { loyaltySetting, setLoyaltySetting } = useLoyaltyData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isLogin = useLogin((s) => s.isLogin);
    const setCart = useCart((s) => s.setCart);
    const businessDetails = useBusinessDetails((s) => s.businessDetails);
    const setBusinessDetails = useBusinessDetails((s) => s.setBusinessDetails);
    const setBusinessData = _useAllBusiness((s) => s.setData);

    const openModal = () => {
        setTimeout(() => setIsModalOpen(true), 5000);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };
    const srcColor = useMemo(() => createSrcColor(loyaltySetting), [loyaltySetting]);
    const findPattern = useCallback((pattern: PatternKeys) => {
        const value = srcColor.find((item) => pattern in item.src);
        return value?.src[pattern as keyof typeof value.src];
    }, [srcColor]);

    useEffect(() => {
        if (data?.loyalty?.loyaltyId) {
            openModal();
            setLoyaltySetting(data?.loyalty);
            findPattern(data?.loyalty?.cardPattern);
        }
        if (data?.business) {
            setBusinessDetails(data.business);
        }
        if (tableName !== null) {
            setTableName(tableName);
        }
        if (storeTableName !== tableName) {
            setCart({});
        }

        setSelectedPay(false);
    }, []);

    useEffect(() => {
        setBusinessData(data);
    }, [data]);

    return (
        <div className="relative flex flex-col w-full pb-16 ">
            <MainBackground explore={data?.settings?.explore} />

            <div className="z-10 flex flex-col w-full -mt-10 space-y-6 text-4xl shadow-xl bg-base-100 rounded-t-3xl">
                <HeroSection data={data} />
                {isLogin && <Rewards />}
                <SpecialOffers explore={data?.settings?.explore} />

                {loyaltySetting?._id && (
                    <section className="py-10 h-[25rem] !mt-0 bg-base-200">
                        <center><h4 className="pb-4 text-2xl font-bold text-base-content">REWARDZ</h4></center>
                        <SubLoyalty logo={businessDetails?.logo} />
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
                <DishData show={isModalOpen} onClose={closeModal}>
                    <MainLoyalty
                        logo={businessDetails?.logo}
                        cardColor={loyaltySetting?.cardColor}
                        fontColor={loyaltySetting?.fontColor}
                        loyaltySetting={data?.loyalty}
                    />
                </DishData>
            )}
        </div>
    );
}
