import { memo, useEffect } from "react"
import { MdExplore } from "react-icons/md"
import Card, { ICard } from "."

interface ICardLG {
	src: string
	text: string
	noExplore?: boolean
	link?: null | string
}

function CardLG({ src, text, noExplore, ...props }: ICardLG | (ICardLG & ICard)) {
	return (
		<>
			<Card src={src} size={"lg"}>
				<h6 className="px-6 pt-2 truncate">sankalesh ashok harak iti mama naam sheyam</h6>
				<h6 className="px-6 text-xs line-clamp-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</h6>
			</Card>
		</>
	)
}

export default memo(CardLG)
