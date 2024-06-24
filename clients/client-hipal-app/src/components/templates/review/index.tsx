//@ts-nocheck
"use client"
import { _useAllBusiness } from '@/components/store/useAllBusiness'
import { useLogin } from '@/components/store/useLogin'
import axios from '@/utils/axios'
import Image from 'next/legacy/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, memo, useEffect, useState } from 'react'
import reviewIcon from '@/assets/svg/reviewz.svg'
import success from '@/assets/svg/success-icon.svg'
import HiLogo from '@/assets/img/HipalZ_logo_title.png'
import dummy from '@/assets/img/OTC.png'
import ReviewCoinz from '@/assets/img/review-coinz.png'
import RewardTick from '@/assets/img/Rewarded-tick.png'
import { useQuery } from '@tanstack/react-query'
import { IBusinessData } from '@/components/types/businessData'
import { updateTheme } from '@/components/utils/themes'
import { toast } from 'react-toastify'

export default memo(function Review({ data }: { data: IBusinessData }) {
	const [improvements, setImprovements] = useState<string[]>([])
	const [rating, setRating] = useState<string | null>(null);
	const [description, setDescription] = useState<string | ''>('')
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [filteredStaff, setFilteredStaff] = useState([])
	const [cursor, setCursor] = useState(-1)
	const router = useRouter()
	const params = useParams();
	const businessId = params?.businessId
	const searchParams = useSearchParams()

	const claim = searchParams?.get('claim')
	const orderId = searchParams?.get('orderId')

	const userDetails = useLogin((s) => s.userDetails)

	const getStaff = async () => {
		const response = await axios.get(`/v1/users/${businessId}`)
		return response?.data?.data
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
	const handleRatingChange = (event: ChangeEvent<HTMLInputElement>) => {
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
					reviewRating: Number(rating),
					description: description,
					improvementAreas: improvements,
					date: Date.now(),
					order_id: orderId?.toString()
				},
			}

			const res = await axios(config)
			if (res.status === 201) {
				toast.success('Thank You for Your Feedback')
				router.push(`/r/${businessId}/explore`)
			}
		} catch (error) {
			toast.error('Review Already Submitted')
			router.push(`/r/${businessId}/explore`)
		}
	}

	const improvementAreas = ['Food Taste', 'Waiter & Behavior', 'Ambience', 'Hygiene & Celanese']

	const navigateToExplore = () => {
		router.push(`/r/${businessId}/explore`)
	}

	const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
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

	useEffect(() => {
		if (data?.settings?.themes) {
			updateTheme(data?.settings?.themes)
		}
	}, [data?.settings?.themes])

	return (
		<>
			<div className='p-4 mb-[5rem] animate-fade-up animate-once '>
				<center className='z-[60]'>
					<h6 className='text-[0.75rem] ml-6'>Powered by</h6>
					<figure className='h-24 w-28'>
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
					className='flex flex-col items-center justify-center'
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
					{Number(claim) > 0 && (
						<section className='bg-[#fdf5d7] mt-[5rem] h-[7rem] rounded-3xl flex justify-between'>
							<article className='px-6 py-4 space-y-4'>
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
					)}
					<br />
					<br />
					<h1 className='flex items-center justify-center'>
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
						<section className='flex flex-wrap gap-4 my-2 mt-4 overflow-x-auto'>
							{improvementAreas.map((suggestion: string) => {
								return (
									<div
										onKeyDown={handleSuggestionClick}
										onClick={handleSuggestionClick}
										key={suggestion}
										className={`${improvements.includes(suggestion)
												? 'bg-primary text-base-100 font-medium'
												: 'text-primary bg-base-200'
											} inline-block truncate overflow-hidden px-3 py-1 justify-center items-center border bg-base-100/50 border-[#cacaca] rounded-full text-base`}
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
								className='h-36 block w-full pt-2 pb-3 pl-4 pr-[7rem] mb-0 ml-0 mr-0 !text-primary bg-transparent border-gray-800 rounded-lg border dark:text-white focus:outline-none focus:ring-0 peer'
								placeholder='Write a Review and @Tag the Staff Members here'
								maxLength={600}
							/>
							{showSuggestions && (
								<ul
									className='absolute left-0 w-full mt-0 overflow-auto bg-green-500 border border-gray-300 top-full max-h-60'
									style={{ zIndex: 2 }}
								>
									{filteredStaff?.map((staff, index) => (
										<div key={staff?.name + index}>
											{isPending && <div>Loading staff...</div>}
											{error && <div>Error loading staff!</div>}
											<li
												key={staff?.name}
												className={`p-2 cursor-pointer text-blue-500 ${cursor === index ? 'bg-gray-200' : 'bg-white'
													}`}
												onClick={() => {
													const newText = description.replace(/@\w*$/, `@${staff?.name} `)
													setDescription(newText)
													setShowSuggestions(false)
												}}
											>
												{staff?.name}
											</li>
										</div>
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
							className='pb-1 mb-4 underline'
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