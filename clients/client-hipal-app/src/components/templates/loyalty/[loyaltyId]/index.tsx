"use client"
import BackButton from "@/components/atoms/backButton"
import React, { useEffect, useState } from "react"
import {
	beans,
	bowl,
	bud,
	flower,
	love,
	triangleToDataurl,
	waveToDataUrl,
} from "@/components/atoms/card/pathPattern"
import wallet from "@/assets/svg/wallet.svg"
import Image from "next/image"
import { useRewardHistory } from "@/components/store/useRewardHistory"
import type { IBusinessData, UserData } from "@/components/types/businessData"
import { useParams } from "next/navigation"

const LoyaltyId = ({data}:{data:IBusinessData}) => {
	const params = useParams()
	const loyaltyId = params?.loyaltyId || ''
	const items = useRewardHistory((s) => s.rewardHistory?.items)
	const [itemData, setItemData] = useState<UserData | undefined>(items)
	const [image, setImage] = useState<any>("")
	const [claimImage, setClaimImage] = useState("")

	useEffect(() => {
		setItemData(items)
	}, [items, loyaltyId])

	useEffect(() => {
		if (data?.loyalty?.loyaltyId) {
			const patterns = (cardPattern:string, fontColor:string) => {
				fontColor = fontColor
				const src = {
					wave: waveToDataUrl(fontColor, "white").wave,
					triangle: triangleToDataurl("white").triangle,
					beans: beans(fontColor).beans,
					bud: bud(fontColor).bud,
					bowl: bowl(fontColor).bowl,
					love: love(fontColor).love,
					flower: flower(fontColor).flower,
				}
				// return the value from src object that corresponds to cardPattern key
				return src[cardPattern]
			}
			patterns(data?.loyalty?.cardPattern, data?.loyalty?.fontColor)
			setImage(patterns(data?.loyalty?.cardPattern, data?.loyalty?.fontColor))
			setClaimImage(
				patterns(data?.loyalty?.cardPattern, data?.settings?.themes?.secondaryColor.substring(1)),
			)
		}
	}, [data?.loyalty, data?.loyalty?.cardPattern, data?.loyalty?.fontColor])

	return (
		<div className="relative flex flex-col w-full pb-16 mt-6 syne-font">
			<div className="mx-6">
				<BackButton />
				<h1 className="mt-5">
					{data?.business?.businessName && (
						<span className="text-lg font-semibold capitalize text-base-content">
							Rewards with {data?.business?.businessName}
						</span>
					)}
				</h1>
				{Array.isArray(itemData) ? (
					itemData.map((item, index) => {
						return item.status === "plus" ? (
							<div
								key={index}
								style={{
									backgroundImage: `url(${image})`,
									backgroundSize: `${data?.loyalty?.cardPattern === "beans" ||
											data?.loyalty?.cardPattern === "bowl" ||
											data?.loyalty?.cardPattern === "love" ||
											data?.loyalty?.cardPattern === "flower" ||
											data?.loyalty?.cardPattern === "bud"
											? "75px 50px"
											: "cover"
										}`,
									backgroundPosition: `${data?.loyalty?.cardPattern === "beans" ||
											data?.loyalty?.cardPattern === "bowl" ||
											data?.loyalty?.cardPattern === "love" ||
											data?.loyalty?.cardPattern === "flower" ||
											data?.loyalty?.cardPattern === "bud"
											? "right 25% top 50%"
											: ""
										}`,
									backgroundRepeat: "no-repeat",
								}}
								className={`${data?.loyalty?.cardColor ? `bg-[${data?.loyalty?.cardColor}]` : "bg-primary"
									} bg-cover bg-center h-[9rem] flex justify-between items-center px-6 mt-5 w-full rounded-lg border border-1 border-primary`}
							>
								<div>
									<div
										className={`flex items-center ${data?.loyalty?.fontColor ? `text-[${data?.loyalty?.fontColor}]` : "text-base-100"
											} `}
									>
										<Image
											src={wallet}
											alt="wallet"
											className={`mr-4 ${data?.loyalty?.fontColor ? `text-[${data?.loyalty?.fontColor}]` : "text-base-100"}`}
										/>
										<h1
											className={`${data?.loyalty?.fontColor ? `text-[${data?.loyalty?.fontColor}]` : "text-base-100"
												} flex flex-1 text-2xl font-semibold`}
										>
											Yaay! coins
										</h1>
									</div>
									<div className="mt-3 mr-3">
										<p
											className={`${data?.loyalty?.fontColor ? `text-[${data?.loyalty?.fontColor}]` : "text-base-100"
												} text-sm leading-7`}
										>
											for the visit at {item.businessName}
										</p>
										<p
											className={`${data?.loyalty?.fontColor ? `text-[${data?.loyalty?.fontColor}]` : "text-base-100"
												} text-sm font-semibold`}
										>
											{item.day}
										</p>
									</div>
								</div>
								<div className="flex self-center">
									<p
										className={`${data?.loyalty?.fontColor ? `text-[${data?.loyalty?.fontColor}]` : "text-base-100"
											} text-2xl font-semibold`}
									>
										{item.rewards}
									</p>
								</div>
							</div>
						) : (
							<div
								key={index}
								style={{
									backgroundRepeat: "no-repeat",
									backgroundImage: `url(${claimImage})`,
									backgroundSize: `${data?.loyalty?.cardPattern === "beans" ||
											data?.loyalty?.cardPattern === "bowl" ||
											data?.loyalty?.cardPattern === "love" ||
											data?.loyalty?.cardPattern === "flower" ||
											data?.loyalty?.cardPattern === "bud"
											? "75px 50px"
											: "cover"
										}`,
									backgroundPosition: `${data?.loyalty?.cardPattern === "beans" ||
											data?.loyalty?.cardPattern === "bowl" ||
											data?.loyalty?.cardPattern === "love" ||
											data?.loyalty?.cardPattern === "flower" ||
											data?.loyalty?.cardPattern === "bud"
											? "right 25% top 50%"
											: ""
										}`,
								}}
								className="flex items-center justify-between w-full p-6 mt-5 bg-no-repeat bg-auto border rounded-lg border-1 border-primary"
							>
								<div>
									<h1
										style={{ color: `${data?.loyalty?.fontColor}` }}
										className="w-16 px-2 py-1 mb-3 rounded-md bg-primary text-base-100"
									>
										Saved
									</h1>
									<p className="text-base font-semibold text-primary">{item.day}</p>
									<p className="text-base font-semibold leading-7 uppercase text-primary">
										{item.businessName}
									</p>
									<p className="text-base text-primary">
										used {item.currentBalance} coins by {item.userName}
									</p>
								</div>
								<div className="flex self-center">
									<p className="text-base font-semibold text-primary">-{item.rewards}</p>
								</div>
							</div>
						)
					})
				) : (
					<center>No Data Found</center>
				)}
			</div>
		</div>
	)
}

export default LoyaltyId
