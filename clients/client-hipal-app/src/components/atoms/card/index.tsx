import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/legacy/image"
import { memo } from "react"
import PlaceholderImg from "../placeholder"

export interface ICard extends React.HTMLAttributes<HTMLButtonElement> {
	size:  "lg"
	src: string
	appendCardClassNames?: string
	appendTextClassNames?: string
	innerContentTop?: boolean
	isOuterContent?: boolean
	children: React.ReactNode
}

function Card({
	size,
	src,
	innerContentTop,
	isOuterContent,
	appendCardClassNames,
	appendTextClassNames,
	children,
	...props
}: ICard) {

	const defaultClasses = {
		mainCard:
			"py-1 prose relative overflow-hidden rounded-2xl mb-6 bg-base-100 border-0 capitalize",
		imageSize: "",
		innerContent: ` px-3 w-full rounded-md capitalize font-normal truncate text-black flex  text-sm overflow-hidden `,
		outerContent: "w-full z-10 flex flex-row bg-base-200",
	}

	const classes = {
		lg: {
			mainCard: "w-[21rem] min-w-[90%] h-[21rem] mx-auto",
			imageSize: "",
			innerContent: `p-3 !h-full ${innerContentTop ? "items-start" : "items-end"} !text-xs`,
			outerContent: "px-3 py-1 bg-base-200",
		},
	}
	return (
		<button
			className={`${defaultClasses.mainCard} ${classes[size].mainCard} ${appendCardClassNames}`}
			{...props}
		>
			<div className={`${defaultClasses.imageSize} ${classes[size].imageSize} `}>
				{src?.length > 0 ? (
					<Image
						src={src}
						quality={95}
						width={100}
						height={100}
						layout="fill"
						objectFit="cover"
						alt={src}
						placeholder="blur"
						blurDataURL={getRandomBlurImg(100, 100)}
					/>
				) : (
					<>
						<PlaceholderImg />
					</>
				)}
			</div>
				/** after getting the heading and description bg-base-200 has to be added **/
			<div className={`${isOuterContent ? 'bg-base-200':''} absolute bottom-0 w-full h-[5.5rem] text-left`}>
				{children}
			</div>
		</button>
	)
}

export default memo(Card)
