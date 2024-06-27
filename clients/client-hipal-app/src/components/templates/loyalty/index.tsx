"use client"
import BackButton from "@/components/atoms/backButton"
import {
    beans,
    bowl,
    bud,
    flower,
    love,
    triangleToDataurl,
    waveToDataUrl,
} from "@/components/atoms/card/pathPattern"
import { useLogin } from "@/components/store/useLogin"
import { useRewardHistory } from "@/components/store/useRewardHistory"
import useUserReward from "@/components/store/useUserReward"
import { paths } from "@/components/utils/paths"
import { PAGE_TYPES, routePaths } from "@/components/utils/routes"
import axios from "@/utils/axios"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import MainLoyalty from "@/components/atoms/mainLoyalty"
import DishData from "@/components/atoms/dishDescription"
import { useQuery } from "@tanstack/react-query"
import { IBusinessData } from "@/components/types/businessData"
import PlaceholderImg from "@/components/atoms/placeholder"
import BottomButton from "@/components/molecules/bottomButton";
import { PatternKeys } from "@/components/utils/helpers"
import useBusinessDetails from "@/components/store/useBusinessDetails"
import useLoyaltyData from "@/components/store/useLoyaltyData"
import { GoArrowUpRight } from "react-icons/go"
import CouponzLoyalty from "@/components/atoms/couponzLoyalty"
import Link from "next/link"

interface IuserTotal {
    totalWin?: number;
    totalSave?: number;
    vipLevel?: string;
}

