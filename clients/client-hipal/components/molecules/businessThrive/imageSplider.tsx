import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"

import businessThrive1 from "@assets/img/businessThrive1.png"
import businessThrive2 from "@assets/img/businessThrive2.png"
import businessThrive3 from "@assets/img/businessThrive3.png"
import businessThrive4 from "@assets/img/businessThrive4.png"
const images = [businessThrive1, businessThrive2, businessThrive3, businessThrive4]

const ImageSlider = () => {
	const [activeIndex, setActiveIndex] = useState(0)
	const sliderRef = useRef(null)

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveIndex((prevIndex) => (prevIndex + 1) % images.length)
		}, 3000)

		return () => clearInterval(interval)
	}, [])

	return (
		<>
			<div
				style={{ background: "lightgray -126.218px 0px / 146.232% 100.286% no-repeat" }}
				className="relative w-[54rem] lg:mr-[3.9rem] overflow-hidden lg:h-[597px] h-[400px] bg-lightgray"
			>
				<div className="relative flex flex-nowrap w-full">
					{images.map((image, index) => (
						<div
							key={index}
							style={{
								opacity: activeIndex === index ? 1 : 0,
								transition: "opacity 0.9s",
								height: "100%",
								width: "100%",
							}}
							className="absolute top-0 left-0 w-full h-full transition-all duration-1000"
						>
							<Image
								src={image}
								alt={`bThrive-${index}`}
								className="lg:h-[597px] h-[350px] bg-lightgray"
							/>
						</div>
					))}
				</div>
				<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
					{images.map((_, index) => (
						<button
							key={index}
							onClick={() => setActiveIndex(index)}
							className={`h-2 w-2 rounded-full ${
								activeIndex === index ? "bg-black" : "bg-gray-300"
							}`}
						></button>
					))}
				</div>
			</div>

			{/* <div
				className='relative lg:h-[597px] h-[200px] w-[54rem] lg:mr-[3.9rem] overflow-hidden'
				style={{
					background: 'lightgray -126.218px 0px / 146.232% 100.286% no-repeat',
				}}
			>
				<div
					style={{ background: 'lightgray -126.218px 0px / 146.232% 100.286% no-repeat' }}
					className='relative flex flex-nowrap w-full transition delay-100 duration-700'
				>
					{images.map((image, index) => (
						<div
							key={index}
							style={{
								opacity: activeIndex === index ? 1 : 0,
								transition: 'opacity 0.7s',
								// height: '597px',
								// width: '864px',
							}}
							className='absolute top-0 left-0 w-full h-full transition-opacity'
						>
							<Image
								src={image}
								alt={`bThrive-${index}`}
								height={597}
								width={864}
								objectFit='cover'
							/>
						</div>
					))}
				</div>
				<div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2'>
					{images.map((_, index) => (
						<button
							key={index}
							onClick={() => setActiveIndex(index)}
							className={`h-2 w-2 rounded-full ${
								activeIndex === index ? 'bg-black' : 'bg-gray-300'
							}`}
						></button>
					))}
				</div>
			</div> */}
		</>
	)
}

export default ImageSlider
