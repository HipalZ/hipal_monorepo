"use client"
import BackButton from "@/components/atoms/backButton"
import PlaceholderImg from "@/components/atoms/placeholder"
import useBusinessDetails from "@/components/store/useBusinessDetails"
import { useCart } from "@/components/store/useCart"
import { useRoutingFlow } from "@/components/store/useRoutingFlow"
import { IThemes } from "@/components/types/businessData"
import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/image"
import { memo } from "react"

function TopBackground({ themes,halfTop = false }: { themes: IThemes | undefined ;halfTop?:boolean; }) {	
	const { getPreviousPath } = useRoutingFlow()
	const onBackURL = `${getPreviousPath()}`
	const { showCart } = useCart();
	return (
		<div className={`relative ${halfTop ? "h-[10vh]":"h-[20vh]"}  w-screen overflow-hidden`}>
			{themes?.miniBanner ? (
				<Image
					src={themes?.miniBanner || ""}
					width={700}
					height={300}
					quality={95}
					objectFit="cover"
					className="mx-auto"
					alt={"miniBanner Image"}
					placeholder="blur"
					blurDataURL={getRandomBlurImg(700, 700)}
				/>
			) : (
				<PlaceholderImg className="w-full h-full" />
			)}
			{showCart ? null : <div className="top-4  w-full absolute z-[60] flex flex-row px-4">
				<BackButton onBackURL={onBackURL}/>
			</div>}
		</div>
	)
}

export default memo(TopBackground)
