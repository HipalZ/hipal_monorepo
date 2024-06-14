import ReadMore from "@/components/atoms/readMore"
import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/legacy/image"
import { memo, useEffect } from "react"
import PlaceholderImg from "@/components/atoms/placeholder"
import { updateTheme } from "@/components/utils/themes"

interface IHeroSection {
	businessId: string,
	logo: string,
	businessName: string,
	description: string,
	tags: string[],
	themes:any,
}
export default memo(function HeroSection(props: IHeroSection) {
	const { logo, businessName, description, tags, themes } = props
	useEffect(()=>{
        updateTheme(themes)
    },[themes])
	
	return (
		<div className="flex flex-col px-4">
			<div className="flex flex-row pt-6 pb-2 space-x-4 min-h-max">
				{logo && logo.length >0 ? (
					<Image
						src={logo}
						height={100}
						width={100}
						quality={75}
						objectFit="cover"
						alt="logo-business"
						className="object-center w-1/3 border rounded-lg shadow-sm aspect-square"
						placeholder="blur"
						blurDataURL={getRandomBlurImg(100, 100)}
					/>
				) : (
					<PlaceholderImg />
				)}

				<div className="flex flex-col items-start justify-center w-2/3 pb-4 pr-1 space-y-1 prose">
					{businessName && (
						<h2 className="my-0 font-semibold capitalize">{businessName}</h2>
					)}
					<h3 className="flex flex-row flex-wrap my-0 text-sm font-bold line-clamp-2 divide-base-content">
						{Array.isArray(tags) ? tags.join(" | ") : tags}
						<br />
					</h3>
				</div>
			</div>
			<div className="mt-auto">
				<div
					className="mt-auto text-xs font-light"
				>
					<ReadMore text={description} />
				</div>
			</div>
		</div>
	)
})
