import Image from "next/image"
import React, { memo } from "react"
import tick from "@/assets/img/tick.png"
import coffeeCup from "@/assets/svg/coffee_cup_logo.svg"
import OTC from "@/assets/svg/OTC_logo.svg"
import FlukeCurry from "@/assets/svg/Fluke_curry_logo.svg"
import nanking from "@/assets/svg/nanking_logo.svg"
import proteify from "@/assets/svg/proteify_logo.svg"
import lacasa from "@/assets/svg/lacasa_logo.svg"
import glasses from "@/assets/svg/glasses.svg"

const MiddleSection = () => {
	return (
		<>
			<div className="lg:text-[3rem] mx-8 lg:mx-[5.75rem] mt-[2rem] flex items-center text-black text-2xl font-bold">
				<span className="font-bold">Trusted by</span>
				<div className="mx-2 lg:hidden">
					<Image src={tick} alt="tick" height={24} width={24} />
				</div>
				<span className="lg:text-[3rem] mx-8 lg:mx-3 lg:inline-flex hidden text-black text-2xl font-bold">
					top rated restaurants
				</span>
				<div className="mx-2 lg:mx-0 hidden lg:inline-flex">
					<Image src={tick} alt="tick" height={24} width={24} />
				</div>
			</div>
			<span className="mx-8 lg:hidden lg:mx-[5.75rem] text-black text-2xl font-bold lg:text-[3rem] ">
				Top rated restaurants
			</span>
			<div className="lg:inline-flex marquee my-10 h-[4.75rem] w-full lg:h-[12rem] lg:my-[5rem] justify-around">
				<Image
					src={coffeeCup}
					alt="coffee cup"
					className="px-5 h-[5rem] w-[8rem] lg:h-[10rem] xl:h-[14rem] lg:w-[10rem] xl:w-[14rem]"
				/>
				<Image
					src={OTC}
					alt="OTC"
					className="px-5 h-[5rem] w-[8rem] lg:h-[10rem] xl:h-[12rem] lg:w-[10rem] xl:w-[14rem]"
				/>
				<Image
					src={FlukeCurry}
					alt="Fluke curry"
					className="px-5 h-[5rem] w-[8rem] lg:h-[10rem] xl:h-[14rem] lg:w-[10rem] xl:w-[14rem]"
				/>
				<Image
					src={nanking}
					alt="nanking"
					className="px-5 h-[5rem] w-[8rem] lg:h-[10rem] xl:h-[14rem] lg:w-[10rem] xl:w-[14rem]"
				/>
				<Image
					src={lacasa}
					alt="lacasa"
					className="px-5 h-[5rem] w-[8rem] lg:h-[10rem] xl:h-[14rem] lg:w-[10rem] xl:w-[14rem]"
				/>
				<Image
					src={proteify}
					alt="proteify"
					className="px-5 h-[5rem] w-[8rem] lg:h-[10rem] xl:h-[12rem] lg:w-[10rem] xl:w-[14rem]"
				/>
				<Image
					src={coffeeCup}
					alt="coffee cup"
					className="px-5 h-[5rem] w-[8rem] lg:h-[10rem] xl:h-[14rem] lg:w-[10rem] xl:w-[14rem]"
				/>
				<Image
					src={OTC}
					alt="OTC"
					className="px-5 h-[5rem] w-[8rem] lg:h-[10rem] xl:h-[12rem] lg:w-[10rem] xl:w-[14rem]"
				/>
				<Image
					src={FlukeCurry}
					alt="Fluke curry"
					className="px-5 h-[5rem] w-[8rem] lg:h-[10rem] xl:h-[14rem] lg:w-[10rem] xl:w-[14rem]"
				/>
				<Image
					src={nanking}
					alt="nanking"
					className="px-5 h-[5rem] w-[8rem] lg:h-[10rem] xl:h-[14rem] lg:w-[10rem] xl:w-[14rem]"
				/>
				<Image
					src={lacasa}
					alt="lacasa"
					className="px-5 h-[5rem] w-[8rem] lg:h-[10rem] xl:h-[14rem] lg:w-[10rem] xl:w-[14rem]"
				/>
				<Image
					src={proteify}
					alt="proteify"
					className="px-5 h-[5rem] w-[8rem] lg:h-[10rem] xl:h-[12rem] lg:w-[10rem] xl:w-[14rem]"
				/>
			</div>
			<div className="mx-8 lg:mx-[5.75rem] flex items-center lg:justify-start justify-center">
				<span className="text-2xl font-bold lg:text-[3rem] leading-8">
					Managing your business has never been so {""}
					<span className="inline-flex font-bold lg:my-6 items-center text-center">
						cool
						<Image src={glasses} alt="glasses" height={10} width={20} className="mx-2 lg:hidden" />
						<Image
							src={glasses}
							alt="glasses"
							height={29}
							width={64}
							className="mx-2 hidden lg:inline-flex"
						/>
					</span>
				</span>
			</div>
			<div className="my-7">
				<h1 className="text-sm lg:text-[2rem] mx-8 lg:mx-[5.75rem] font-bold text-[#F2634C]">
					Here&apos;s what all you get:
				</h1>
			</div>
		</>
	)
}

const MemoMiddleSection = memo(MiddleSection)
export default MemoMiddleSection
