import { isEmpty } from 'lodash-es'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import PlaceholderImg from '../placeholder/img'
import { useAllBusiness } from '@components/store/useAllBusiness'
import { getRandomBlurImg } from '@components/utils/images'

function BusinessLogo() {
	const { data: _data } = useAllBusiness()
	const data = useMemo(() => _data, [_data])
	return (
		<div>
			{!isEmpty(data?.businessesData?.logo) ? (
				<Image
					src={`${data?.businessesData?.logo}`}
					height={100}
					width={100}
					quality={95}
					objectFit='contain'
					alt='logo-business'
					className='object-center w-1/3 border rounded-lg shadow-sm aspect-square'
					placeholder='blur'
					blurDataURL={getRandomBlurImg(100, 100)}
				/>
			) : (
				<PlaceholderImg />
			)}
		</div>
	)
}

export default BusinessLogo
