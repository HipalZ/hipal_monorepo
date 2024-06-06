// import profileGirlImg from '@assets/svg/profileGirls.svg'
import { useLogin } from '@components/store/useLogin'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import { isEmpty } from 'lodash-es'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { memo } from 'react'

function UserAvatar({
	...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
	const userDetails = useLogin((s) => s.userDetails)
	const router = useRouter()
	const { businessId } = router.query

	if (isEmpty(userDetails.name)) return null

	return (
		<div {...props}>
			{/* <Image className='w-8 h-8 rounded-full' src={profileGirlImg} alt='simple image' /> */}

			<Link href={`${routePaths[PAGE_TYPES.PROFILE](`${businessId}`)}`}>
				<div className='flex w-8 h-8 bg-white border border-black rounded-full'>
					<span className='m-auto'>{userDetails?.name?.[0]}</span>
				</div>
			</Link>
		</div>
	)
}

export default memo(UserAvatar)
