"use client"
import { useStory } from "@/components/store/useStory"
import { IThemes } from "@/components/types/businessData"
import { updateTheme } from "@/components/utils/themes"
import React, { memo, useEffect } from "react"

function BottomButton({
	children,
	themes,
	onClick,
	appendClassNames = "",
	placingOrder = false,
	...props
}: {
	appendClassNames?: string
	themes:IThemes,
	onClick?: () => void
	children: React.ReactNode
	placingOrder?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const { isStoryOn } = useStory()
	if (isStoryOn) {
		return null
	}
	useEffect(() => {
		updateTheme(themes)
	},[themes])
	return (
		<div className="fixed bottom-0 z-20 w-[100%] max-w-[30rem] py-2 rotate-180 shadow-lg bg-base-100 shadow-base-100">
			<div className="flex flex-col mx-auto rotate-180 justify-items-center">
				<button
					className={`min-h-[3rem] w-[90%] max-w-[28rem] btn btn-primary btn-md mx-auto font-semibold text-[1rem] rounded-full shadow-lg my-auto !py-2 ${appendClassNames}`}
					onClick={onClick}
					aria-busy={placingOrder}
					disabled={placingOrder}
					{...props}
				>
					{children}
				</button>
			</div>
		</div>
	)
}

export default memo(BottomButton)
