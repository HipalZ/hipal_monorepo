import DiscountDishCard from "@/components/molecules/discountDishCard"
import Section from "@/components/molecules/section"
import { PAGE_TYPES, routePaths } from "@/components/utils/routes"
import { Splide, SplideSlide } from "@splidejs/react-splide"
import { useRouter } from "next/navigation"

interface IPopularRestProps {
	popular: []
}
function PopularRestaurant(props: IPopularRestProps) {
	const { popular } = props
	const router = useRouter()
	const handleRecommendedDishClick = (id: string) => {
		router.push(routePaths[PAGE_TYPES.DISH_ID](popular?.[0]?.businessId, id))
	}

	return (
		<Section title="Uniquely Yours" tag="h3">
			<div className="">
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
							pagination: "splide__pagination hidden",
						},
					}}
				>
					<div className="hidden splide__arrows">
						<button className="splide__arrow splide__arrow--prev">Prev</button>
						<button className="splide__arrow splide__arrow--next">Next</button>
					</div>

					{popular?.map((dishData, key) => (
						<SplideSlide key={`${key}FilterPopularDishes` + (dishData?._id || "")}>
							{dishData && (
								<DiscountDishCard
									businessId={popular[0]?.businessId}
									dishData={dishData}
									onClick={() => handleRecommendedDishClick(dishData)}
								/>
							)}
						</SplideSlide>
					))}
				</Splide>
			</div>
		</Section>
	)
}

export default PopularRestaurant
