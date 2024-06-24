import FoodDescription from '@components/organisms/dishDescription/foodDiscription'
import WallpaperCarousel from '@components/atoms/backgroundCarousel'
import { isEmpty } from 'lodash-es'
import NotAvailable from '../notAvailablePlaceholder'

export default function DishPopup({ dishData, isRounded = true }) {
	const isAvailable = dishData?.availability

	const handleInsideClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation()
	}

	return (
		<div className='relative max-h-[70vh] overflow-y-auto' onClick={(e) => handleInsideClick(e)}>
			{!isEmpty(dishData.images) ? (
				<div className=''>
					<WallpaperCarousel wallpapers={dishData.images} isAvailable={isAvailable} />
				</div>
			) : !isAvailable ? (
				<div className='pb-2 text-center'>
					<NotAvailable className='w-full h-32 overflow-hidden rounded-xl' />
				</div>
			) : (
				<>{/* <PlaceholderImg className='aspect-square' /> */}</>
			)}

			<FoodDescription dishData={dishData} />
		</div>
	)
}
