import { WishlistSVG } from '@assets/svg/wishlistSVG'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { memo, useEffect } from 'react'
import { MdOutlineRoomService } from 'react-icons/md'
import { useRoutingFlow } from '@components/store/useRoutingFlow'
import CallWaiter from '@components/atoms/callTheWaiter'

export default memo(function QuickLinks() {
	const router = useRouter()
	const { businessId } = router.query as { businessId: string }
	const { getNextPath, getPreviousPath } = useRoutingFlow()

	const QUICK_LINKS = [
		{
			title: 'Call Waiter',
			Icon: MdOutlineRoomService,
			onClick: () => {},
		},
	]

	useEffect(() => {
		router.prefetch(`${routePaths[PAGE_TYPES.SEARCH](businessId)}`)
	}, [router, businessId])

	return (
		// <div className='flex items-center justify-between'>
		// 	<div className='text-2xl font-semibold'>Cart</div>
		// 	<div className=''>
		// 		 <CallWaiter />
		// 		{' '}
		// 	</div>
		// </div>
		<div className='flex flex-row my-0 space-x-[4.5rem]'>
			<div className='pt-1 text-2xl font-semibold'>Cart</div>
			<div className='flex space-x-4 '>
				<div className='mt-1'>
					<CallWaiter />
				</div>
				<Link href={`${getPreviousPath()}`} className='no-underline' passHref>
					<div className='px-2 py-[0.125rem] whitespace-nowrap ml-4 my-auto font-medium mt-1 text-sm capitalize border rounded-full text-primary on_active_bounce border-primary flex-shrink-0'>
						order more
					</div>
				</Link>
			</div>
		</div>
	)
})
