import Image from "next/image"
import React, { useEffect, useState } from "react"
import Arrow from "@assets/svg/arrow.svg"
import Logo from "@assets/HIPAL_LOGO.svg"
import { IoIosArrowForward } from "react-icons/io"
import { BsEmojiSmile, BsEmojiHeartEyes, BsEmojiFrown } from "react-icons/bs"
import axios from "@utils/axios"
import ProfileHeader from "@components/molecules/profileHeader"

interface Review {
	businessId: string
	comment: string
	keyword: string
	rating: string
	userId: string
	businessLogo: string
	dateTime: string
	businessName: string
}

function ReviewHistory() {
	const [reviewData, setReviewData] = useState<Review[]>([])
	const [search, setSearch] = useState("")

	const handleOnChange = (e) => {
		setSearch(e.target.value)
	}

	useEffect(() => {
		const result = async () => {
			const res = await axios.get("/v1/businesses/get/allreviews")
			setReviewData(res.data.data)
		}

		result()
	}, [])

	const searchUsingReview = reviewData.filter((ele) =>
		ele?.businessName?.toLowerCase().includes(search?.toLowerCase()),
	)

	return (
		<div>
			<ProfileHeader />
			<div className="flex items-center px-[2rem] justify-center mt-2">
				<label htmlFor="simple-search" className="sr-only">
					Search
				</label>
				<div className="relative w-full">
					<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
						<svg
							aria-hidden="true"
							className="w-5 h-5 text-[#FF5019]/80 dark:text-[#FF5019]"
							fill="currentColor"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fill-rule="evenodd"
								d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
								clip-rule="evenodd"
							></path>
						</svg>
					</div>
					<input
						onChange={handleOnChange}
						type="text"
						id="simple-search"
						className="border border-gray-300 text-gray-900 text-sm rounded-xl focus:outline-none focus:border-[#E96108] block w-full pl-10 p-2.5"
						placeholder="Search by restaurant or dish"
					/>
				</div>
			</div>

			<div className="mx-[3rem]">
				<hr />
			</div>

			{searchUsingReview.length > 0 ? (
				<div>
					{searchUsingReview.map((ele, index) => (
						<div key={index} className="bg-[#fbfbfb] h-full pb-[1rem]">
							<div className="pt-[1rem]">
								<div className="relative mx-[2rem] h-auto border bg-white border-[#023047]/20 rounded-xl">
									<div className="relative flex mb-2">
										<div className="bg-white border border-[#023047]/10 ml-[1rem] mt-[1rem] rounded-[0.8rem]">
											<Image
												layout={"intrinsic"}
												quality={75}
												objectFit="contain"
												width={48}
												height={48}
												className="mx-1 my-2"
												src={ele?.businessLogo}
												alt="logo"
											/>
										</div>
										<div className="ml-[1rem] w-auto md:text-[2.5rem] lg:text-[10rem] mt-[1.5rem] text-[#002D4B] text-[1.25rem] font-[550]">
											{ele?.businessName}
										</div>
										<div className="absolute right-[1rem] bottom-4">
											<IoIosArrowForward />
										</div>
									</div>
									<div className="relative">
										<div className="ml-[1rem] text-[0.75rem] font-[300] text-[#002D4B]/50">
											{ele?.dateTime}
										</div>
									</div>
									{ele?.rating === "Could be better" ? (
										<div key={index} className="relative flex">
											<div className="ml-[1rem] my-4 text-[0.75rem] font-[300] text-[#002D4B]">
												You rated : Could be better
											</div>
											<BsEmojiFrown className="my-4 ml-2 text-yellow-900" />
										</div>
									) : ele?.rating === "Awesome" ? (
										<div key={index} className="relative flex">
											<div className="ml-[1rem] my-4 text-[0.75rem] font-[300] text-[#002D4B]">
												You rated : awesome
											</div>
											<BsEmojiHeartEyes className="my-4 ml-2 text-yellow-900" />
										</div>
									) : (
										<div key={index} className="relative flex">
											<div className="ml-[1rem] my-4 text-[0.75rem] font-[300] text-[#002D4B]">
												You rated : {ele?.rating}
											</div>
											<BsEmojiSmile className="my-4 ml-2 text-yellow-900" />
										</div>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			) : searchUsingReview.length === 0 ? (
				<div className="text-center text-3xl mt-[8rem] text-[#002D4B]">No data found</div>
			) : (
				<div>
					{reviewData.map((ele, index) => (
						<div key={index} className="bg-[#fbfbfb] h-full pb-[1rem]">
							<div className="pt-[1rem]">
								<div className="relative mx-[2rem] h-auto border bg-white border-[#023047]/20 rounded-xl">
									<div className="relative flex mb-2">
										<div className="bg-white border border-[#023047]/10 ml-[1rem] mt-[1rem] rounded-[0.8rem]">
											<Image
												layout={"intrinsic"}
												quality={75}
												objectFit="contain"
												width={48}
												height={48}
												className="mx-1 my-2"
												src={ele?.businessLogo}
												alt="logo"
											/>
										</div>
										<div className="ml-[1rem] w-auto md:text-[2.5rem] lg:text-[10rem] mt-[1.5rem] text-[#002D4B] text-[1.25rem] font-[550]">
											{ele?.businessName}
										</div>
										<div className="absolute right-[1rem] bottom-4">
											<IoIosArrowForward />
										</div>
									</div>
									<div className="relative">
										<div className="ml-[1rem] text-[0.75rem] font-[300] text-[#002D4B]/50">
											{ele?.dateTime}
										</div>
									</div>
									{ele?.rating === "Could be better" ? (
										<div key={index} className="relative flex">
											<div className="ml-[1rem] my-4 text-[0.75rem] font-[300] text-[#002D4B]">
												You rated : Could be better
											</div>
											<BsEmojiFrown className="my-4 ml-2 text-yellow-900" />
										</div>
									) : ele?.rating === "Awesome" ? (
										<div key={index} className="relative flex">
											<div className="ml-[1rem] my-4 text-[0.75rem] font-[300] text-[#002D4B]">
												You rated : awesome
											</div>
											<BsEmojiHeartEyes className="my-4 ml-2 text-yellow-900" />
										</div>
									) : (
										<div key={index} className="relative flex">
											<div className="ml-[1rem] my-4 text-[0.75rem] font-[300] text-[#002D4B]">
												You rated : {ele?.rating}
											</div>
											<BsEmojiSmile className="my-4 ml-2 text-yellow-900" />
										</div>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default ReviewHistory
