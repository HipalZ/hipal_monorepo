import AlertVariant from "@/components/atoms/alertVariant"
import { useBottomPanel } from "@/components/store/useBottomPanel"
import { useStory } from "@/components/store/useStory"
import  { memo } from "react"

function AddDishToCartButton({
	children,
	onClick,
	appendClassNames = "",
	...props
}: {
	appendClassNames?: string
	onClick?: () => void
	children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const { isStoryOn } = useStory()
	const validationRef = useBottomPanel((state) => state.validationRef)
	const variantType = useBottomPanel((state) => state.variantType)
	const displayAlert = useBottomPanel((state) => state.displayAlert)
	if (isStoryOn) {
		return null
	}
	return (
			<div className="fixed bottom-0 z-20 w-full py-2 rotate-180 shadow-lg bg-base-100 shadow-base-100">
				<div className="flex flex-col mx-auto rotate-180 justify-items-center">
					{displayAlert && <AlertVariant />}
					<button
						type="button"
						className={
							`${
								validationRef || variantType === "portion"
									? "btn-primary"
									: "btn-primary opacity-50"
							} min-h-[3rem] btn btn-md mx-auto font-semibold text-[1rem] rounded-full shadow-lg min-w-389 min-w-[95%] my-auto !py-2 ` +
							appendClassNames
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

const MemoAddDishToCartButton = memo(AddDishToCartButton)
export default MemoAddDishToCartButton
