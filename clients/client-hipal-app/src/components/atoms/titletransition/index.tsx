import React, { memo, useEffect, useMemo, useState } from "react"

interface TitleTransitionProps {
	loyaltySetting: {
		setCashBackPercentage: number | null
	}
	data: string | null
	align?: "left" | "center" | "right"
}

function TitleTransition({ loyaltySetting, data, align }: TitleTransitionProps) {
	const [index, setIndex] = useState(0)

	const combinedTexts: string[] = useMemo(() => {
		let dynamicTexts: string[] = []

		if (loyaltySetting?.setCashBackPercentage != null) {
			dynamicTexts.push(`${loyaltySetting.setCashBackPercentage}% Cashback`)
		}

		if (data) {
			dynamicTexts.push("Welcome to")
			dynamicTexts.push(` ${data}`)
		}

		return dynamicTexts
	}, [loyaltySetting, data])

	useEffect(() => {
		const interval = setInterval(() => {
			setIndex((prevIndex) => (prevIndex + 1) % combinedTexts.length)
		}, 1500)

		return () => clearInterval(interval)
	}, [combinedTexts])

	return (
		<div className="relative py-4 overflow-hidden text-center syne-font">
			{combinedTexts.map((text, i) => (
				<span
					key={`text-${i}`}
					className={`absolute bottom-0 font-medium transition-all duration-700 ease-in-out ${align == "left" ? "left-0 text-2xl" : "left-0 right-0 mx-auto text-3xl"}  font-Montserrat text-accent`}
					style={{
						transform: `translateY(${index === i ? 0 : "100%"})`,
						opacity: index === i ? 1 : 0,
					}}
				>
					{text}
				</span>
			))}
		</div>
	)
}

const MemoTitleTransition = memo(TitleTransition)
export default MemoTitleTransition