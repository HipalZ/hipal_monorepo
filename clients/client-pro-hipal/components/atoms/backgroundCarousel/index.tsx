import { getRandomBlurImg } from '@components/utils/images'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import Image from 'next/legacy/image'
import { memo } from 'react'

interface WallpaperCarouselProps {
	/**
	 * Array of wallpaper urls
	 */
	wallpapers: string[]
	isAvailable: string
}

function WallpaperCarousel({ wallpapers, isAvailable }: WallpaperCarouselProps) {
	return (
		<Splide
			aria-label='My Favorite Images'
			options={{
				classes: {
					arrows: 'splide__arrows ',
					arrow: 'splide__arrow ',
					prev: 'splide__arrow--prev  ',
					next: 'splide__arrow--next  ',
				},
			}}
		>
			<style jsx>{`
				${wallpapers && wallpapers.length === 1
					? `
						.splide__arrows {
							display: none;
						}
						`
					: ''}

				.splide__arrow svg {
					fill: white !important;
				}
			`}</style>

			{wallpapers.length > 0 &&
				wallpapers.map(
					(wallpaper, index) =>
						!!wallpaper && (
							<SplideSlide key={`${wallpaper}${index}`}>
								{wallpaper.includes('.mp4') ? (
									<video
										playsInline
										autoPlay
										loop
										muted
										poster={getRandomBlurImg(500, 500)}
										width={500}
										height={500}
										className={`object-cover ${isAvailable ? '' : 'grayscale'}`}
									>
										<source src={wallpaper} type='video/mp4' />
									</video>
								) : (
									<>
										<Image
											src={wallpaper}
											className={`object-cover ${isAvailable ? '' : 'grayscale'} rounded-2xl`}
											layout={'intrinsic'}
											alt='dish'
											quality={95}
											width={500}
											height={500}
											objectFit='cover'
											placeholder='blur'
											blurDataURL={getRandomBlurImg(500, 500)}
										/>
										{!isAvailable && (
											<>
												<div className='absolute z-20 text-xl text-white bottom-4 left-4'>
													Not Available
												</div>
												<div className='absolute w-full bottom-2 rounded-b-2xl bg-gradient-to-t from-black via-black/70 to-transparent h-1/2'></div>
											</>
										)}
									</>
								)}
							</SplideSlide>
						),
				)}
		</Splide>
	)
}

export default memo(WallpaperCarousel)
