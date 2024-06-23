import useLoyaltyData from "@/components/store/useLoyaltyData"
import Stairs from "@/assets/backgroundStairs.png"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useInView } from "framer-motion";

interface ILoyaltyCard {
	logo: string
	cardColor: string
	fontColor: string
}

const SubLoyalty = ({ logo, cardColor, fontColor }: ILoyaltyCard) => {
	const { loyaltySetting } = useLoyaltyData()
	const [cardPattern, setCardPattern] = useState("")
	const [logos, setLogos] = useState<any>("")
	const ref = useRef(null);
	const isInView = useInView(ref,{once: true});

	useEffect(() => {
		setLogos(loyaltySetting?.logo)
		setCardPattern(loyaltySetting?.cardPattern)
	}, [loyaltySetting])

	return (
		<section className="flex items-center justify-between gap-4">
			<center ref={ref} className="w-full relative p-4 bg-[#6A35FF] overflow-hidden max-w-[200px] h-[16.5rem] rounded-2xl">
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
							<Image src={logos || logo} alt="logo" height={36} width={36} />
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
				<button className="relative z-10 py-1 px-4 rounded-full w-full text-sm bg-[#00000050] text-white mt-4">
					claim Now
				</button>
			</center>
			<center className="w-full p-4 bg-base-200 max-w-[200px] h-[16.5rem] rounded-2xl">
				
			</center>
		</section>
	) 
}

export default SubLoyalty
