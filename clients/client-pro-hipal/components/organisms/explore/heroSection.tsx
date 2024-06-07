import PlaceholderImg from "@components/atoms/placeholder/img";
import ReadMore from "@components/atoms/readMore";
import { useAllBusiness } from "@components/store/useAllBusiness";
import { getRandomBlurImg } from "@components/utils/images";
import isEmpty from "lodash-es/isEmpty";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { memo, useMemo } from "react";
import coffeeCupLogo from "../../../assets/img/coffeeCup_logo.png";
import { BUSINESS_ID } from "@components/utils/constants";
export default memo(function HeroSection() {
	const { data: _data } = useAllBusiness();
	const data = useMemo(() => _data, [_data]);
	const router = useRouter();
	const { businessId } = router.query as { businessId: string };

	const description = useMemo(() => {
		switch (businessId.toLowerCase()) {
			case BUSINESS_ID.COFFEE_CUP.toLowerCase():
				return "Partially open-air, rustic-chic spot for typical cafe fare & coffee, with art & books.";
			case BUSINESS_ID.OTC.toLowerCase():
				return "The ambience of a childhood home, the company of a furry friend and the comfort of delicious food.";
			case BUSINESS_ID.UPDATE_COFFEE_CUP.toLowerCase():
				return "Partially open-air, rustic-chic spot for typical cafe fare & coffee, with art & books.";
			case BUSINESS_ID.NEW_COFFEE_CUP.toLowerCase():
				return "Partially open-air, rustic-chic spot for typical cafe fare & coffee, with art & books.";
			case BUSINESS_ID.FLUKE_CURRY.toLowerCase():
				return "Tukkae se “fluke curry” ka Khanna is amazing.";
			case BUSINESS_ID.NAAN_KING.toLowerCase():
				return "Serving great portions since 1957, Nanking Chinese Restaurant celebrates a legacy of authentic flavors and timeless traditions.";
			case BUSINESS_ID.ASIAN_CUISINE.toLowerCase():
				return "Indulge in wok n roll adventures with our Asian culinary symphony";
			case BUSINESS_ID.KEBAB_WALA.toLowerCase():
				return "Grill perfection awaits relish succulent kebabs in a flavorful feast!";
			case BUSINESS_ID.BOHIEMENA_BEANS.toLowerCase():
				return "Bohiemena Beans: The Alchemy of Art and Caffeine";
			case BUSINESS_ID.WHITE_MANGO.toLowerCase():
				return "White Mango is a culinary oasis where fresh, farm-sourced ingredients meet heartfelt hospitality";
			case BUSINESS_ID.CHACHA_CHINESE.toLowerCase():
				return "Chacha Chinese Wale, an authentic Chinese restaurant, is now located in our neighborhood.";
			case BUSINESS_ID.CAFE_MULTIVERSE.toLowerCase():
				return "Hyderabad's First Multi Theme Cafe located in Sainikpuri for the fans of Marvel, F.R.I.E.N.D.S and KGF offering delicious Continental, Asian cuisines and Beverages."
			default:
				return "";
		}
	}, [businessId]);

	return (
		<div className="flex flex-col px-4">
			<div className="flex flex-row pt-6 pb-2 space-x-4 min-h-max">
				{!isEmpty(data?.businessesData?.logo) ? (
					<Image
						src={`${businessId.toLowerCase() ===
							"63c0f3e4ee03bd948ba6522a".toLowerCase()
							? coffeeCupLogo.src
							: data?.businessesData?.logo
							}`}
						height={100}
						width={100}
						quality={95}
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
					{data?.businessesData?.businessName && (
						<h2 className="my-0 font-semibold capitalize">
							{data?.businessesData?.businessName}
						</h2>
					)}
					<h3 className="flex flex-row flex-wrap my-0 text-sm font-bold line-clamp-2 divide-base-content">
						{businessId.toLowerCase() ===
							BUSINESS_ID.COFFEE_CUP.toLowerCase() ? (
							"Cafe | Desserts | Continental"
						) : businessId.toLowerCase() === BUSINESS_ID.OTC.toLowerCase() ? (
							"Pet Friendly | Cafe | Community"
						) : businessId.toLowerCase() ===
							BUSINESS_ID.UPDATE_COFFEE_CUP.toLowerCase() ? (
							"Cafe | Desserts | Continental"
						) : businessId.toLowerCase() ===
							BUSINESS_ID.NEW_COFFEE_CUP.toLowerCase() ? (
							"Cafe | Desserts | Continental"
						) : businessId.toLowerCase() ===
							BUSINESS_ID.FLUKE_CURRY.toLowerCase() ? (
							"Hindustani | Bistro | Cafe"
						) : businessId.toLowerCase() ===
							BUSINESS_ID.NAAN_KING.toLowerCase() ? (
							"Original  | Truly Chinese| family"
						) : businessId.toLowerCase() ===
							BUSINESS_ID.ASIAN_CUISINE.toLowerCase() ? (
							"AsianCuisine | FlavorsOfAsia | WokNRoll"
						) : businessId.toLowerCase() ===
							BUSINESS_ID.KEBAB_WALA.toLowerCase() ? (
							"KebabKraze | SizzleAndSkewer | GrillThrill"
						) : businessId.toLowerCase() ===
							BUSINESS_ID.BOHIEMENA_BEANS.toLowerCase() ? (
							"Coffee Mastery | Handcrafted Pastries | Feast Flair"
						) : businessId.toLowerCase() ===
							BUSINESS_ID.WHITE_MANGO.toLowerCase() ? (
							"Farm to fork | Pet friendly | late night shenanigans"
						) : businessId.toLowerCase() ===
							BUSINESS_ID.CHACHA_CHINESE.toLowerCase() ? (
							"Authentic Chinese | Seafood Extravaganza | Family-Style"
						) : businessId.toLowerCase() ===
							BUSINESS_ID.CAFE_MULTIVERSE.toLowerCase() ? (
							"HeroBrewTime | KGFriendZone | AquaticDiner"
						) :
							(
								<></>
							)}
						<br />
					</h3>
				</div>
			</div>
			<div className="mt-auto">
				<h6 className="mt-auto text-xs font-light line-clamp-4">
					<ReadMore text={description} />
				</h6>
			</div>
		</div>
	);
});
