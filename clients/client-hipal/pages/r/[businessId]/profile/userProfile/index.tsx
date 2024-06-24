import Image from "next/image"
import React from "react"
import { MdOutlineCreditScore, MdOutlineBeenhere, MdRedeem } from "react-icons/md"
import { CgProfile } from "react-icons/cg"
import { BiShoppingBag } from "react-icons/bi"
import { RiStarSLine } from "react-icons/ri"
import { useLogin } from "@components/store/useLogin"
import { useRouter } from "next/router"
import Link from "next/link"
import { PAGE_TYPES, routePaths } from "@components/utils/routes"
import { useRoutingFlow } from "@components/store/useRoutingFlow"
import { IoIosArrowBack } from "react-icons/io"
import HipalLogo from "@assets/svg/Hipal_logo.svg"
import { toast } from "react-toastify"

function Profile() {
	const router = useRouter()
	const { businessId } = router.query
	const { getPreviousPath } = useRoutingFlow()

	const userData = useLogin((s) => s.userDetails)
	const comingSoon = () => {
		toast("Feature is Coming Soon")
	}

	return (
		<div className="overflow-x-hidden h-full bg-[#fbfbfb]">
			<div className="text-[#002D4B] rounded-[0.625rem]">
				<div className="relative flex flex-row w-full items-center pt-[1rem] pl-[1rem]">
					<Link href={`${getPreviousPath()}`}>
						<IoIosArrowBack size={24} className="stroke-1" />
					</Link>
					<div className="absolute left-[40%]">
						<Image src={HipalLogo} alt="HipalLogo" />
					</div>
				</div>
				<div className="mt-[3.5rem] flex justify-center items-center">
					<div className="text-4xl flex justify-center items-center rounded-full border w-[110px] h-[110px]  border-1 border-gray-500">
						{userData.name?.[0]}
					</div>
				</div>
				<div className="my-[1.25rem] mx-8 text-center text-[#002D4B]">
					<div className="font-[700] text-[1.875rem] leading-[1.7rem] mb-[0.75rem]">
						{userData.name}
					</div>
					<div className="text-sm font-[400]">Let’s make hipal happen!❤🔥</div>
				</div>
				<div>
					<div className="mx-[1.5rem] rounded-lg bg-primary h-[100px] on_active_bounce flex flex-wrap justify-between items-center text-[#002D4B] my-[1rem]">
						<div onClick={comingSoon}>
							<div className="on_active_bounce ml-[1rem] w-[5.5rem] h-[5.5rem]">
								<div className="flex justify-center">
									<MdOutlineCreditScore
										color={"#fff"}
										className="mt-[1rem] mb-[0.4rem] w-[2rem] h-[2rem]"
									/>
								</div>
								<div className="text-white text-center text-[0.65rem]">Bills</div>
							</div>
						</div>
						<div className="flex items-center h-16 w-0.5 bg-white" />
						<Link href={`${routePaths[PAGE_TYPES.PROFILE_EDIT](`${businessId}`)}`}>
							<div className="mr-[1rem] w-[5.5rem] h-[5.5rem]">
								<div className="flex justify-center">
									<CgProfile color={"#fff"} className="mt-[1rem] mb-[0.4rem] w-[2rem] h-[2rem]" />
								</div>
								<div className="text-white text-center text-[0.65rem]">Edit</div>
							</div>
						</Link>
					</div>
					<div className="flex flex-wrap justify-center space-y-4">
						<div className="mt-[1rem] px-4">
							<div onClick={comingSoon}>
								<button
									type="button"
									className="font-normal px-2 bg-white text-black rounded-full focus:border-l-4 focus:rounded-none focus:border-[#E96108]"
								>
									<div className="relative inline-flex mr-[10rem] mt-1 text-[#002D4B]">
										<div className="w-[2.5rem] mr-[1rem] h-[2.5rem] mt-1 bg-[#D9D9D9]/30 rounded-full">
											<BiShoppingBag className="m-auto mt-3 w-[1rem] h-[1rem]" />
										</div>
										<div className="text-[1rem] leading-[1.125rem]  font-[550] mr-[4.5rem] mt-[0.9rem] ">
											Orders
										</div>
									</div>
								</button>
							</div>
						</div>
						<div className="mt-[1.5rem] px-4">
							<div onClick={comingSoon}>
								<button
									type="button"
									className="font-normal px-2 bg-white text-black rounded-full focus:border-l-4 focus:rounded-none focus:border-[#E96108]"
								>
									<div className="inline-flex mr-[10rem] mt-1 text-[#002D4B]">
										<div className="w-[2.5rem] mr-[1rem] h-[2.5rem] mt-1 bg-[#D9D9D9]/30 rounded-full">
											<RiStarSLine className="m-auto mt-3 w-[1rem] h-[1rem]" />
										</div>
										<div className="text-[1rem] leading-[1.125rem] font-[550]  mr-[3.5rem] mt-[0.9rem] ">
											Reviews
										</div>
									</div>
								</button>
							</div>
						</div>
						<div onClick={comingSoon} className="mt-[1.5rem] px-4">
							<button
								type="button"
								className="font-normal px-2 bg-white text-black rounded-full focus:border-l-4 focus:rounded-none focus:border-[#E96108]"
							>
								<div className="inline-flex mr-[10rem] mt-1 text-[#002D4B]">
									<div className="w-[2.5rem] mr-[1rem] h-[2.5rem] mt-1 bg-[#D9D9D9]/30 rounded-full">
										<MdOutlineBeenhere className="m-auto mt-3 w-[1rem] h-[1rem]" />
									</div>
									<div className="text-[1rem] leading-[1.125rem] font-[550] mr-[3rem] mt-[0.9rem] ">
										Coupons
									</div>
								</div>
							</button>
						</div>
						<div onClick={comingSoon} className="mt-[1.5rem] px-4">
							<button
								type="button"
								className="font-normal px-2 bg-white text-black rounded-full focus:border-l-4 focus:rounded-none focus:border-[#E96108]"
							>
								<div className="inline-flex mr-[10rem] mt-1 text-[#002D4B]">
									<div className="w-[2.5rem] mr-[1rem] h-[2.5rem] mt-1 bg-[#D9D9D9]/30 rounded-full">
										<MdRedeem className="m-auto mt-3 w-[1rem] h-[1rem]" />
									</div>
									<div className="text-[1rem] leading-[1.125rem]  font-[550] mr-[3.5rem] mt-[0.9rem] ">
										Loyalty
									</div>
								</div>
							</button>
						</div>
					</div>
				</div>
				<div className="flex flex-wrap opacity-50 justify-center mt-[15rem]">
					<Image src={HipalLogo} alt="HipalLogo" />
				</div>
				<div className="text-[0.6125rem] pb-[1.5rem] opacity-50 flex flex-wrap justify-center">
					version 1.3
				</div>
			</div>
		</div>
	)
}

export default Profile
