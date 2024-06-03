import CardLG from '@components/atoms/card/cardLG'
import Section from '@components/molecules/section'
import { _useAllBusiness } from '@components/store/useAllBusiness'
import { getRandomBlurImg, getRandomImg } from '@components/utils/images'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import isEmpty from 'lodash-es/isEmpty'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { memo, useMemo } from 'react'

export default memo(function SpecialOffers() {
	const data = _useAllBusiness((s) => s.data)
	const router = useRouter()
	const { businessId } = router.query as { businessId: string }

	const specialOffers = useMemo(
		() => data?.settings?.explore?.specialOffers || [],
		[data?.settings?.explore?.specialOffers],
	)
	const getLink = (offer) => {
		if (offer && offer.redirectType === 'Dish') {
			return routePaths[PAGE_TYPES.DISH_ID](businessId, offer?.redirectId)
		} else if (offer && offer.redirectType === 'Category') {
			return routePaths[PAGE_TYPES.CATEGORY_BY_ID](businessId, offer?.redirectId)
		}

		return null
	}

	if (isEmpty(specialOffers)) {
		return null
	}

	return (
		<div id='specialOffers' className='py-1'>
			<div className='relative'>
				{/* background Image */}
				{data?.settings?.themes?.specialBanner ? (
					<Image
						src={data?.settings?.themes?.specialBanner || ''}
						layout={'fill'}
						quality={95}
						objectFit='contain'
						className='bg-contain -z-10 min-h-max'
						alt='background decoration Image'
						placeholder='blur'
						blurDataURL={getRandomBlurImg(600, 600)}
					/>
				) : (
					''
				)}

				<Section title='In Spotlight' tag={'h3'}>
					<div className='flex flex-row px-4 space-x-4 overflow-auto snap-proximity snap-x scroll-smooth'>
						{specialOffers.map((offer, key) => (
							<div key={key} className='mx-auto snap-center snap-center:scale-110 '>
								<Link href={`${getLink(offer)}`} passHref>
									<CardLG
										src={offer?.wallpaper || getRandomImg()}
										text={offer?.offerName || ''}
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
