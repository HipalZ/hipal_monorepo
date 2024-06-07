import loaderGif from '@assets/img/loader.gif'
import Image from 'next/legacy/image'
import { memo } from 'react'

export default memo(function BrandLoader() {
	return (
		<>
			<div className='flex flex-col'>
				<Image
					src={loaderGif.src}
					className='scale-[0.40]'
					layout='fill'
					objectFit='cover'
					alt='Loading...'
					priority={true}
					width={50}
					height={50}
				/>
			</div>
		</>
	)
})
