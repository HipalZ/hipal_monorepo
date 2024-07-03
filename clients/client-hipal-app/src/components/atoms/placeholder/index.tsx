import { memo } from "react"
import { BiDish } from "react-icons/bi"

function PlaceholderImg({ className }: { className?: string }) {
	return (
		<div className={(className || "") + " flex bg-base-300 rounded-lg"}>
			<BiDish className="m-auto text-2xl fill-current text-base-content" />
		</div>
	)
}

const MemoPlaceholderImg = memo(PlaceholderImg)
export default MemoPlaceholderImg
