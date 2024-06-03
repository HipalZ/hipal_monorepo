
import UserAvatar from '@components/atoms/userAvatar'
import { _useAllBusiness } from '@components/store/useAllBusiness'
import { getRandomBlurImg } from '@components/utils/images'
import dynamic from 'next/dynamic'
import Image from 'next/legacy/image'
import { memo} from 'react'
import img from '../../../../assets/img/hitable_dish.png'
import SkeletonLoader from '@components/atoms/loader/skeletonLoader'

const ContactRestaurant = dynamic(() => import('@components/atoms/contactRestaurant'), {
	ssr: false,
	loading: () => <SkeletonLoader height={30} />,
})

const RestaurantLocation = dynamic(() => import('@components/atoms/restaurantLocation'), {
	ssr: false,
	loading: () => <SkeletonLoader height={30} />,
})

const RestaurantTime = dynamic(() => import('@components/atoms/time/restaurant'), {
	ssr: false,
	loading: () => <SkeletonLoader height={30} />,
})

function MainBackground() {
	const data = _useAllBusiness((s) => s.data)

	return (
		<div className='relative h-[60vh] max-h-96 w-full bg-cover overflow-hidden '>
			<div className='flex flex-row '>
				<Image
					src={data?.settings?.explore?.wallpaper || img}
					layout='fill'
					quality={95}
					width={480}
					height={480}
					objectFit='cover'
					className='w-full h-full mx-auto'
					alt='Explore page wallpaper'
					placeholder='blur'
					blurDataURL={getRandomBlurImg(700, 700)}
					priority={true}
					loading="eager"
					decoding='sync'
				/>
			</div>

			<UserAvatar className='absolute top-4 right-4' />

			<div className='absolute inset-x-0 flex flex-row px-4 py-3 mb-10 bottom-1 '>
					<div className='my-auto'>
						<RestaurantTime />
					</div>
					<div className='flex flex-row ml-auto space-x-2'>
						<RestaurantLocation className='my-auto' />
						<ContactRestaurant className='my-auto' />
					</div>
			</div>
		</div>
	)
}

export default memo(MainBackground)
