import FoodType, { FOOD_TYPES } from '@components/atoms/foodType'
import Section from '@components/molecules/section'
import { _useAllBusiness } from '@components/store/useAllBusiness'
import { IDish } from '@components/types/businessData'
import { getRandomBlurImg } from '@components/utils/images'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import Image from 'next/image'
import { memo, useMemo } from 'react'
import { ImSpoonKnife } from 'react-icons/im'
import DishQuantityButton from '../dishQuantityButton'

import PlaceholderImg from '@components/atoms/placeholder'
function RecommendedDishes({ dishData, openModal }: { dishData: IDish; openModal: (str) => void }) {
	const { dishesData } = _useAllBusiness((s) => s.data)
	const recommendations = useMemo(() => {
		const recommendationList = dishData?.filters?.dishes

		if (recommendationList.length === 0) return []

		return recommendationList.map(({ id }) => {
			const dishData = dishesData?.find((dish) => dish.id === id)
			return dishData
		})
	}, [dishData?.filters?.dishes, dishesData])

	if (recommendations?.length === 0) return null

	return (
		<div className='-mt-6'>
			<Section title='' tag='h3'>
				<div className=''>
					<div className='flex flex-row gap-4 mb-4 text-base text-primary'>
						<ImSpoonKnife className='my-auto text-lg' />
						<h4 className='my-auto'>best pair with</h4>
					</div>
					<Splide
						aria-labelledby='Special offers'
						options={{
							rewind: false,
							width: '100%',
							gap: '1rem',
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

						{recommendations.map((dishData, key) => (
							<SplideSlide key={key}>
								{dishData && (
									<div className='relative'>
										<div className='absolute bg-white left-2 top-2'>
											<FoodType type={dishData.dishType as FOOD_TYPES} />
										</div>
										<div className='z-10 flex flex-col w-32 overflow-hidden bg-white border rounded-xl h-44 border-base-200'>
											<div
												onClick={() => openModal(dishData)}
												className='w-full h-32 overflow-hidden'
											>
												{dishData?.images.length > 0 ? (
													<div className='px-2 pt-2 rounded-t-xl'>
														<Image
															src={dishData?.images[0]}
															layout='object-fit'
															quality={75}
															objectFit='cover'
															alt={dishData?.name}
															placeholder='blur'
															blurDataURL={getRandomBlurImg(150, 150)}
														/>
													</div>
												) : (
													<PlaceholderImg className='w-full h-full' />
												)}
											</div>
											<div className='flex-grow p-1 text-start'>
												<div className='overflow-hidden text-xs font-medium capitalize whitespace-nowrap overflow-ellipsis'>
													{dishData?.name}
												</div>
											</div>
											<div className='flex items-center justify-between px-2 pb-2'>
												<div className='text-xs'>₹{dishData?.price}</div>
												<div className='scale-75'>
													<DishQuantityButton dishData={dishData} />
												</div>
											</div>
										</div>
									</div>
								)}
							</SplideSlide>
						))}
					</Splide>
				</div>
			</Section>
		</div>
	)
}

export default memo(RecommendedDishes)