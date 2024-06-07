import React, { memo } from "react"

interface OnImgButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
	/**
	 * The content of the button.
	 */
	children?: React.ReactNode

	/**
	 * The class name of the button.
	 */
	appendClassNames?: string
}

function OnImgButton({ children, appendClassNames, ...props }: OnImgButtonProps) {
	return (
		<div>
			<button
				className={
					"btn btn-xs btn-secondary btn-outline rounded-full border-secondary !text-secondary-content bg-secondary/50 backdrop-blur-sm flex space-x-2 " +
					appendClassNames
				}
				{...props}
			>
				{children}
			</button>
		</div>
	)
}

export default memo(OnImgButton)
