import React, { memo } from "react"

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
	const CustomTag = tag ? (`${tag}` as React.ElementType) : ("h2" as React.ElementType)

	return (
		<center className="flex flex-col no-scrollbar" {...props}>
			<div className="px-4 mb-2 prose">
				<CustomTag className={`!font-semibold !text-2xl text-primary pb-2 ${tagClassName}`}>{title}</CustomTag>
			</div>
			<center>{children}</center>
		</center>
	)
}

const MemoSection = memo(Section)
export default MemoSection
