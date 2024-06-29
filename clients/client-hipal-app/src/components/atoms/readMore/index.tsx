"use client"
import { memo, useState } from "react"

const ReadMore = ({ text, className }: { text: string; className?: string }) => {
	const [isReadMore, setIsReadMore] = useState(true)
	// TODO callback and prev
	const toggleReadMore = () => {
		setIsReadMore(!isReadMore)
	}
	return (
		<p
			className={` inline opacity-80 font-light w-full break-words ${
				className ? className : "text-sm"
			}`}
			onClick={toggleReadMore}
		>
			{text}
		</p>
	)
}

export default memo(ReadMore)
