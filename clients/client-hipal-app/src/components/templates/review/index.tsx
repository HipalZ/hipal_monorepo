"use client"
import { _useAllBusiness } from '@/components/store/useAllBusiness'
import { useLogin } from '@/components/store/useLogin'
import axios from '@/utils/axios'
import Image from 'next/legacy/image'
import { useParams, useRouter } from 'next/navigation'
import { memo, useEffect, useState } from 'react'
import reviewIcon from '@/assets/svg/reviewz.svg'
import success from '@/assets/svg/success-icon.svg'
import HiLogo from '@/assets/img/HipalZ_logo_title.png'
import dummy from '@/assets/img/OTC.png'
import ReviewCoinz from '@/assets/img/review-coinz.png'
import RewardTick from '@/assets/img/Rewarded-tick.png'
import { useQuery } from '@tanstack/react-query'

export default memo(function Review({ data }: any) {
	const [improvements, setImprovements] = useState<string[]>([])
	const [rating, setRating] = useState(null)
	const [description, setDescription] = useState<string | ''>('')
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [filteredStaff, setFilteredStaff] = useState([])
	const [cursor, setCursor] = useState(-1)
	const router = useRouter()
	const params = useParams();
	const businessId = params?.businessId
	// const { claim, total } = router.query

	const userDetails = useLogin((s) => s.userDetails)

	const getStaff = async () => {
		const response = await axios.get(`/v1/users/${businessId}`)
		return response.data
	}

	const {
		isPending,
		error,
		data: staffList,
	} = useQuery({
		queryKey: ['getStaff', businessId],
		queryFn: getStaff,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		enabled: showSuggestions,
		staleTime: 1000 * 10,
	})

	const handleSuggestionClick = async (event) => {
		const value = event.target.innerText
		if (improvements.includes(value)) {
			setImprovements(improvements.filter((keyword) => keyword !== value))
		} else {
			setImprovements([...improvements, value])
		}
	}
	const handleRatingChange = (event) => {
		setRating(event.target.value)
	}

	const result = async () => {
		try {
			const config = {
				method: 'POST',
				url: '/v1/payments/reviews',
				data: {
					businessId: businessId,
					reviewerName: userDetails?.name,
					reviewerPhone: `91${userDetails?.phone}`,
					reviewRating: rating,
					description: description,
					improvementAreas: improvements,
					date: Date.now(),
				},
			}

			const res = await axios(config)
			if (res.status === 201) {
				router.push(`/r/${businessId}/explore`)
			}
		} catch (error) {
			console.log(error)
		}
	}

	const improvementAreas = ['Food Taste', 'Waiter & Behavior', 'Ambience', 'Hygiene & Celanese']

	const navigateToExplore = () => {
		router.push(`/r/${businessId}/explore`)
	}

	const handleDescriptionChange = (event) => {
		const value = event.target.value
		setDescription(value)

		const parts = value.split(' ')
		const lastPart = parts[parts.length - 1]
		if (lastPart.startsWith('@')) {
			if (!showSuggestions) {
				setShowSuggestions(true)
			}
		} else {
			setShowSuggestions(false)
		}
	}

	// Filter staff list whenever text or staff list updates
	useEffect(() => {
		if (showSuggestions && staffList) {
			const parts = description.split(' ')
			const lastPart = parts[parts.length - 1]
			const searchQuery = lastPart.slice(1)
			const filtered = staffList.filter((staff) =>
				staff.name.toLowerCase().startsWith(searchQuery.toLowerCase()),
			)
			setFilteredStaff(filtered)
			setCursor(-1) // Reset cursor
		}
	}, [staffList, description, showSuggestions])

	const handleKeyDown = (event) => {
		if (event.key === 'ArrowDown' && cursor < filteredStaff.length - 1) {
			setCursor((c) => c + 1)
		} else if (event.key === 'ArrowUp' && cursor > 0) {
			setCursor((c) => c - 1)
		} else if (event.key === 'Enter' && cursor >= 0 && filteredStaff.length > 0) {
			event.preventDefault()
			const selectedName = filteredStaff[cursor]?.name
			const newText = description.replace(/@\w*$/, `@${selectedName} `)
			setDescription(newText)
			setShowSuggestions(false)
		}
	}
	return (
		<>
			<div className='p-4 mb-[5rem] animate-fade-up animate-once '>
				<center className='z-[60]'>
					<h6 className='text-[0.75rem] ml-6'>Powered by</h6>
					<figure className='w-28 h-24'>
						<Image src={HiLogo} alt='HiLogo' priority={true} />
					</figure>
				</center>
				<section
					style={{
						opacity: rating ? 0 : 1,
						transform: rating ? 'translateY(-50px)' : 'translateY(0)',
						transition: 'opacity 0.5s ease, transform 0.5s ease',
						height: rating ? 'block' : '0%',
						display: rating ? 'none' : 'block',
					}}
					className='flex flex-col justify-center items-center'
				>
					<article className='text-center'>
						<Image
							src={success}
							alt='success'
							priority={true}
							width={80}
							height={80}
							className='animate-pulse'
						/>
						<h1 className='text-xl'>Payment Success!</h1>
					</article>
					<br />
					<div className='text-center'>
						{/* <h1 className='text-xl font-semibold'>₹ {total}</h1> */}
						&nbsp;
						<div className='relative'>
							<figure className='absolute left-[41%] z-10 rounded-full'>
								<Image src={dummy} alt='logo' height={52} width={52} />
							</figure>
							<div className='absolute left-[51%] text-xl flex justify-center items-center rounded-full border w-[50px] h-[50px] bg-black text-white'>
								{userDetails?.name?.charAt(0)}
							</div>
						</div>
					</div>
					{/* {Number(claim) > 0 && (
						<section className='bg-[#fdf5d7] mt-[5rem] h-[7rem] rounded-3xl flex justify-between'>
							<article className='space-y-4 px-6 py-4'>
								<h6 className='inline-flex text-[#183d2e] text-lg'>
									You&nbsp;
									<Image src={RewardTick} alt='RewardTick' />
									&nbsp;Rewarded
								</h6>
								<h1 className='text-3xl'>{claim} Coinz</h1>
							</article>
							<br />
							<Image src={ReviewCoinz} alt='ReviewCoinz' />
						</section>
					)} */}
					<br />
					<br />
					<h1 className='flex justify-center items-center'>
						<Image
							src={reviewIcon}
							alt='review'
							priority={true}
							height={35}
							width={35}
							quality={95}
						/>
						&nbsp; <b className='text-base'>Rate us</b>&nbsp; and get more coinz
					</h1>
				</section>
				<section className='m-4'>
					<div className='rate'>
						<input type='radio' id='star5' name='rate' value='5' onChange={handleRatingChange} />
						<label htmlFor='star5' title='text'>
							5 stars
						</label>
						<input type='radio' id='star4' name='rate' value='4' onChange={handleRatingChange} />
						<label htmlFor='star4' title='text'>
							4 stars
						</label>
						<input type='radio' id='star3' name='rate' value='3' onChange={handleRatingChange} />
						<label htmlFor='star3' title='text'>
							3 stars
						</label>
						<input type='radio' id='star2' name='rate' value='2' onChange={handleRatingChange} />
						<label htmlFor='star2' title='text'>
							2 stars
						</label>
						<input type='radio' id='star1' name='rate' value='1' onChange={handleRatingChange} />
						<label htmlFor='star1' title='text'>
							1 star
						</label>
					</div>
				</section>
				{rating && (
					<section className='m-4'>
						<h1>How Can we Improve ?</h1>
						<section className='overflow-x-auto flex flex-wrap gap-4 my-2 mt-4'>
							{improvementAreas.map((suggestion: string) => {
								return (
									<div
										onKeyDown={handleSuggestionClick}
										onClick={handleSuggestionClick}
										key={suggestion}
										className={`${
											improvements.includes(suggestion)
												? 'bg-primary text-base-100 font-medium'
												: 'text-primary bg-base-200'
										} inline-block truncate overflow-hidden px-5 py-2 justify-center items-center border bg-base-100/50 border-[#cacaca] rounded-full`}
									>
										<span>{suggestion}</span>
									</div>
								)
							})}
						</section>
					</section>
				)}
				{rating && (
					<section className='m-4 bg-base-100 shadow-base-100'>
						<div className='relative'>
							<textarea
								onChange={handleDescriptionChange}
								onKeyDown={handleKeyDown}
								value={description}
								style={{ resize: 'none', position: 'relative', zIndex: 1 }}
								id='floating_outlined'
								className='h-36 block w-full pt-2 pb-3 pl-4 pr-[7rem] mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border-gray-800 rounded-lg border dark:text-white focus:outline-none focus:ring-0 focus:border-[#EF522F] dark:border-gray-600 peer'
								placeholder='Write a Review and @Tag the Staff Members here'
								maxLength={600}
							/>
							{showSuggestions && (
								<ul
									className='absolute w-full bg-green-500 border border-gray-300 mt-0 top-full left-0 max-h-60 overflow-auto'
									style={{ zIndex: 2 }}
								>
									{filteredStaff?.map((staff, index) => (
										<>
											{isPending && <div>Loading staff...</div>}
											{error && <div>Error loading staff!</div>}
											<li
												key={staff?.name}
												className={`p-2 cursor-pointer ${
													cursor === index ? 'bg-gray-200' : 'bg-white'
												}`}
												onClick={() => {
													const newText = description.replace(/@\w*$/, `@${staff?.name} `)
													setDescription(newText)
													setShowSuggestions(false)
												}}
											>
												{staff?.name}
											</li>
										</>
									))}
								</ul>
							)}
						</div>
					</section>
				)}
			</div>
			<div className='fixed bottom-0 z-20 w-full py-2 rotate-180 shadow-lg bg-base-100 shadow-base-100'>
				<div className='flex flex-col mx-auto rotate-180 justify-items-center'>
					{rating && rating > 0 ? (
						<button
							type='button'
							onClick={result}
							className={
								'min-h-[3rem] !capitalize btn btn-primary btn-md mx-auto font-normal text-[0.8rem] rounded-full shadow-lg min-w-389 min-w-[95%] my-auto !py-2 '
							}
						>
							Submit
						</button>
					) : (
						<center
							onKeyDown={navigateToExplore}
							onClick={navigateToExplore}
							className='mb-4 underline pb-1'
						>
							{' '}
							Skip{' '}
						</center>
					)}
				</div>
			</div>
		</>
	)
})