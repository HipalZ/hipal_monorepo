import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/legacy/image"
import { memo } from "react"
import img from "@/assets/img/cut.png"
import ContactRestaurant from "@/components/atoms/contactRestaurant";
import RestaurantLocation from "@/components/atoms/restaurantLocation";
import RestaurantTime from "@/components/atoms/time/restaurant";
import { IExplore } from "@/components/types/businessData";

function MainBackground(props: { explore:IExplore }) {
	const { explore } = props
	return (
		<div className="relative h-[60vh] max-h-96 overflow-hidden w-full md:w-1/2 mx-auto">
			<Image
				src={explore?.wallpaper || img.src}
				width={450}
				height={430}
				quality={75}
				sizes="(max-width: 450px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw"
				alt={"Explore page wallpaper"}
				placeholder="blur"
				blurDataURL={getRandomBlurImg(700, 700)}
				priority={true}
			/>
			<div className="sticky flex px-4 py-3 mb-10 bottom-[10%]">
				<div className="">
					<RestaurantTime openFrom={explore?.openFrom}
						openTill={explore?.openTill}
					/>
				</div>
				<div className="flex flex-row ml-auto space-x-2">
					<RestaurantLocation location={explore?.location}/>
					<ContactRestaurant phoneNumber={explore?.phone}/>
				</div>
			</div>
		</div>
	)
}

export default memo(MainBackground)
