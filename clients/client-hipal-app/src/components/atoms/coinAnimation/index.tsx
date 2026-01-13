import { useEffect } from "react"

const CoinSVG = () => {
	useEffect(() => {
		const coin = document.querySelector(".coin-svg")
		coin && coin.classList.add("backInUp")
	}, [])

	return (
		<div className="coin-container">
			<svg
				className="coin-svg"
				width="136"
				height="129"
				viewBox="0 0 136 129"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
					<linearGradient
						id="paint0_linear_2001_18666"
						x1="69.9058"
						y1="31.2489"
						x2="80.1945"
						y2="92.1739"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="#F0D787" />
						<stop offset="1" stopColor="#F6BB00" />
					</linearGradient>
					<linearGradient
						id="paint1_linear_2001_18666"
						x1="69.9058"
						y1="31.2489"
						x2="80.1945"
						y2="92.1739"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="#F0D787" />
						<stop offset="1" stopColor="#F6BB00" />
					</linearGradient>
				</defs>
				<ellipse
					cx="67.8584"
					cy="64.1723"
					rx="60.6107"
					ry="56.3803"
					transform="rotate(-7.3893 67.8584 64.1723)"
					fill="#8D0F16"
				/>
				<path
					d="M130.935 57.0747C132.767 87.9667 109.206 114.495 78.3118 116.326C47.4172 118.158 20.8875 94.5998 19.056 63.7078C17.2245 32.8158 40.7847 6.28799 71.6792 4.45631C102.574 2.62463 129.103 26.1827 130.935 57.0747Z"
					fill="#E63C45"
					stroke="#8D0F16"
					strokeWidth="1.06339"
				/>
				<path
					d="M95.0123 37.8463L51.3646 45.2174L52.3648 51.1394L88.8537 44.9773L56.837 82.8973L57.6716 87.8392L102.484 80.2715L101.484 74.3495L63.797 80.7138L95.8399 42.7474L95.0123 37.8463Z"
					fill="#8D0F16"
				/>
				<path
					d="M58.731 38.475L58.1158 34.832L84.7305 30.3374L85.3457 33.9804L74.1692 35.8679L83.219 89.4563L94.4251 87.5638L95.0489 91.2573L68.2581 95.7816L67.6344 92.0881L79.3628 90.1075L70.313 36.5191L58.731 38.475Z"
					fill="#8D0F16"
				/>
				<path
					d="M93.5316 36.5044L49.8839 43.8754L50.8841 49.7975L87.373 43.6354L55.3563 81.5554L56.1908 86.4973L101.003 78.9296L100.003 73.0075L62.3163 79.3719L94.3592 41.4054L93.5316 36.5044Z"
					fill="url(#paint0_linear_2001_18666)"
					filter="url(#glow)"
				/>
				<path
					d="M57.2503 37.1331L56.6351 33.49L83.2498 28.9955L83.865 32.6385L72.6885 34.5259L81.7383 88.1143L92.9444 86.2219L93.5682 89.9154L66.7774 94.4397L66.1537 90.7462L77.882 88.7656L68.8323 35.1772L57.2503 37.1331Z"
					fill="url(#paint1_linear_2001_18666)"
					filter="url(#glow)"
				/>
			</svg>
		</div>
	)
}

export default CoinSVG
