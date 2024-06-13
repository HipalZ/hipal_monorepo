import CardLG from "@/components/atoms/card/cardLG"
import Section from "@/components/molecules/section"
import { _useAllBusiness } from "@/components/store/useAllBusiness"
import { getRandomImg } from "@/components/utils/images"
import { PAGE_TYPES, routePaths } from "@/components/utils/routes"
import isEmpty from "lodash-es/isEmpty"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { memo, useMemo } from "react"

interface ISpecialOffers {
	offerName: string
	wallpaper: string
	redirectType: string
	redirectId: string
}
export default memo(function SpecialOffers(props:ISpecialOffers) {
	const {specialOffers} = props;

	const getLink = (offer) => {
		if (offer && offer.redirectType === "Dish") {
			return routePaths[PAGE_TYPES.DISH_ID](businessId, offer?.redirectId)
		} else if (offer && offer.redirectType === "Category") {
			return routePaths[PAGE_TYPES.CATEGORY_BY_ID](businessId, offer?.redirectId)
		}
		return null
	}

	if (isEmpty(specialOffers)) {
		return null
	}

	return (
		<div id="specialOffers" className="py-1">
			<div className="relative">
				<Section title="In Spotlight" tag={"h3"}>
					<div className="flex flex-row px-4 space-x-4 overflow-auto snap-proximity snap-x scroll-smooth">
						{specialOffers.map((offer, key) => (
							<div key={key} className="mx-auto snap-center snap-center:scale-110 ">
								<Link href={`${getLink(offer)}`} passHref>
									<CardLG
										src={offer?.wallpaper || getRandomImg()}
										text={offer?.offerName || ""}
										innerContentTop
										link={getLink(offer)}
									/>
								</Link>
							</div>
						))}
					</div>
				</Section>
			</div>
		</div>
	)
})
