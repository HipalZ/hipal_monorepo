import ReadMore from "@/components/atoms/readMore"
import { getRandomBlurImg } from "@/components/utils/images"
import isEmpty from "lodash-es/isEmpty"
import Image from "next/legacy/image"
import { memo } from "react"
import PlaceholderImg from "@/components/atoms/placeholder"

interface IHeroSection {
	businessId: string,
	logo: string,
	businessName: string,
	description: string,
	tags: string[]
}
export default memo(function HeroSection(props: IHeroSection) {
	const { logo, businessName, businessId, description, tags } = props

	// const description = useMemo(() => {
	// 	switch (businessId?.toLowerCase()) {
	// 		case BUSINESS_ID.COFFEE_CUP.toLowerCase():
	// 			return "Partially open-air, rustic-chic spot for typical cafe fare & coffee, with art & books."
	// 		case BUSINESS_ID.OTC.toLowerCase():
	// 			return "The ambience of a childhood home, the company of a furry friend and the comfort of delicious food."
	// 		case BUSINESS_ID.UPDATE_COFFEE_CUP.toLowerCase():
	// 			return "Partially open-air, rustic-chic spot for typical cafe fare & coffee, with art & books."
	// 		case BUSINESS_ID.NEW_COFFEE_CUP.toLowerCase():
	// 			return "Partially open-air, rustic-chic spot for typical cafe fare & coffee, with art & books."
	// 		case BUSINESS_ID.FLUKE_CURRY.toLowerCase():
	// 			return "Tukkae se “fluke curry” ka Khanna is amazing."
	// 		case BUSINESS_ID.NAAN_KING.toLowerCase():
	// 			return "Serving great portions since 1957, Nanking Chinese Restaurant celebrates a legacy of authentic flavors and timeless traditions."
	// 		case BUSINESS_ID.KOI_AND_CO.toLowerCase():
	// 			return "Indulge in exquisite flavors beneath the tranquil gaze of our koi companions."
	// 		case BUSINESS_ID.TALES_OF_TELGU.toLowerCase():
	// 			return "Tales of Telugu unites the rich culture of Andhra and Telangana, their people, and age-old traditions in a culinary journey bound by the love for culinary experiences."
	// 		case BUSINESS_ID.PRIYANKA_AELAY.toLowerCase():
	// 			return "Hyderabad-born artist, I am known for my work in contemporary Indian miniature art , with a doctorate and Masters in Painting. My style art captures intricately blends of flora, fauna, and minimalist elegance, reflecting nature`s joyous essence."
	// 		case BUSINESS_ID.BOHIEMENA_BEANS.toLowerCase():
	// 			return "Bohiemena Beans: The Alchemy of Art and Caffeine"
	// 		case BUSINESS_ID.WHITE_MANGO.toLowerCase():
	// 			return "White Mango is a culinary oasis where fresh, farm-sourced ingredients meet heartfelt hospitality"
	// 		case BUSINESS_ID.CHACHA_CHINESE.toLowerCase():
	// 			return "Chacha Chinese Wale, an authentic Chinese restaurant, is now located in our neighborhood."
	// 		case BUSINESS_ID.CAFE_MULTIVERSE.toLowerCase():
	// 			return "Hyderabad's First Multi Theme Cafe located in Sainikpuri for the fans of Marvel, F.R.I.E.N.D.S and KGF offering delicious Continental, Asian cuisines and Beverages."
	// 		default:
	// 			return ""
	// 	}
	// }, [businessId])
	return (
		<div className="flex flex-col px-4">
			<div className="flex flex-row pt-6 pb-2 space-x-4 min-h-max">
				{!isEmpty(logo) ? (
					<Image
						src={`${logo}`}
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
