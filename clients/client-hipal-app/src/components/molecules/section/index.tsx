import { memo } from "react"

function Section({
	title,
	tag,
	tagClassName,
	children,
	...props
}: {
	title: string
	tag?: string
	tagClassName?: string
	children: React.ReactNode
}) {

	return (
		<center className="flex flex-col no-scrollbar">
			<center>{children}</center>
		</center>
	)
}

const MemoSection = memo(Section)
export default MemoSection
