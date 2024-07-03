import DiscountDishCard from "@/components/molecules/discountDishCard"
import Section from "@/components/molecules/section"
import useBusinessDetails from "@/components/store/useBusinessDetails"
import { IDish } from "@/components/types/businessData"
import { PAGE_TYPES, routePaths } from "@/components/utils/routes"
import { Splide, SplideSlide } from "@splidejs/react-splide"
import { useParams, useRouter } from "next/navigation"
import { memo } from "react"

interface IPopularRestProps {
	popular: any
}
function PopularRestaurant(props: IPopularRestProps) {
	const customLink = useBusinessDetails((s)=>s.businessDetails?.customLink)
	const { popular } = props
	const router = useRouter()
	const handleRecommendedDishClick = (id: string) => {
		router.push(routePaths[PAGE_TYPES.DISH_ID](customLink, id))
	}

	return (
		<Section title="Uniquely Yours" tag="h3">
			<div>
				<Splide
					aria-labelledby="Special offers"
					options={{
						rewind: false,
						width: "100%",
						gap: "0.75rem",
						padding: "1rem",
						perPage: 2,
						perMove: 1,
						autoWidth: true,
						classes: {
							pagination: "splide__pagination",
						},
					}}
				>
					<div className="hidden splide__arrows">
						<button className="splide__arrow splide__arrow--prev">Prev</button>
						<button className="splide__arrow splide__arrow--next">Next</button>
					</div>

					{popular?.map((dishData: IDish, key:number) => (
						<SplideSlide key={`${key}FilterPopularDishes` + (dishData?._id || "")}>
							{dishData && (
								<DiscountDishCard
									dishData={dishData}
									onClick={() => handleRecommendedDishClick(dishData._id)}
								/>
							)}
						</SplideSlide>
					))}
				</Splide>
			</div>
		</Section>
	)
}

const MemoPopularRestaurant = memo(PopularRestaurant)
export default MemoPopularRestaurant
