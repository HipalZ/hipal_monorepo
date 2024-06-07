import { _useAllBusiness } from "@components/store/useAllBusiness"
import { getRandomBlurImg } from "@components/utils/images"
import dynamic from "next/dynamic"
import Image from "next/legacy/image"
import { memo } from "react"
import img from "@assets/img/cut.png"

const ContactRestaurant = dynamic(() => import("@components/atoms/contactRestaurant"), {
	ssr: false,
})

const RestaurantLocation = dynamic(() => import("@components/atoms/restaurantLocation"), {
	ssr: false,
})

const RestaurantTime = dynamic(() => import("@components/atoms/time/restaurant"), {
	ssr: false,
})

function MainBackground() {
	const data = _useAllBusiness((s) => s.data)

	return (
		<div className="relative h-[60vh] max-h-96 overflow-hidden w-full md:w-1/2 mx-auto">
			<Image
				src={data?.settings?.explore?.wallpaper || img.src}
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
					<RestaurantTime />
				</div>
				<div className="flex flex-row ml-auto space-x-2">
					<RestaurantLocation />
					<ContactRestaurant />
				</div>
			</div>
		</div>
	)
}

export default memo(MainBackground)
