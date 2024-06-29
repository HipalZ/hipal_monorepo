import ReadMore from "@/components/atoms/readMore"
import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/legacy/image"
import { memo } from "react"
import PlaceholderImg from "@/components/atoms/placeholder"
import { IBiz, IBusinessData } from "@/components/types/businessData"

interface IHeroSection {
	data: IBusinessData
}
export default memo(function HeroSection({ data }: IHeroSection): JSX.Element {
	const { businessName, logo, tags, description } = data.business as IBiz
	

	return (
		<div className="relative flex flex-col px-8">
			<figure className="absolute z-10 -top-[3rem] left-4 bg-base-200 rounded-full">
				{data.business?.logo ? (
					<figure className="p-2">
						<Image
						src={logo}
						height={80}
						width={80}
						quality={75}
						objectFit="cover"
						alt="logo-business"
						className="object-center w-1/3 p-1 border rounded-full shadow-sm aspect-square"
						placeholder="blur"
						blurDataURL={getRandomBlurImg(100, 100)}
					/>
					</figure>
				) : (
					<PlaceholderImg />
				)}
			</figure>
			<div className="pt-10 space-y-2">
				{businessName && (
					<h4 className="mt-4 text-2xl font-semibold capitalize">{businessName}</h4>
				)}
				<h3 className="flex text-sm font-bold line-clamp-2 divide-base-content">
					{Array.isArray(tags) ? tags.join(" | ") : tags}
				</h3>
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
