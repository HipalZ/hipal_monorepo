"use client"
import { _useAllBusiness } from '@/components/store/useAllBusiness'
import { useLogin } from '@/components/store/useLogin'
import axios from '@/utils/axios'
import Image from 'next/legacy/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, memo, useEffect, useState } from 'react'
import reviewIcon from '@/assets/svg/reviewz.svg'
import success from '@/assets/svg/success-icon.svg'
import pendingStatus from '@/assets/payment/pendingStatus.png'
import coinsReview from "@/assets/payment/reviewCoinz.png"
import HiLogoText from '@/assets/img/Hipal_logo_with_white_text.png'
import { useQuery } from '@tanstack/react-query'
import { IBusinessData, User } from '@/components/types/businessData'
import { updateTheme } from '@/components/utils/themes'
import { toast } from 'react-toastify'
import { MdOutlineMessage, MdOutlinePerson } from 'react-icons/md'
import MiddlePopUp from '@/components/atoms/middlePopUp'
import useBusinessDetails from '@/components/store/useBusinessDetails'
import { RxCrossCircled } from 'react-icons/rx'
import { cn } from '@/components/utils/helpers'
import Link from 'next/link'
interface Payload {
	businessId: string;
	reviewerName: string | undefined;
	reviewerPhone: string;
	reviewRating: number;
	description: string;
	date: number;
	order_id: string | undefined;
	staffs: string[];
	foodTaste?: boolean | null;
	ambience?: boolean | null;
	hygiene?: boolean | null;
	service?: boolean | null;
}

