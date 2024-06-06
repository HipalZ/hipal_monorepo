import Image from 'next/image'
import { useRouter } from 'next/router'
import HipalLogo from '@assets/svg/Hipal_logo.svg'
import { IoIosArrowBack } from 'react-icons/io'

function ProfileHeader() {
	const router = useRouter()
	const isBackAvailable = router.pathname !== '/'

	const onBackClick = () => {
		router.back()
	}

	return (
		<div className='flex relative pl-[1rem] pb-6 h-12'>
			{isBackAvailable && (
				<button onClick={onBackClick}>
					<IoIosArrowBack size={24} className='my-2 stroke-1' />
				</button>
			)}
			<Image
				className='absolute w-[6rem] h-[6rem] transform -translate-x-1/2 -translate-y-[4.2rem] left-[48%] top-[80%]'
				src={HipalLogo}
				alt='HipalLogo'
			/>
		</div>
	)
}

export default ProfileHeader
