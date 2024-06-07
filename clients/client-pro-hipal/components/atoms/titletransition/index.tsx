import React, { useEffect, useMemo, useState } from 'react'

interface TitleTransitionProps {
	loyaltySetting: {
		setReward: number | null
	}
	data: string | null
}

export default function TitleTransition({ loyaltySetting, data }: TitleTransitionProps) {
	const [index, setIndex] = useState(0)

	const combinedTexts: string[] = useMemo(() => {
		let dynamicTexts: string[] = []

		if (loyaltySetting?.setReward != null) {
			// Checking for null explicitly
			dynamicTexts.push(`${loyaltySetting.setReward}% Cashback`)
		}

		if (data) {
			dynamicTexts.push('Welcome to')
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
		<div className='relative py-4 overflow-hidden text-center'>
			{combinedTexts.map((text, i) => (
				<span
					key={i}
					className='absolute bottom-0 left-0 text-2xl font-medium transition-all duration-700 ease-in-out font-Montserrat text-accent'
					style={{
						transform: `translateY(${index === i ? 0 : '100%'})`,
						opacity: index === i ? 1 : 0,
					}}
				>
					{text}
				</span>
			))}
		</div>
	)
}