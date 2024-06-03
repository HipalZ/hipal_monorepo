import { memo } from 'react'

function DinningSVG({ className, ...props }: { className?: string }) {
	return (
		<>
			<svg
				width='19'
				height='18'
				viewBox='0 0 19 18'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				className={className}
				{...props}
			>
				<path
					color='white'
					d='M1.9 18L0.5 16.6L10.75 6.35C10.45 5.65 10.4083 4.85833 10.625 3.975C10.8417 3.09167 11.3167 2.3 12.05 1.6C12.9333 0.716667 13.9167 0.2 15 0.05C16.0833 -0.1 16.9667 0.166667 17.65 0.85C18.3333 1.53333 18.6 2.41667 18.45 3.5C18.3 4.58333 17.7833 5.56667 16.9 6.45C16.2 7.18333 15.4083 7.65833 14.525 7.875C13.6417 8.09167 12.85 8.05 12.15 7.75L10.9 9L18.5 16.6L17.1 18L9.5 10.45L1.9 18ZM4.85 9.45L1.85 6.45C0.95 5.55 0.5 4.475 0.5 3.225C0.5 1.975 0.95 0.9 1.85 0L8.05 6.25L4.85 9.45Z'
				/>
			</svg>
		</>
	)
}

export default memo(DinningSVG)
