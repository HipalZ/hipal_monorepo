import * as React from "react"

const texts = [
	"Restaurant Management System",
	"Waiter Management System",
	"Kitchen Management System",
]

export default function TitleTransition() {
	const [index, setIndex] = React.useState(0)

	React.useEffect(() => {
		const interval = setInterval(() => {
			setIndex((prevIndex) => (prevIndex + 1) % texts.length)
		}, 3500)

		return () => clearInterval(interval)
	}, [])

	return (
		<span
			key={texts[index]}
			className="text-[#F2634C] font-semibold lg:w-full text-lg lg:text-[4rem] typed text-center py-10"
		>
			{texts[index]}
		</span>
	)
}