function LoyaltyCardPage({ data }: { data: IBusinessData }) {
    const router = useRouter()
    const userName = useLogin((s) => s.userDetails.name)
    const [HiCode, setHiCode] = useState()
    const [rewards, setRewards] = useState()
    const [userTotalHistory, setUserTotalHistory] = useState<IuserTotal>({});
    const { setRewardHistory } = useRewardHistory()
    const { userDetails } = useLogin()
    const setUserReward = useUserReward((s) => s.setUserReward)
    const [image, setImage] = useState<string>("")
    const [isHiCodeModalOpen, setIsHiCodeModalOpen] = useState(false)
    const [animate, setAnimate] = useState(false)
    const businessDetails = useBusinessDetails((s) => s.businessDetails)
    const loyaltySetting = useLoyaltyData((s) => s.loyaltySetting)

    useEffect(() => {
        const patterns = (cardPattern: PatternKeys, fontColor: string) => {
            const defaultColor = "#FAE8CA"
            fontColor = fontColor || defaultColor

            const src = {
                wave: waveToDataUrl("#000000", "white").wave,
                triangle: triangleToDataurl("white").triangle,
                beans: beans(fontColor).beans,
                bud: bud(fontColor).bud,
                bowl: bowl(fontColor).bowl,
                love: love(fontColor).love,
                flower: flower(fontColor).flower,
            }
            return src[cardPattern]
        }
        patterns(data?.loyalty?.cardPattern, data?.loyalty?.fontColor || '#FAE8CA')
        setImage(patterns(data?.loyalty?.cardPattern, data?.loyalty?.fontColor))
    }, [data?.loyalty, data?.loyalty?.cardPattern, data?.loyalty?.fontColor])

    const getUserReward = async () => {
        if (
            userDetails.phone === "NaN" ||
            Number(userDetails.phone) === 0 ||
            data?.loyalty?.loyaltyId === undefined
        )
            return
        const config = {
            method: "GET",
            url: paths.getUserReward(Number(userDetails.phone), data?.loyalty?.loyaltyId),
        }
        try {
            const response = await axios(config)
            console.log(response?.data?.data);
            if (response?.data?.data) {
                setHiCode(response?.data?.data?.password)
                setRewards(response?.data?.data?.rewards)
                setUserReward(response?.data?.data)
            }
            return response?.data?.data
        } catch (err) {
            console.log(err)
        }
    }

    const getUserTotalRewards = async () => {
        try {

            const config = {
                url: `/v1/users/:id/loyaltyUserHistiry?userPhone=${userDetails?.phone}&loyaltyId=${loyaltySetting?.loyaltyId}`,
                method: 'GET'
            }
            const response = await axios(config)
            console.log('rrr', response.data.data);
            setUserTotalHistory(response.data.data)
            return response.data.data
        } catch (err) {
            console.log(err)
        }
    }

    const getUserRewardHistory = async () => {
        if (
            userDetails.phone === "NaN" ||
            Number(userDetails.phone) === 0 ||
            data?.loyalty?.loyaltyId === undefined
        )
            return
        const config2 = {
            method: "GET",
            url: paths.getUserRewardHistory(Number(userDetails.phone), data?.loyalty?.loyaltyId),
        }
        try {
            const response = await axios(config2)
            if (response?.data?.data) {
                setRewardHistory(response?.data?.data)
            }
            return response?.data?.data
        } catch (err) {
            console.log(err)
        }
    }

    useQuery({
        queryKey: ["userRewardHistory", Number(userDetails.phone), data?.loyalty?.loyaltyId],
        queryFn: getUserReward,
        enabled: !!data?.loyalty?.loyaltyId,
    })

    const getLink = (loyaltyId: string) => {
        getUserRewardHistory()
        return router.push(routePaths[PAGE_TYPES.LOYALTY_BY_ID](businessDetails._id, loyaltyId))
    }

    useEffect(() => {
        setAnimate(true)
        const timer = setTimeout(() => {
            setAnimate(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    useQuery({
        queryKey: ["userTotalRewards", userDetails?.phone, loyaltySetting?.loyaltyId],
        queryFn: getUserTotalRewards,
        enabled: !!loyaltySetting?.loyaltyId && !!userDetails?.phone
    })

    return (
        <>
            <div className="relative flex flex-col w-full pt-4 pb-[5rem] bg-base-100 mb-20">
                <div className="relative overflow-hidden">
                    <div
                        className="mx-6"
                        style={{
                            zIndex: 10,
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <BackButton />
                            <button
                                type="button"
                                onClick={() => getLink(data?.loyalty?.loyaltyId)}
                                className="px-4 py-2 border on_active_bounce bg-base-100 text-primary border-primary rounded-full text-xs"
                            >
                                Get History
                            </button>
                        </div>
                        <br />
                        <div className="bg-primary h-[17rem] -mx-6 rounded-t-3xl pt-4">
                            <center>
                                <Image src={data?.business?.logo || ''} alt="logo" width={95} height={95} />
                                <h3 className="mt-4 text-3xl font-semibold capitalize text-base-100">
                                    {data?.business?.businessName}
                                </h3>
                            </center>
                            <br />
                            <section className="flex text-center justify-around text-base-100">
                                <article className="border-r-2 border-base-100 pr-5">
                                    <h1 className="text-3xl">{userTotalHistory?.totalWin || 0}</h1>
                                    <p>Total win</p>
                                </article>
                                <article className="border-r-2 border-base-100 pr-5">
                                    <h1 className="text-3xl">{userTotalHistory?.totalSave || 0}</h1>
                                    <p>Total saved</p>
                                </article>
                                <article>
                                    <h1 className="text-3xl">Silver</h1>
                                    <p>VIP Level</p>
                                </article>
                            </section>
                        </div>
                    </div>
                    <div className="bg-base-200 h-[20rem]">
                        &nbsp;
                        <center className="text-3xl">My Wallet</center>
                        <div className="px-4 overflow-hidden" />
                        <div className="w-full px-6 bg-base-100">
                            <div
                                onClick={() => setIsHiCodeModalOpen(true)}
                                style={{
                                    backgroundImage: `url(${image})`,
                                    backgroundColor: data?.loyalty?.cardColor || "primary",
                                    backgroundSize: `${data?.loyalty?.cardPattern === "beans" ||
                                        data?.loyalty?.cardPattern === "bowl" ||
                                        data?.loyalty?.cardPattern === "love" ||
                                        data?.loyalty?.cardPattern === "flower" ||
                                        data?.loyalty?.cardPattern === "bud"
                                        ? ""
                                        : "cover"
                                        }`,
                                    backgroundPosition: `${data?.loyalty?.cardPattern === "beans" ||
                                        data?.loyalty?.cardPattern === "bowl" ||
                                        data?.loyalty?.cardPattern === "love" ||
                                        data?.loyalty?.cardPattern === "flower" ||
                                        data?.loyalty?.cardPattern === "bud"
                                        ? "right 5% top 50%"
                                        : ""
                                        }`,
                                    backgroundRepeat: "no-repeat",
                                }}
                                className={`'justify-between' ${animate ? "backInUp" : "tada"} ${data?.loyalty?.cardColor ? data?.loyalty?.cardColor : "bg-primary"
                                    } text-base-content flex flex-col absolute top-0 rounded-2xl w-[60%] mt-[28rem] left-0 right-0 m-auto h-[10rem] border border-1 mb-14 
							transition-transform duration-500 -skew-y-6`}
                            >
                                <>
                                    <div
                                        style={{
                                            maxWidth: "calc(20%)",
                                            whiteSpace: "nowrap",
                                        }}
                                        className="mx-[1rem] mt-[1rem] w-[50px] h-[50px]"
                                    >
                                        {
                                            data?.business?.logo ?
                                                <Image
                                                    src={data?.business?.logo}
                                                    alt="logo"
                                                    height={100}
                                                    width={100}
                                                /> :
                                                <PlaceholderImg />
                                        }
                                    </div>
                                    <h1
                                        style={{
                                            backfaceVisibility: "hidden",
                                            WebkitBackfaceVisibility: "hidden",
                                            color: `${data?.loyalty?.fontColor}`,
                                        }}
                                        className={`${data?.loyalty?.fontColor ? "" : "text-primary-content"
                                            } flex self-center text-3xl font-semibold`}
                                    >
                                        {rewards}{" "}
                                        <span
                                            style={{ color: `${data?.loyalty?.fontColor}` }}
                                            className={`${data?.loyalty?.fontColor ? `text-[${data?.loyalty?.fontColor}]` : "text-primary-content"
                                                } text-sm flex self-center ml-2 `}
                                        >
                                            Coins
                                    </span>
                                    </h1>
                                    <h1
                                        style={{
                                            backfaceVisibility: "hidden",
                                            WebkitBackfaceVisibility: "hidden",
                                            color: `${data?.loyalty?.fontColor}`,
                                        }}
                                        className={`${data?.loyalty?.fontColor ? `text-[${data?.loyalty?.fontColor}]` : "text-primary-content"
                                            } capitalize mx-[1rem] mb-[1rem] flex self-start text-lg `}
                                    >
                                        {userName}
                                    </h1>
                                </>
                            </div>
                        </div>
                    </div>
                    <section className="pt-8 pb-4 text-3xl text-center mb-4">Couponz</section>
                    <section className="mx-6 flex flex-nowrap overflow-x-auto h-[12rem] w-full space-x-4 ">
                        <CouponzLoyalty
                            cardColor="#4D72F5"
                            textColor="#D9D9D9"
                            textContent="Birthday coupon for special"
                        />
                        <CouponzLoyalty
                            cardColor="#8452ef"
                            textColor="#D9D9D9"
                            textContent="Off on your breakfast"
                        />
                        <CouponzLoyalty
                            cardColor="#ffbc97"
                            textColor="#9A3700"
                            textContent="Valentine days"
                        />
                    </section>
                    <section className="p-4 mt-4">
                        <article className="bg-base-200 p-4 rounded-2xl flex items-center justify-between">
                            <div>
                                <h1 className="text-primary text-lg font-semibold">My History and usage</h1>
                                <p className="text-primary text-sm opacity-75">Check your coinz history</p>
                            </div>
                            <span className="text-3xl bg-primary p-2 rounded-full"><GoArrowUpRight color="#fff" /></span>
                        </article>
                        &nbsp;
                        <Link href={`/terms`}>
                        <article className="bg-base-200 p-4 rounded-2xl flex items-center justify-between">
                            <div>
                                <h1 className="text-primary text-lg font-semibold">Terms & Conditions</h1>
                                <p className="text-primary text-sm opacity-75">Read the policies of rewardz at {businessDetails?.businessName}</p>
                            </div>
                            <span className="text-3xl bg-primary p-2 rounded-full"><GoArrowUpRight color="#fff" /></span>
                        </article>
                        </Link>
                    </section>
                </div>
            </div>
            <BottomButton />
            {isHiCodeModalOpen && (
                <DishData show={isHiCodeModalOpen} onClose={() => setIsHiCodeModalOpen(false)}>
                    <MainLoyalty
                        logo={businessDetails?.logo}
                        hiCode={HiCode}
                        cardColor={data?.loyalty?.cardColor}
                        fontColor={data?.loyalty?.fontColor}
                        loyaltySetting={loyaltySetting}
                    />
                </DishData>
            )}
        </>
    )
}

export default LoyaltyCardPage
