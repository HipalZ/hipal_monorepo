import Image from "next/image"
import React, { memo } from "react"
import arrowLine from "@/assets/svg/arrow_line.svg"
import hipalPro from "@/assets/svg/pro_hipal.svg"
import ImageSlider from "./imageSplider"

const BusinessThrive = () => {
	return (
		<>
			<div className="lg:hidden">
				<h1
					style={{ background: "lightgray -126.218px 0px / 146.232% 100.286% no-repeat" }}
					className="text-2xl px-8 pt-[1rem] font-bold text-[#201C44]"
				>
					Let your business thrive with us...
				</h1>
				<div className="flex flex-nowrap overflow-x-auto lg:mr-[3.9rem]">
					<ImageSlider />
				</div>
			</div>
			<div className="lg:flex lg:justify-between lg:mb-[5.63rem] hidden">
				<ImageSlider />
				<div className="lg:pt-[2rem] lg:mr-[5.75rem]">
					<h1 className="text-2xl font-bold text-[#201C44] lg:text-[3rem] leading-[4rem]">
						Let your business thrive with us...
					</h1>
					<div className="border-b-2 border-[#D9D9D9]">
						<h1 className="lg:mt-[4rem] text-2xl my-4 lg:my-3">Hipal.life</h1>
						<p className="text-base text-[#131540] opacity-50  lg:mb-[2rem]">
							Digital menu, Content management system, POS, Customize themes.
						</p>
						<div className="flex items-center my-4">
							<p className="text-2xl ">Check it out </p>
							<div className="mx-2">
								<Image
									src={arrowLine}
									alt="arrow_line"
									height={18}
									width={18}
									className="p-1 bg-[#F2634C] rounded-2xl"
								/>
							</div>
						</div>
					</div>
					<div>
						<div className="my-4">
							<Image src={hipalPro} alt="pro_hipal" height={30} width={110} />
						</div>
						<p className="text-base text-[#131540] opacity-50">
							All hipal.life features + hipeople, hitable, hikitches,
						</p>
						<div className="flex items-center my-4 lg:my-6">
							<p className="text-2xl">Check it out </p>
							<div className="mx-2">
								<Image
									src={arrowLine}
									alt="arrow_line"
									height={18}
									width={18}
									className="p-1 bg-[#F2634C] rounded-2xl"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

const MemoBusinessThrive = memo(BusinessThrive)
export default MemoBusinessThrive
