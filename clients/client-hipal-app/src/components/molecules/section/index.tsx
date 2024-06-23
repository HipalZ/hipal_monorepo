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
		<section className="flex flex-col my-2" {...props}>
			<div className="px-4 mb-2 prose">
				<CustomTag className={`!font-medium !text-xl pb-2 ${tagClassName}`}>{title}</CustomTag>
			</div>

			<div>{children}</div>
		</section>
	)
}

export default memo(Section)
