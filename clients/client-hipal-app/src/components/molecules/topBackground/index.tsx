"use client"
import BackButton from "@/components/atoms/backButton"
import PlaceholderImg from "@/components/atoms/placeholder"
import { useRoutingFlow } from "@/components/store/useRoutingFlow"
import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/image"
import { memo } from "react"

function TopBackground({ specialBanner}: { specialBanner: string | undefined }) {	
	const { getPreviousPath } = useRoutingFlow()
	const onBackURL = `${getPreviousPath()}`
	console.log('sp',specialBanner)
	return (
		<div className={"relative h-[20vh] w-screen overflow-hidden"}>
			{specialBanner ? (
				<Image
					src={specialBanner || ""}
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
			<div className="top-4  w-full absolute z-[60] flex flex-row px-4">
				<BackButton onBackURL={onBackURL}/>
			</div>
		</div>
	)
}

const MemoTopBackground = memo(TopBackground)
export default MemoTopBackground
