//@ts-nocheck
import CardLG from "@/components/atoms/card/cardLG"
import Section from "@/components/molecules/section"
import img from "@/assets/img/cut.png"
import { IExplore } from "@/components/types/businessData"
import { getRandomImg } from "@/components/utils/images"
import isEmpty from "lodash-es/isEmpty"
import { memo } from "react"
import rewardimage from "@/assets/border.svg"
import Image from "next/image"

interface ISpecialOffers {
	explore: IExplore | undefined

}
function SpecialOffers(props: ISpecialOffers) {
	const explore = props.explore ?? {
		wallpaper: img.src,
		phone: '',
		countryCode: '',
		location: '',
		openFrom: '',
		close: '',
		specialOffers: [],
		popular: [],
		highlights: [],
		openTill: ''
	} as IExplore

	if (!explore || isEmpty(explore.specialOffers)) {
		return null;
	}


	return (
		<div id="specialOffers" className="py-1">
			<div className="relative">
				<Section title="Banners" tag={"h3"}>
					<div className="flex flex-row px-4 space-x-4 overflow-auto snap-proximity snap-x scroll-smooth">
						{explore?.specialOffers.map((offer) => (
							<div key={offer._id} className="snap-center snap-center:scale-110">
									<CardLG
										src={offer?.wallpaper || getRandomImg()}
										text={offer?.offerName || ""}
										isOuterContent={!!offer?.offerName}
									/>
							</div>
						))}
					</div>
				</Section>
			  <figure className="absolute -bottom-5 ">
					<Image src={rewardimage} width={500} height={13} alt="reward" />
				</figure> 
			</div> 
		</div>
	)
}

const MemoSpecialOffers = memo(SpecialOffers)
export default MemoSpecialOffers
