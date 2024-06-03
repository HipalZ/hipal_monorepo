import { useStory } from '@components/store/useStory'
import React, { memo } from "react";

function BottomButton({
	children,
	onClick,
	appendClassNames = '',
	...props
}: {
	appendClassNames?: string
	onClick?: () => void
	children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const { isStoryOn } = useStory()
	if (isStoryOn) {
		return null
	}

	return (
		<div className='fixed bottom-0 z-20 w-full py-2 rotate-180 shadow-lg bg-base-100 shadow-base-100'>
			<div className='flex flex-col mx-auto rotate-180 justify-items-center'>
				<button
				type='button'
					className={
						`min-h-[3rem] btn btn-primary btn-md mx-auto font-semibold text-[1rem] rounded-full shadow-lg min-w-389 min-w-[95%] my-auto !py-2 ${appendClassNames}`
					}
					onClick={onClick}
					onTouchStart={onClick}
					{...props}
				>
					{children}
				</button>
			</div>
		</div>
	)
}

export default memo(BottomButton)
