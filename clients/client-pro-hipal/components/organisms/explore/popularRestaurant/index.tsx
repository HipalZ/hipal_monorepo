import DiscountDishCard from '@components/molecules/discountDishCard'
import Section from '@components/molecules/section'
import { useAllBusiness } from '@components/store/useAllBusiness'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import isEmpty from 'lodash-es/isEmpty'
import { useRouter } from 'next/router'
import { memo,  useState } from 'react'

function PopularRestaurant() {
	const router = useRouter()
	const { businessId } = router.query as { businessId: string }
	const { data } = useAllBusiness()

	const [selectedRecommendedDish, setSelectedRecommendedDish] = useState(null)

	// Click handler for recommended dishes
	const handleRecommendedDishClick = (dish) => {
		setSelectedRecommendedDish(dish)
		const categoryId = dish?.categories?.[0]?._id 
		router.push(routePaths[PAGE_TYPES.DISH_ID](businessId, dish._id))
	}

	let FilterPopularDishes: any = []

	data?.settings?.explore?.popular?.map(({ id }) => {
		const dishData = data?.dishesData?.find((dish) => dish._id === id)
		FilterPopularDishes.push(dishData)
	})

	if (isEmpty(data?.settings?.explore?.popular) || isEmpty(FilterPopularDishes)) {
		return null
	}

	return (
		<>
			<Section title='Uniquely Yours' tag='h3'>
				<div className=''>
					<Splide
						aria-labelledby='Special offers'
						options={{
							rewind: false,
							width: '100%',
							gap: '1.5rem',
							padding: '1rem',
							perPage: 2,
							perMove: 1,
							autoWidth: true,
							classes: {
								pagination: 'splide__pagination hidden',
							},
						}}
					>
						<div className='hidden splide__arrows'>
							<button className='splide__arrow splide__arrow--prev'>Prev</button>
							<button className='splide__arrow splide__arrow--next'>Next</button>
						</div>

						{FilterPopularDishes?.map((dishData, key) => (
							<SplideSlide key={`${key}FilterPopularDishes` + (dishData?._id || '')}>
								{dishData && (
									<DiscountDishCard
										businessId={businessId}
										dishData={dishData}
										onClick={() => handleRecommendedDishClick(dishData)}
									/>
								)}
							</SplideSlide>
						))}
					</Splide>
				</div>
			</Section>
		</>
	)
}

export default memo(PopularRestaurant)
