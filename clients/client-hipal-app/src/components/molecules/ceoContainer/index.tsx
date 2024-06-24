import Image from "next/image"
import React from "react"
import CEO from "@/assets/svg/CEO.svg"
import handBottomLg from "@/assets/svg/hand_bottom_lg.svg"
import { BsArrowRight } from "react-icons/bs"
const CeoContainer = () => {
	return (
		<>
			<div className="w-full flex flex-row justify-between lg:justify-around items-center">
				<div
					className="rounded-full lg:rounded-[36.7rem]"
					style={{
						background: "linear-gradient(180deg, #F2634C 0%, rgba(242, 99, 76, 0.00) 78.47%)",
						backgroundPosition: "left center",
					}}
				>
					<Image src={CEO} alt="CEO" className="lg:hidden" height={254} width={216} />
					<Image
						src={CEO}
						alt="CEO"
						className="hidden lg:inline-flex lg:ml-[5rem]"
						height={641}
						width={546}
					/>
				</div>
				<div className="flex flex-col justify-start lg:items-start items-end mr-4">
					<p className="text-base lg:text-3xl font-bold my-2 flex justify-end">
						<span className="text-[#F2634C] mx-2">Pal </span> Support.
					</p>
					<p className="mt-5 2xl:mt-12  text-[#0E1234] text-right lg:text-left text-base lg:text-2xl  font-normal w-20 lg:w-full">
						Ready to get started?
					</p>
					<div className="flex text-center items-center">
						<button className="text-[#F2634C] font-bold text-base 2xl:text-3xl py-2 rounded-3xl">
							Get in Touch
						</button>
						<BsArrowRight size={36} color="#F2634C" className="hidden lg:inline-flex" />
						<BsArrowRight size={20} color="#F2634C" className="lg:hidden" />
					</div>
				</div>
				<div className="hidden lg:flex lg:justify-self-end lg:self-end">
					<Image src={handBottomLg} alt="hand_bottom_lg" height={585} width={275} />
				</div>
			</div>
			<div className="h-1 bg-[#121212] mb-4"></div>
		</>
	)
}

export default CeoContainer