export default memo(function Review({ data }: { data: IBusinessData }) {
	const router = useRouter()
	const businessId = useBusinessDetails((s) => s.businessDetails?._id)
	const customLink = useBusinessDetails((s) => s.businessDetails?.customLink)
	const searchParams = useSearchParams()
	const claim = searchParams?.get('claim')
	const roundedOffClaim = Math.round(Number(claim) / 10) * 10
	const orderId = searchParams?.get('orderId')
	const mode = searchParams?.get('mode')
	const amount = parseInt(searchParams?.get('amount') || '0')
	const businessName = useBusinessDetails((s) => s.businessDetails?.businessName);
	const logo = useBusinessDetails((s) => s.businessDetails?.logo);

	const [rating, setRating] = useState<string | null>();
	const [description, setDescription] = useState<string | ''>('')
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
	const [staffs, setStaffs] = useState<User[]>([])
	const [foodTaste, setFoodTaste] = useState(null);
	const [ambience, setAmbience] = useState(null);
	const [hygiene, setHygiene] = useState(null);
	const [service, setService] = useState(null);
	const [openComment, setOpenComment] = useState(false);

	const improvementAreas = [
		{ name: 'Food Taste', state: foodTaste, setState: setFoodTaste },
		{ name: 'Waiter & Behavior', state: service, setState: setService },
		{ name: 'Ambience', state: ambience, setState: setAmbience },
		{ name: 'Hygiene & Celanese', state: hygiene, setState: setHygiene },
	];

	const handleFeedback = (area, value) => {
		area.setState(value);
	};

	const handleSelectStaff = (staff) => {
		if (!selectedStaff.includes(staff)) {
			setSelectedStaff([...selectedStaff, staff]);
		}
	};

	const handleRemoveStaff = (staffToRemove) => {
		setSelectedStaff(selectedStaff.filter(staff => staff !== staffToRemove));
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleSelectStaff(e.target.innerText);
		}
	};

	const userDetails = useLogin((s) => s.userDetails)

	const getStaff = async () => {
		const response = await axios.get(`/v1/users/${businessId}`)
		setStaffs(response?.data?.data)
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


	const handleRatingChange = (event: ChangeEvent<HTMLInputElement>) => {
		setRating(event.target.value)
	}

	const result = async () => {
		let payload: Payload = {
			businessId: businessId,
			reviewerName: userDetails?.name,
			reviewerPhone: `91${userDetails?.phone}`,
			reviewRating: Number(rating),
			description: description,
			date: Date.now(),
			order_id: orderId?.toString(),
			staffs: selectedStaff,
		};

		if (foodTaste === true || foodTaste === false) {
			payload.foodTaste = foodTaste;
		}
		if (ambience === true || ambience === false) {
			payload.ambience = ambience;
		}
		if (hygiene === true || hygiene === false) {
			payload.hygiene = hygiene;
		}
		if (service === true || service === false) {
			payload.service = service;
		}
		try {
			const config = {
				method: 'POST',
				url: '/v1/payments/reviews',
				data: payload,
			}
			const res = await axios(config)
			if (res.status === 201) {
				toast.success('Thank You for Your Feedback')
				router.push(`/r/${customLink}/loyalty?claim=${roundedOffClaim}`)
			}
		} catch (error) {
			toast.error(error?.response?.data?.message)
		}
	}

	const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		const value = event.target.value
		setDescription(value)
	}

	const handleSaveStaff = () => {
		setShowSuggestions(!showSuggestions)
	}

	useEffect(() => {
		if (data?.settings?.themes) {
			updateTheme(data?.settings?.themes)
		}
	}, [data?.settings?.themes])

	return (
		<div className='p-4 animate-fade-up animate-once'>
			<figure className='z-10 flex items-center space-x-2 rounded-full'>
				<Image src={logo} alt='logo' height={38} width={38} />
				<span className='text-2xl capitalize'>{businessName}</span>
			</figure>
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
				{<article className='text-center'>
					{mode !== "online" && <Image
						src={mode === "online" ? success : pendingStatus}
						alt='success'
						priority={true}
						width={125}
						height={125}
						className='animate-pulse'
					/>}
					{mode === "online" ? <h1 className='text-xl'>Payment Success!</h1> : <h1 className='text-xl'>Waiting for confirmation</h1>}
				</article>}
				<br />
				<div className='text-center'>
					<h1 className='text-4xl font-bold'>₹ {amount}</h1>
					&nbsp;
				</div>
				{mode === "offline" ? <center className="text-[0.825rem] bg-base-200 p-2 rounded-full my-2">⚠ You <span className='text-base font-bold'> choose offline</span> , your pay will be confirmed by captain</center> : null}
				{Number(claim) > 0 && <center className="flex items-center justify-center my-4 space-x-4">
					<Image width={137} height={137} src={coinsReview} alt="review-hand" />
					<h1 className="w-32 text-primary"><span className="text-xl">🎉</span> You Won <span className="text-4xl font-bold text-primary">{Math.round(Number(claim))}</span> coinz</h1>
				</center>}
			</section>
			&nbsp;
			<div className="bg-base-200 -mx-4 px-4 pt-4 pb-[10rem]">
				<h1 className='flex items-center justify-center font-semibold text-primary'>
					<Image
						src={reviewIcon}
						alt='review'
						priority={true}
						height={35}
						width={35}
						quality={95}
					/>
					&nbsp; How was your experience
				</h1>
				<center className='m-2'>
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
				</center>
				<Link href={`/r/${customLink}/loyalty?claim=${roundedOffClaim}`}>
					<center
						className='pb-1 mb-8 underline'
					>
						Skip
					</center>
				</Link>
				{rating && (
					<section className="border border-1 rounded-lg border-[#FFC814] bg-white">
						{improvementAreas.length > 0 &&
							improvementAreas.map((each) => (
								<article key={each.name} className="flex justify-between m-5">
									<h1 className="text-sm">{each.name}</h1>
									<div>
										<span
											className={`p-2 rounded-full ${each.state === true ? 'bg-primary' : ''}`}
											onClick={() => handleFeedback(each, true)}
										>
											👍
										</span>
										&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
										<span
											className={`p-2 rounded-full ${each.state === false ? 'bg-primary' : ''}`}
											onClick={() => handleFeedback(each, false)}
										>
											👎
										</span>
									</div>
								</article>
							))}
					</section>
				)}
				&nbsp;
				{rating && <article className="flex justify-around">
					<button onClick={() => setOpenComment(!openComment)} className="flex items-center space-x-2 bg-base-200 px-3 py-1.5 rounded-full">
						<MdOutlineMessage size={20} />
						<span>Comment</span>
					</button>
					<button onClick={() => setShowSuggestions(!showSuggestions)} className="flex items-center space-x-2 bg-base-200 px-3 py-1.5 rounded-full">
						<MdOutlinePerson size={20} />
						<span>
							Tag Staff
						</span>
					</button>
				</article>}
				<br />
				<div className="flex flex-wrap space-x-2">
					{
						selectedStaff && selectedStaff.length > 0 && selectedStaff?.map((staff) => (
							<div key={staff} className="flex ">
								<span className="px-4 my-2 text-black bg-white rounded-md">{staff}</span>
								<RxCrossCircled onClick={() => handleRemoveStaff(staff)} />
							</div>
						)
						)
					}
				</div>
				{openComment && (
					<section className='my-4 bg-white shadow-base-100'>
						<div className='relative'>
							<textarea
								onChange={handleDescriptionChange}
								value={description}
								style={{ resize: 'none', position: 'relative', zIndex: 1 }}
								id='floating_outlined'
								className='h-36 block w-full pt-2 pb-3 pl-4 pr-[7rem] mb-0 ml-0 mr-0 !text-primary bg-transparent border-gray-800 rounded-lg border dark:text-white focus:outline-none focus:ring-0 peer'
								placeholder='Please leave a comment'
								maxLength={600}
							/>
						</div>
					</section>
				)}
				{
					showSuggestions &&
					<MiddlePopUp onSave={handleSaveStaff} show={showSuggestions} onClose={() => setShowSuggestions(!showSuggestions)}>
						<ul
							className='w-full h-[60vh] mt-0 overflow-auto border border-gray-300'
							style={{ zIndex: 2 }}
						>
							<center className="my-4 text-xl font-semibold">Staff members</center>
							{staffs?.map((staff, index) => (
								<div key={staff?.name + index}>
									{isPending && <center>Loading staff...</center>}
									{error && <center>Error loading staff!</center>}
									<li
										key={staff?.name}
										onKeyDown={handleKeyDown}
										onClick={() => handleSelectStaff(staff?.name)}
										className={cn("h-16 p-4 hover:bg-gray-200 text-xl", selectedStaff.includes(staff?.name) && "bg-primary text-white")}
									>
										👤{staff?.name.length > 10 ? `${staff?.name.slice(0, 10)}...` : staff?.name}
									</li>
								</div>
							))}
						</ul>
					</MiddlePopUp>
				}
				<center className="fixed bottom-0 flex justify-center bg-black w-full max-w-[30rem] -mx-4 py-3">
					<figure className='h-12'>
						<Image src={HiLogoText} alt='HiLogo' priority={true} />
					</figure>
					<h6 className='text-[0.75rem] text-white w-20'>Powered by HipalZ</h6>
				</center>
				{rating && rating.length > 0 ? (
					<article className="flex justify-center">
						<button
							onClick={result}
							className="on_active_bounce text-base-100 fixed bottom-20 z-50 w-[20.5rem] rounded-full bg-primary py-[0.75rem] text-[18px] leading-[1.15rem]"
						>
							Submit
						</button>
					</article>
				) : (
					null
				)}
			</div>
		</div>
	)
})