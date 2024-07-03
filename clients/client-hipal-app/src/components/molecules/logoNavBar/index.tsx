import Image from "next/image"
import React, { memo } from "react"
import HipalLogo from "@/assets/svg/Hipal_logo.svg"

const LogoNavBar = () => {
	return (
		<div
			className={`z-50 bg-[#fef7f5] lg:sticky lg:top-0 lg:flex lg:justify-between lg:w-screen`}
		>
			<div className="py-[2rem] lg:py-[1rem] mx-8 lg:mx-[5.75rem] block lg:hidden">
				<Image src={HipalLogo} alt="logo" height={24} width={69} />
			</div>
			<div className="lg:right-0 py-[2rem] lg:py-[1rem] mx-8 lg:mx-[5.75rem] hidden lg:flex lg:justify-between">
				<div>
					<Image src={HipalLogo} alt="logo" height={54} width={150} />
				</div>
			</div>
			<div className="hidden lg:mr-[5.75rem] lg:flex justify-around items-center text-2xl font-bold">
				{/* <h6 className='mx-4'>Hitable</h6>
						<h6 className='mx-4'>Hikitchen</h6>
						<h6 className='mx-4'>Hipeople</h6> */}
				<a
					href="//api.whatsapp.com/send?phone=919177914130&text=Hi, i would like to know more about Hipal"
					target="_blank"
					rel="noreferrer noopener"
				>
					<div className="bg-[#F2634C] text-white rounded-2xl font-normal px-4 py-2 lg:px-6 lg:py-4">
						<button>Get started</button>
					</div>
				</a>
			</div>
		</div>
	)
}

const MemoLogoNavBar = memo(LogoNavBar)
export default MemoLogoNavBar
