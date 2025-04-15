import Image from 'next/image';
import { memo, type RefObject, useCallback } from 'react';
import Stairs from "@/assets/backgroundStairs.png";
import ShimmerImage from '../imageshimmer';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUserToken } from '@hi/common/src/useUserToken';
import { usePaymentStore } from '@/components/store/usePaymentStore';

interface Props {
    ref: RefObject<HTMLDivElement>;
    isInView: boolean;
    setCashBackPercentage: number;
    logo: string;
}

const MemoLoyaltyCardClaim = (props: Props) => {
    const { ref, isInView, setCashBackPercentage, logo } = props
    const customLink = useParams()?.businessId as string;
    const accessToken = useUserToken.getState().accessToken;
    const { setCheckLogin } = usePaymentStore();
    const handleLogin = useCallback(() => {
        setCheckLogin(true);
    }, [setCheckLogin]);

    return (
        <>
            <center
                ref={ref}
                className="w-full relative p-4 bg-[#6A35FF] overflow-hidden max-w-[190px] h-[16.5rem] rounded-2xl"
            >
                <div className="text-xl font-semibold text-white">
                    {setCashBackPercentage}% Coinzback
                </div>
                <figure className="absolute top-[67%] left-[6%] transform -translate-y-[13%] overflow-hidden">
                    <Image width={150} src={Stairs} alt="stars" />
                </figure>
                <center className="text-base text-white">At every bill</center>
                <center
                    className={`relative pb-4 ${isInView ? "flipping-card" : ""} `}
                >
                    <div
                        className="mt-10 overflow-hidden rounded card_up_down"
                        style={{
                            height: "77px",
                            width: "128px",
                            backgroundColor: "#FEFAEE",
                        }}
                    >
                        <figure className="aspect-square w-[2.5rem] h-[2.5rem] overflow-hidden absolute top-1/2 left-[8%] transform -translate-y-1/2 rounded-full">
                            <ShimmerImage src={logo} alt="logo" height={36} width={36} />
                        </figure>

                        <figcaption
                            style={{
                                color: "#183D2E",
                            }}
                            className="absolute text-sm transform -translate-x-[20%] -translate-y-[30%] rounded-full aspect-square top-1/2 left-1/2"
                        >
                            Loyalty card
                        </figcaption>
                        <div className="h-full w-[0.625rem] absolute top-1/2 right-0 transform -translate-y-1/2 bg-[#183D2E]" />
                    </div>
                    <div className="bottom_shadow" />
                </center>
                <div className="h-full w-[0.625rem] text-sm absolute top-[30%] right-4 text-white animate-pulse">
                    ✨
                </div>
                {accessToken && (
                    <Link href={`/${customLink}/loyalty`}>
                        <button
                            type="button"
                            className="absolute bottom-2 mx-4 left-0 z-10 py-1 px-4 rounded-full w-[80%] text-sm bg-[#00000050] text-white"
                        >
                            Claim Now
                        </button>
                    </Link>
                )}
                {!accessToken && (
                    <button
                        onClick={handleLogin}
                        type="button"
                        className="absolute bottom-2 mx-4 left-0 z-10 py-1 px-4 rounded-full w-[80%] text-sm bg-[#00000050] text-white"
                    >
                        Claim Now
                    </button>
                )}
            </center>
        </>
    )
}

const LoyaltyCardClaim = memo(MemoLoyaltyCardClaim)
export default LoyaltyCardClaim