import { memo } from 'react'

function Loader({ type, isSquare }: { type?: 'warning'; isSquare?: boolean }) {
	let className = ''
	if (type === 'warning') {
		className = isSquare ? ' border-t-warning ' : 'progress-warning'
	} else {
		className = isSquare ? ' border-t-primary ' : 'progress-primary'
	}

	if (isSquare) {
		return (
			<div className='flex'>
				<div
					className={`rounded-full h-8 w-8 border-4 animate-spin ${className} bg-transparent`}
				/>
			</div>
		)
	}

	return (
		<div className='flex'>
			<progress className={`progress w-48 mx-auto ${className}`} />
		</div>
	)
}

export default memo(Loader)
