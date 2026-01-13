import { memo } from "react"
import Card, { type ICard } from "."

interface ICardLG {
	src: string
	text: string
	noExplore?: boolean
	link?: null | string
}

const CardLG = ({ src, text, noExplore, ...props }: ICardLG | (ICardLG & ICard)) =>{
	/** after getting the heading and description text and description has to be added **/
	return (
		<Card src={src} size={"lg"} />
	
		
	)
}

const MemoCardLG = memo(CardLG)
export default MemoCardLG
