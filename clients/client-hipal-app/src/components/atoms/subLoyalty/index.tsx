import useLoyaltyData from "@/components/store/useLoyaltyData"
import { useRef } from "react"
import Image from "next/image"
import { useInView } from "framer-motion";
import Stairs from "@/assets/backgroundStairs.png"
import SignUpBonusBackground from "@/assets/bonuscard/signupBonus.svg"
import Wallet from "@/assets/bonuscard/wallet.png"
import Coin from "@/assets/bonuscard/coin.png"
import { useLogin } from "@/components/store/useLogin";
import Link from "next/link";
import useBusinessDetails from "@/components/store/useBusinessDetails";
interface ILoyaltyCard {
	logo: string
}

const SubLoyalty = ({ logo }: ILoyaltyCard): JSX.Element => {
	const { loyaltySetting } = useLoyaltyData()
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true });
	const customLink = useBusinessDetails((s) => s.businessDetails?.customLink)
	const login = useLogin((s) => s.isLogin)

	return (
		<section className="relative flex items-center justify-center gap-2 px-4 mt-4 overflow-hidden">
			<center ref={ref} className="w-full relative p-4 bg-[#6A35FF] overflow-hidden max-w-[190px] h-[16.5rem] rounded-2xl">
				<div className="text-xl font-semibold text-white">
					{loyaltySetting.setReward}% Coinzback
				</div>
				<figure
					className="absolute top-[67%] left-[6%] transform -translate-y-[13%] overflow-hidden"
				>
					<Image width={150} src={Stairs} alt="stars" />
				</figure>
				<center className="text-base text-white">At every bill</center>
				<center className={`relative pb-4 ${isInView ? "flipping-card" : ""} `}>
					<div
						className="mt-10 overflow-hidden rounded card_up_down"
						style={{
							height: "77px",
							width: "128px",
							backgroundColor: "#FEFAEE",
						}}
					>
						<figure
							className="aspect-square w-[2.5rem] h-[2.5rem] overflow-hidden absolute top-1/2 left-[8%] transform -translate-y-1/2 rounded-full"
						>
							<Image src={logo} alt="logo" height={36} width={36} />
						</figure>

						<figcaption
							style={{
								color: `#183D2E`,
							}}
							className="absolute text-sm transform -translate-x-[20%] -translate-y-[30%] rounded-full aspect-square top-1/2 left-1/2"
						>
							Loyalty card
						</figcaption>
						<div className="h-full w-[0.625rem] absolute top-1/2 right-0 transform -translate-y-1/2 bg-[#183D2E]" />
					</div>
					<div className="bottom_shadow" />
				</center>
				<div className="h-full w-[0.625rem] text-sm absolute top-[30%] right-4 text-white animate-pulse" >✨</div>
				{
					login &&
					<Link href={`/r/${customLink}/loyalty`}>
						<button className="absolute bottom-2 mx-4 left-0 z-10 py-1 px-4 rounded-full w-[80%] text-sm bg-[#00000050] text-white">
							claim Now
						</button>
					</Link>
				}
				{
					!login &&
					<Link href={`/r/${customLink}/user/signup`}>
						<button className="absolute bottom-2 mx-4 left-0 z-10 py-1 px-4 rounded-full w-[80%] text-sm bg-[#00000050] text-white">
							claim Now
						</button>
					</Link>
				}
			</center>
			{
				loyaltySetting?.signUpBonus &&
				<center ref={ref} className="w-full relative bg-[#E63C45] overflow-hidden max-w-[170px] h-[16.5rem] rounded-2xl">
					<div className="pt-4 text-xl font-semibold leading-8 text-white">
						Signup bonus
					</div>
					<div className="px-4 text-sm font-semibold text-white">
						Win {loyaltySetting.signUpBonus} Coinz on your signup
					</div>
					<figure className="absolute bottom-0 z-0 animate-pulse">
						<Image src={SignUpBonusBackground} alt="signup bonus" />
					</figure>
					<figure className="absolute z-0 top-[5rem] left-10 card_up_down">
						<Image width={100} height={100} src={Coin} alt="Coin" />
					</figure>
					<figure className="absolute bottom-6 z-1">
						<Image src={Wallet} alt="Wallet" />
					</figure>
					{
						!login &&
						<Link href={`/r/${customLink}/user/signup`}>
							<button className="absolute bottom-2 mx-4 left-0 z-10 py-1 px-4 rounded-full w-[80%] text-sm bg-[#00000050] text-white">
								Get Now
							</button>
						</Link>
					}
				</center>
			}
		</section>
	)
}

export default SubLoyalty
