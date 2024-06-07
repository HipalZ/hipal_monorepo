import { motion } from "framer-motion";
import { memo, useEffect, useState } from "react";

const NumberAnimation = ({ number }) => {
	const [displayNumber, setDisplayNumber] = useState(number);

	useEffect(() => {
		let start = 0;
		const end = number;
		if (start === end) return;

		const totalDuration = 2000;
		const incrementTime = 20;
		const fastIncrementDuration = Math.min(totalDuration, 1000);
		const slowIncrementDuration = totalDuration - fastIncrementDuration;

		// Fast increment phase
		let fastIncrementSteps = Math.floor(fastIncrementDuration / incrementTime);
		let fastIncrementAmount = Math.floor(end / fastIncrementSteps);

		let fastIncrementTimer = setInterval(() => {
			start += fastIncrementAmount;
			if (start >= end) {
				start = end;
				clearInterval(fastIncrementTimer);
			}
			setDisplayNumber(start);
		}, incrementTime);

		// Smooth transition phase
		setTimeout(() => {
			clearInterval(fastIncrementTimer);
			const remainingSteps = slowIncrementDuration / incrementTime;
			const remainingIncrement = (end - start) / remainingSteps;
			let smoothIncrementTimer = setInterval(() => {
				start += remainingIncrement;
				if (start >= end) {
					start = end;
					clearInterval(smoothIncrementTimer);
				}
				setDisplayNumber(Math.floor(start));
			}, incrementTime);
		}, fastIncrementDuration);

		return () => {
			clearInterval(fastIncrementTimer);
		};
	}, [number]);

	return (
		<motion.div
			className="text-[3rem] text-center font-black uppercase text-[#015845]"
			initial={{ y: -20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.9, ease: "easeOut" }}
		>
			{displayNumber}
		</motion.div>
	);
};

export default memo(NumberAnimation);
