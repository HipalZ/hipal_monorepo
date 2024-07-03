import ReadMore from "@/components/atoms/readMore"
import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/legacy/image"
import { memo } from "react"
import PlaceholderImg from "@/components/atoms/placeholder"
import { IBiz, IBusinessData, IExplore } from "@/components/types/businessData"
import { TiLocationOutline } from "react-icons/ti";
import { MdOutlineCall } from "react-icons/md"

interface IHeroSection {
	data: IBusinessData
}
function HeroSection({ data }: IHeroSection): JSX.Element {
	const { businessName, logo, tags, description } = data.business as IBiz
	const { location, phone } = data.settings?.explore as IExplore

	const goToLocaltion = () => {
		if (typeof window !== "undefined") {
			window.location.href = location
		}
	}

	const callTheOwner = () => {
		if (typeof window !== "undefined") {
			window.open(`tel:${phone}`)
		}
	}

	return (
		<div className="relative flex flex-col px-8">
			<figure className="absolute z-10 -top-[3rem] left-4 bg-base-200 rounded-full">
				{data.business?.logo ? (
					<figure className="px-2 pt-2">
						<Image
							src={logo}
							height={80}
							width={80}
							quality={75}
							objectFit="cover"
							alt="logo-business"
							className="object-center w-1/3 border rounded-full shadow-sm aspect-square"
							placeholder="blur"
							blurDataURL={getRandomBlurImg(100, 100)}
						/>
					</figure>
				) : (
					<PlaceholderImg />
				)}
			</figure>
			{
				location && (
					<section onClick={callTheOwner} className="w-10 h-10 rounded-full bg-[#00000050] absolute z-10 top-2 right-4 flex justify-center items-center">
						<MdOutlineCall size={24} className="text-white" />
					</section>
				)
			}
			{
				phone && (
					<section onClick={goToLocaltion} className="w-10 h-10 rounded-full bg-[#00000050] absolute z-10 top-2 right-[4.5rem] flex justify-center items-center">
						<TiLocationOutline size={24} className="text-white" />
					</section>
				)
			}

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
}

const MemoHeroSection = memo(HeroSection)
export default MemoHeroSection
