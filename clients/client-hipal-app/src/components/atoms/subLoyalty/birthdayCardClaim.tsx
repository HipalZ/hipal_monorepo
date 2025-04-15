import { memo, type RefObject } from 'react'
import { useParams } from 'next/navigation';
import { usePaymentStore } from '@/components/store/usePaymentStore';
import Image from 'next/image'
import Link from 'next/link'
import Lottie from 'lottie-react'
import lottieBirthday from "@/assets/lottie/birthday.json";
import Stairs from "@/assets/backgroundStairs.png";

interface Props {
    ref: RefObject<HTMLDivElement>;
    isInView: boolean;
}

const MemoBirthdayCardClaim = (props: Props) => {
    const { ref } = props
    const customLink = useParams()?.businessId as string;
    const accessToken = localStorage.getItem("accessToken")
    const { setCheckLogin } = usePaymentStore()
    const handleLogin = () => {
        setCheckLogin(true)
    }
    return (
        <>
            <center
                ref={ref}
                className="w-full relative p-4 bg-[#6A35FF] overflow-hidden max-w-[170px] h-[16.5rem] rounded-2xl"
            >
                <div className="text-lg font-semibold text-white">
                    Win Birthday Offers
                </div>
                <figure className="absolute top-[67%] left-[6%] transform -translate-y-[13%] overflow-hidden">
                    <Image width={150} src={Stairs} alt="stars" />
                </figure>
                <center
                >
                    <Lottie
                        animationData={lottieBirthday}
                        loop={true}
                        style={{
                            height: "200px",
                            cursor: "pointer",
                        }}
                    />
                </center>
                {accessToken && (
                    <Link href={`/${customLink}/birthdayTerms`}>
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

const BirthdayCardClaim = memo(MemoBirthdayCardClaim)
export default BirthdayCardClaim