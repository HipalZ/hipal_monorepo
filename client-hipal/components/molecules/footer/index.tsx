import { useAllBusiness } from '@components/store/useAllBusiness'
import { memo } from 'react'
import { IoLogoLinkedin, IoLogoYoutube } from 'react-icons/io'
import { IoLogoFacebook, IoLogoInstagram } from 'react-icons/io5'

function Footer() {
	const { data } = useAllBusiness()
	return (
		<>
			<div className='flex flex-col space-y-4 '>
				{data?.settings?.themes?.footerText && (
					<div className='px-4 text-lg mt-[1rem] text-base-100-content'>
						{data?.settings?.themes?.footerText}
					</div>
				)}

				<div className='flex flex-row px-2 space-x-2 '>
					{data?.settings?.themes?.instagramLink && (
						<a
							href={data?.settings?.themes?.instagramLink}
							aria-label='instagram'
							className='btn btn-ghost !px-1 !py-0 my-auto'
						>
							<IoLogoInstagram className='my-auto text-3xl text-base-content/80' />
						</a>
					)}

					{data?.settings?.themes?.facebookLink && (
						<a
							href={data?.settings?.themes?.facebookLink}
							aria-label='facebook'
							className='btn btn-ghost !px-1 !py-0 my-auto'
						>
							<IoLogoFacebook className='my-auto text-3xl text-base-content/80' />
						</a>
					)}

					{data?.settings?.themes?.youtubeLink && (
						<a
							href={data?.settings?.themes?.youtubeLink}
							aria-label='youtube'
							className='btn btn-ghost !px-1 !py-0 my-auto'
						>
							<IoLogoYoutube className='my-auto text-3xl text-base-content/80' />
						</a>
					)}

					{data?.settings?.themes?.linkedinLink && (
						<a
							href={data?.settings?.themes?.linkedinLink}
							aria-label='youtube'
							className='btn btn-ghost !px-1 !py-0 my-auto'
						>
							<IoLogoLinkedin className='my-auto text-3xl text-base-content/80' />
						</a>
					)}
				</div>

				{/* {License && (
					<div className='flex flex-row px-4 space-x-2 text-base text-base-100-content filter grayscale'>
						<Image
							src={fssaiImg}
							layout={'intrinsic'}
							alt='Fssai Image'
							quality={95}
							width={50}
							height={15}
							objectFit='cover'
						/>
						<span className='my-auto'>License No. 12312321654987654</span>
					</div>
					)}*/}
				{/* {!isEmpty(License) && (
					<div className='flex flex-row px-4 space-x-2 text-base text-base-100-content filter'>
						<div className='px-2 py-0.5 bg-white rounded-md'>
							<Image
								src={fssaiImg}
								layout={'intrinsic'}
								alt='Fssai Image'
								quality={50}
								width={50}
								height={25}
								objectFit='cover'
							/>
						</div>
						<span className='my-auto'>License No. {License}</span>
					</div>
				)} */}

				<div className='flex flex-col px-6 py-5 bg-base-300'>
					<span className='mx-auto mb-auto text-sm font-bold tracking-wider text-base-content'>
						Copyright by Paltribe
					</span>
				</div>
			</div>
		</>
	)
}

export default memo(Footer)
