import { memo } from "react"
import Card, { ICard } from "."

interface ICardLG {
	src: string
	text: string
	noExplore?: boolean
	link?: null | string
}

function CardLG({ src, text, noExplore, ...props }: ICardLG | (ICardLG & ICard)) {
	return (
		<Card src={src} size={"lg"}>
			<h6 className="px-6 pt-2 truncate">Spotlight Best cuisines</h6>
			<h6 className="px-6 text-xs line-clamp-2"></h6>
		</Card>
	)
}

export default memo(CardLG)
