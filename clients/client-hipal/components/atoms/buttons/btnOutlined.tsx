import { Button } from "@material-tailwind/react"
import { memo } from "react"

function BtnOutlined({
	children,
	appendClassNames,
	...props
}: {
	children?: React.ReactNode
	appendClassNames?: string
}) {
	return (
		<Button
			className={
				"border-secondary/80 border text-secondary normal-case shadow-none focus:border-primary-focus active:border-primary-focus " +
				appendClassNames
			}
			variant="outlined"
			{...props}
		>
			{children}
		</Button>
	)
}

export default memo(BtnOutlined)
