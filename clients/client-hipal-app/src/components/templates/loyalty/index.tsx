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
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Gift from "@/assets/gift.png"
import Hundred from "@/assets/100.png"
import Cal from "@/assets/cal.png"
import Cracker from "@/assets/crack.png"
import MainLoyalty from "@/components/atoms/mainLoyalty"
import DishData from "@/components/atoms/dishDescription"
import { useQuery } from "@tanstack/react-query"
import { IBusinessData } from "@/components/types/businessData"
import PlaceholderImg from "@/components/atoms/placeholder"
import RedeemButton from "@/components/atoms/redeemButton"
import { PatternKeys } from "@/components/utils/helpers"
import useBusinessDetails from "@/components/store/useBusinessDetails"
import useLoyaltyData from "@/components/store/useLoyaltyData"

function LoyaltyCardPage({ data }: { data: IBusinessData }) {
    const router = useRouter()
    const params = useParams();
    const userName = useLogin((s) => s.userDetails.name)
    const [HiCode, setHiCode] = useState()
    const [rewards, setRewards] = useState()
    const { setRewardHistory } = useRewardHistory()
    const { userDetails } = useLogin()
    const setUserReward = useUserReward((s) => s.setUserReward)
    const [image, setImage] = useState<string>("")
    const [isHiCodeModalOpen, setIsHiCodeModalOpen] = useState(false)
    const [animate, setAnimate] = useState(false)
    const businessDetails = useBusinessDetails((s) => s.businessDetails)
    const loyaltySetting = useLoyaltyData((s) => s.loyaltySetting)

    useEffect(() => {
        const patterns = (cardPattern:PatternKeys, fontColor:string) => {
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
        patterns(data?.loyalty?.cardPattern, data?.loyalty?.fontColor ||'#FAE8CA')
        setImage(patterns(data?.loyalty?.cardPattern, data?.loyalty?.fontColor))
    }, [data?.loyalty, data?.loyalty?.cardPattern,  data?.loyalty?.fontColor])

    const findPattern = (pattern: string) => {
        const value = srcColor.find((item) => item.src.hasOwnProperty(pattern))
        return value?.src
    }
    const srcColor = [
        {
            src: { wave: waveToDataUrl(data?.loyalty?.cardColor, "white").wave },
        },
        {
            src: {
                triangle: triangleToDataurl("white").triangle,
            },
        },
        {
            src: {
                beans: beans(data?.loyalty?.fontColor).beans,
            },
        },
        {
            src: { bud: bud(data?.loyalty?.fontColor).bud },
        },
        {
            src: { bowl: bowl(data?.loyalty?.fontColor).bowl },
        },
        {
            src: { love: love(data?.loyalty?.fontColor).love },
        },
        {
            src: { flower: flower(data?.loyalty?.fontColor).flower },
        },
    ]

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

    return (
        <>
            <div className="relative flex flex-col w-full pt-4 pb-[5rem] bg-base-100">
                <div className="relative overflow-hidden">
                    <div
                        className="mx-6 pb-[7rem]"
                        style={{
                            zIndex: 10,
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <BackButton />
                            <button
                                type="button"
                                onClick={() => getLink(data?.loyalty?.loyaltyId)}
                                className="px-4 py-2 border on_active_bounce bg-base-100 text-primary border-primary rounded-2xl"
                            >
                                Get History
                            </button>
                        </div>
                        <br />
                        {data?.business?.businessName ? (
                            <h3 className="flex justify-start my-0 mt-4 text-xl font-semibold capitalize text-base-content">
                                {data?.business?.businessName}
                            </h3>
                        ):null}
                        <div className="flex space-x-2">
                            <div className="text-3xl">Yummy coinz card</div>
                            <Image src={Gift} alt="gift" />
                        </div>
                        <div className="flex items-center mt-8 space-x-6 text-center justify-evenly">
                            <div className="w-[8rem] max-w-[10rem] h-[5rem] max-h-[10rem] p-2 rounded-md bg-primary text-primary-content">
                                <div className="text-2xl font-bold">{data?.loyalty?.setClaimAmount}%</div>
                                <div className="text-xs">Redemption on all Bills</div>
                            </div>
                            <div className="w-[8rem] max-w-[10rem] h-[5rem] max-h-[10rem] p-2 rounded-md bg-primary text-primary-content">
                                <div className="text-2xl font-bold">{data?.loyalty?.setReward}%</div>
                                <div className="text-xs">on every payment</div>
                            </div>
                            <div className="w-[8rem] max-w-[10rem] h-[5rem] max-h-[10rem] p-2 rounded-md bg-primary text-primary-content">
                                <div className="text-2xl font-bold">{data?.loyalty?.expiryDate}</div>
                                <div className="text-xs">Valid for whole {data?.loyalty?.expiryDate} days</div>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 overflow-hidden">
                        <div className="absolute w-full scale-125 bg-base-200 h-[8rem] -ml-[2.75rem] rotate-12 mt-[3.4rem]" />
                    </div>

                    <div className="w-full px-6 pt-[6rem] mt-[6rem] bg-base-200">
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
                                        ? "125px 75px"
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
                            className={`'justify-between' ${animate ? "backInUp" : "tada"}  ${data?.loyalty?.cardColor ? data?.loyalty?.cardColor : "bg-primary"
                                } text-base-content flex flex-col absolute top-0 rounded-2xl w-[70%] mt-[20.5rem] left-0 right-0 m-auto h-[10rem] border border-1 mb-14 
							transition-transform duration-500`}
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
                        <div className="pt-4 pb-12 mt-6 text-xl text-center">
                            <div>We reward you for your</div>
                            <div>love for {data?.business?.businessName}</div>
                        </div>
                    </div>

                    <div className="pt-8 pb-4 text-xl text-center">It&#39;s Reward time</div>
                    <div className="space-y-4">
                        <div className="flex flex-row items-center justify-between p-4 mx-6 bg-base-200/70 rounded-xl">
                            <div className="w-[60%]">
                                <div className="pb-2 text-xl font-semibold text-accent">
                                    {data?.loyalty?.setReward}% off Every time
                                </div>
                                <div className="text-xs text-base-content opacity-70">
                                    Get {data?.loyalty?.setReward}% off on every time you pay the bill and will be
                                    added in your wallet for next use
                                </div>
                            </div>
                            <div className="w-[30%]">
                                <Image width={100} height={100} src={Cracker} alt="gift" />
                            </div>
                        </div>
                        <div className="flex flex-row items-center justify-between p-4 mx-6 bg-base-200/70 rounded-xl">
                            <div className="w-[70%]">
                                <div className="pb-2 text-xl font-semibold text-accent">
                                    {data?.loyalty?.setClaimAmount}% Redemption
                                </div>
                                <div className="text-xs text-base-content opacity-70">
                                    Redeem {data?.loyalty?.setClaimAmount}% of yummy coinz collected on every bill
                                </div>
                            </div>
                            <div className="w-[30%]">
                                <Image width={100} height={100} src={Hundred} alt="gift" />
                            </div>
                        </div>
                        <div className="flex flex-row items-center justify-between p-4 mx-6 bg-base-200/70 rounded-xl">
                            <div className="w-[60%]">
                                <div className="pb-2 text-xl font-semibold text-accent">{data?.loyalty?.expiryDate} Days</div>
                                <div className="text-xs text-base-content opacity-70">
                                    All your redeemed coinZ are safe to use for 1 year from the time of redemption
                                </div>
                            </div>
                            <div className="w-[30%]">
                                <Image width={100} height={100} src={Cal} alt="gift" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <RedeemButton setIsHiCodeModalOpen={setIsHiCodeModalOpen} themes={data?.settings?.themes}/>
            {isHiCodeModalOpen && (
                <DishData show={isHiCodeModalOpen} onClose={() => setIsHiCodeModalOpen(false)}>
                    <MainLoyalty
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
