"use client"
import { memo } from "react"

const ReadMore = ({ text, className }: { text: string; className?: string }) => {

	return (
		<p
			className={` inline text-center opacity-80 w-full break-words ${
				className ? className : "text-sm"
			}`}
		>
			{text}
		</p>
	)
}

const MemoReadMore = memo(ReadMore)

export default MemoReadMore
