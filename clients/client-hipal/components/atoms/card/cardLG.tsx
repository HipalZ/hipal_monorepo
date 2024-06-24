import { memo, useEffect } from "react"
import { MdExplore } from "react-icons/md"
import Card, { ICard } from "."

interface ICardLG {
	src: string
	text: string
	noExplore?: boolean
	link: null | string
}

function CardLG({ src, text, noExplore, ...props }: ICardLG | (ICardLG & ICard)) {
	return (
		<>
			<Card src={src} size={"lg"} appendCardClassNames="relative" {...props}>
				<div className=" flex flex-row w-full pl-[0.75rem]">
					<span className="my-auto text-lg font-normal tracking-wider capitalize truncate">
						{text}
					</span>
				</div>
				{props.link !== null && (
					<div className="flex flex-row px-2 mt-auto ml-auto space-x-1 rounded-full 2 btn btn-sm btn-primary -py-2">
						<MdExplore className="my-auto text-lg" />
						<span className="right-2 text-sm pr-1 my-auto pt-0.5  font-light tracking-wider capitalize">
							Explore
						</span>
					</div>
				)}
			</Card>
		</>
	)
}

export default memo(CardLG)
