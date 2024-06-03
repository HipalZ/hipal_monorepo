import { memo } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function SkeletonLoader({height,count}:{height?:number,count?:number}) {
	return (
		<div className='p-4'>
			<Skeleton  count={count} height={height || 30} />
		</div>
	)
}

export default memo(SkeletonLoader)
