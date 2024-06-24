import { _useAllBusiness } from '@components/store/useAllBusiness'
import { getRandomBlurImg } from '@components/utils/images'
import isEmpty from 'lodash-es/isEmpty'
import Image from 'next/legacy/image'
import { memo, useMemo } from 'react'

function PageName() {
	const data = _useAllBusiness((s) => s.data)

	const endBanner = useMemo(
		() => data?.settings?.themes?.endBanner || '',
		[data?.settings?.themes?.endBanner],
	)

	if (isEmpty(endBanner)) {
		return null
	}

	return (
		<div className='bg-base-300 relative flex flex-col w-[100%] max-w-[30rem] h-[50vh]'>
			<div className='absolute inset-y-0 w-full h-full'>
				<Image
					src={endBanner}
					quality={95}
					alt={'background'}
					layout='fill'
					objectFit='cover'
					className='z-10 w-full h-full aspect-square'
					placeholder='blur'
					blurDataURL={getRandomBlurImg(100, 100)}
				/>
			</div>
		</div>
	)
}

export default memo(PageName)
