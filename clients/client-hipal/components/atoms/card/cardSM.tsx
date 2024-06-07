import { memo } from "react"
import Card from "."

function CardSM({ src, text, ...props }: { src: string; text: string }) {
	return (
		<>
			<Card src={src} size={"sm"} {...props}>
				{text}
			</Card>
		</>
	)
}
export default memo(CardSM)
