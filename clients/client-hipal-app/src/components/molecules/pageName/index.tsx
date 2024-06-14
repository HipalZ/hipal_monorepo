"use client"
import PlaceholderImg from "@/components/atoms/placeholder"
import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/legacy/image"
import { memo } from "react"

interface IPageName {
	endBanner: string
}
function PageComponent(props: IPageName)  {
	const { endBanner } = props
	return (
		<div className=" mb-4 bg-base-300 relative flex flex-col h-[50vh]">
			{
				endBanner && endBanner?.length > 0 ? <Image
					src={endBanner}
					quality={75}
					width={100}
					height={100}
					alt={"background"}
					layout="fill"
					objectFit="cover"
					placeholder="blur"
					blurDataURL={getRandomBlurImg(100, 100)}
				/> : <PlaceholderImg />
			}
		</div>
	)
}

const PageName = memo(PageComponent)
export default PageName
