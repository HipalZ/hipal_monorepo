import BackButton from '@components/atoms/backButton'
import {
	beans,
	bowl,
	bud,
	flower,
	love,
	triangleToDataurl,
	waveToDataUrl,
} from '@components/atoms/card/pathPattern'
import { initializeAllBusiness } from '@components/store/useAllBusiness'
import { useLogin } from '@components/store/useLogin'
import useLoyaltyData from '@components/store/useLoyaltyData'
import { useRewardHistory } from '@components/store/useRewardHistory'
import useUserReward from '@components/store/useUserReward'
import { paths } from '@components/utils/paths'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import axios from '@utils/axios'
import Image from 'next/image'
import { useRouter } from 'next/router'
import type { NextRequest, NextResponse } from 'next/server'
import { memo, useEffect, useState } from 'react'
import Gift from '@assets/gift.png'
import useBusinessDetails from '@components/store/useBusinessDetails'
import Footer from '@components/molecules/footer'
import Hundred from '@assets/100.png'
import Cal from '@assets/cal.png'
import Cracker from '@assets/crack.png'
import DishData from '@components/atoms/dishDescription'
import LoyatyIm from '@assets/loyalty.png'
import Link from 'next/link'
import MainLoyalty from '@components/atoms/mainLoyalty'

function LoyaltyCardPage({ data }) {
	const router = useRouter()
	const { businessId } = router.query as { businessId: string }
	const { loyaltySetting, setLoyaltySetting } = useLoyaltyData()
	const { setRewardHistory } = useRewardHistory()
	const { phoneNumber } = useLogin()
	const userName = useLogin((s) => s.userDetails.name)
	const [image, setImage] = useState<any>('')
	const [cardPattern, setCardPattern] = useState('')
	const [cardColor, setCardColor] = useState('')
	const [fontColor, setFontColor] = useState('#FAE8CA')
	const [logo, setLogo] = useState<any>('')
	const setUserReward = useUserReward((s) => s.setUserReward)
	const businessDetails = useBusinessDetails((s) => s.businessDetails)
	const loyaltyId = useLogin((s) => s.loyaltyOneId)
	const [HiCode, setHiCode] = useState()
	const [rewards, setRewards] = useState()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isHicodeModalOpen, setIsHicodeModalOpen] = useState(false)
	const [count, setCount] = useState(0)
	const direction = useLogin((s) => s.direction)

	const findPattern = (pattern: string) => {
		const value = srcColor?.find((item) => item?.src?.hasOwnProperty(pattern))
		return value?.src
	}
	const srcColor = [
		{
			src: { wave: waveToDataUrl(loyaltySetting?.cardColor, 'white').wave },
		},
		{
			src: {
				triangle: triangleToDataurl('white').triangle,
			},
		},
		{
			src: {
				beans: beans(loyaltySetting?.fontColor).beans,
			},
		},
		{
			src: { bud: bud(loyaltySetting?.fontColor).bud },
		},
		{
			src: { bowl: bowl(loyaltySetting?.fontColor).bowl },
		},
		{
			src: { love: love(loyaltySetting?.fontColor).love },
		},
		{
			src: { flower: flower(loyaltySetting?.fontColor).flower },
		},
	]

	useEffect(() => {
		if (loyaltySetting?.loyaltyId) {
			setLogo(loyaltySetting?.logo)
			setCardPattern(loyaltySetting?.cardPattern)
			setCardColor(loyaltySetting?.cardColor)
			setFontColor(loyaltySetting?.fontColor)
		}
	}, [loyaltySetting])
	useEffect(() => {
		if (loyaltySetting.loyaltyId) {
			const patterns = (cardPattern, fontColor) => {
				const defaultColor = '#FAE8CA'
				fontColor = fontColor || defaultColor

				const src = {
					wave: waveToDataUrl('#000000', 'white').wave,
					triangle: triangleToDataurl('white').triangle,
					beans: beans(fontColor).beans,
					bud: bud(fontColor).bud,
					bowl: bowl(fontColor).bowl,
					love: love(fontColor).love,
					flower: flower(fontColor).flower,
				}
				return src[cardPattern]
			}
			patterns(loyaltySetting?.cardPattern, loyaltySetting?.fontColor)
			setImage(patterns(loyaltySetting?.cardPattern, loyaltySetting?.fontColor))
		}
	}, [loyaltySetting, cardPattern, fontColor])

	const getUserRewardHistory = async (loyaltyId) => {
		const config2 = {
			method: 'GET',
			url: paths.getUserRewardHistory(Number(phoneNumber), loyaltyId),
		}
		try {
			const response = await axios(config2)
			if (response?.data) {
				setRewardHistory(response?.data)
			}
		} catch (err) {
			console.log(err)
		}
	}

	const getUserRewards = async (loyaltyId) => {
		const config = {
			method: 'GET',
			url: paths.getUserReward(Number(phoneNumber), loyaltyId),
		}
		try {
			const response = await axios(config)
			if (response?.data) {
				setHiCode(response?.data?.password)
				setRewards(response?.data?.rewards)
				setUserReward(response?.data)
			}
			if (response?.data?.scanCount !== 0) {
				setCount(response?.data?.scanCount)
				setTimeout(() => setIsModalOpen(true), 2000)
			}
		} catch (err) {
			console.log(err)
		}
	}

	const getLoyaltyCard = async () => {
		try {
			const response = await axios(paths.getLoyaltySettings(businessId))
			console.log(response)
			setLoyaltySetting(response?.data)
			findPattern(response?.data?.cardPattern)
			getUserRewards(response?.data.loyaltyId)
		} catch (err) {
			console.log(err)
		}
	}

	useEffect(() => {
		getLoyaltyCard()
	}, [businessId])

	useEffect(() => {
		initializeAllBusiness(data)
	}, [data])

	
	const getLink = async (loyaltyId: string) => {
		await getUserRewardHistory(loyaltySetting?.loyaltyId)
		return router.push(routePaths[PAGE_TYPES.LOYALTY_BY_ID](businessId, loyaltyId))
	}
	const gotoExplore = () => {
		return routePaths[PAGE_TYPES.EXPLORER](businessId)
	}

	return (
		<>
			<div className='relative flex flex-col w-full pt-4 pb-[5rem] bg-base-100'>
				<div className='relative'>
					<div
						className='mx-6 pb-[7rem]'
						style={{
							zIndex: 10,
						}}
					>
						<div className='flex items-center justify-between'>
							<BackButton onBackURL={gotoExplore()} />
							{(loyaltySetting?.loyaltyId || loyaltyId) && (
								<button
									type="button"
									onClick={() => getLink(loyaltySetting?.loyaltyId || loyaltyId)}
									className='px-4 py-2 border on_active_bounce bg-base-100 text-primary border-primary rounded-2xl'
								>
									Get History
								</button>
							)}
						</div>
						{data?.businessesData?.businessName && (
							<h3 className='flex justify-start my-0 mt-4 text-xl font-semibold capitalize text-base-content'>
								{data?.businessesData?.businessName}
							</h3>
						)}
						<div className='flex space-x-2'>
							<div className='text-3xl'>Yummy coinz card</div>
							<Image src={Gift} alt='gift' />
						</div>
						<div className='flex items-center mt-8 space-x-6 text-center justify-evenly'>
							<div className='w-[8rem] max-w-[10rem] h-[5rem] max-h-[10rem] p-2 rounded-md bg-primary text-primary-content'>
								<div className='text-2xl font-bold'>{loyaltySetting.setClaimAmount}%</div>
								<div className='text-xs'>Redemption on all Bills</div>
							</div>
							<div className='w-[8rem] max-w-[10rem] h-[5rem] max-h-[10rem] p-2 rounded-md bg-primary text-primary-content'>
								<div className='text-2xl font-bold'>{loyaltySetting.setReward}%</div>
								<div className='text-xs'>on every payment</div>
							</div>
							<div className='w-[8rem] max-w-[10rem] h-[5rem] max-h-[10rem] p-2 rounded-md bg-primary text-primary-content'>
								<div className='text-2xl font-bold'>365</div>
								<div className='text-xs'>Valid for whole 1 year</div>
							</div>
						</div>
					</div>
					<div className='px-4 overflow-hidden'>
						<div className='absolute w-[100vw] bg-base-200 h-[9rem] -ml-[3rem] rotate-12 mt-[3.2rem]'></div>
					</div>

					<div className='w-full px-6 pt-[6rem] mt-[6rem] bg-base-200'>
						<div
							onClick={()=>setIsHicodeModalOpen(true)}
							style={{
								backgroundImage: `url(${image})`,
								backgroundColor: cardColor || 'primary',
								backgroundSize: `${
									cardPattern === 'beans' ||
									cardPattern === 'bowl' ||
									cardPattern === 'love' ||
									cardPattern === 'flower' ||
									cardPattern === 'bud'
										? '125px 75px'
										: 'cover'
								}`,
								backgroundPosition: `${
									cardPattern === 'beans' ||
									cardPattern === 'bowl' ||
									cardPattern === 'love' ||
									cardPattern === 'flower' ||
									cardPattern === 'bud'
										? 'right 5% top 50%'
										: ''
								}`,
								backgroundRepeat: 'no-repeat',
								transformStyle: 'preserve-3d',
								transform: 'rotateZ(10deg)',
								transition: 'transform 0.9s',
								WebkitTransformStyle: 'preserve-3d',
								WebkitTransition: 'transform 0.9s',
							}}
							className={`'justify-between'  ${
								cardColor ? cardColor : 'bg-primary'
							} text-base-content flex flex-col absolute top-0 rounded-2xl w-[70%] mt-[20.5rem] left-0 right-0 m-auto h-[10rem] border border-1 mb-14 transition-transform duration-500`}
						>
								<>
									<div
										style={{
											maxWidth: 'calc(20%)',
											whiteSpace: 'nowrap',
										}}
										className='mx-[1rem] mt-[1rem]'
									>
										<Image
											src={logo || data?.businessesData?.logo}
											alt='logo'
											height={100}
											width={100}
										/>
									</div>
									<h1
										style={{
											color: `${fontColor}`,
										}}
										className={`${
											fontColor ? '' : 'text-primary-content'
										} flex self-center text-3xl font-semibold`}
									>
										{rewards}{' '}
										<span
											style={{ color: `${fontColor}` }}
											className={`${
												fontColor ? `text-[${fontColor}]` : 'text-primary-content'
											} text-sm flex self-center ml-2 `}
										>
											Coins
										</span>
									</h1>
									<h1
										style={{
											color: `${fontColor}`,
										}}
										className={`${
											fontColor ? `text-[${fontColor}]` : 'text-primary-content'
										} capitalize mx-[1rem] mb-[1rem] flex self-start text-lg `}
									>
										{userName}
									</h1>
								</>
							
						</div>
						<div className='pt-4 pb-12 mt-6 text-xl text-center'>
							<div>We reward you for your</div>
							<div>love for {businessDetails?.businessName}</div>
						</div>
					</div>


					<div className='pt-8 pb-4 text-xl text-center'>It&#39;s Reward time</div>
					<div className='space-y-4'>
						<div className='flex flex-row items-center justify-between p-4 mx-6 bg-base-200/70 rounded-xl'>
							<div className='w-[60%]'>
								<div className='pb-2 text-xl font-semibold text-accent'>
									{loyaltySetting?.setReward}% off Everytime
								</div>
								<div className='text-xs text-base-content opacity-70'>
									Get {loyaltySetting?.setReward}% off on every time you pay the bill and will be
									added in your wallet for next use
								</div>
							</div>
							<div className='w-[30%]'>
								<Image width={100} height={100} src={Cracker} alt='gift' />
							</div>
						</div>
						<div className='flex flex-row items-center justify-between p-4 mx-6 bg-base-200/70 rounded-xl'>
							<div className='w-[70%]'>
								<div className='pb-2 text-xl font-semibold text-accent'>
									{loyaltySetting?.setClaimAmount}% Redemption
								</div>
								<div className='text-xs text-base-content opacity-70'>
									Redeem {loyaltySetting?.setClaimAmount}% of yummy coinz collected on every bill
								</div>
							</div>
							<div className='w-[30%]'>
								<Image width={100} height={100} src={Hundred} alt='gift' />
							</div>
						</div>
						<div className='flex flex-row items-center justify-between p-4 mx-6 bg-base-200/70 rounded-xl'>
							<div className='w-[60%]'>
								<div className='pb-2 text-xl font-semibold text-accent'>365 Days</div>
								<div className='text-xs text-base-content opacity-70'>
									All your redeemed coinz are safe to use for 1 year from the time of redemption
								</div>
							</div>
							<div className='w-[30%]'>
								<Image width={100} height={100} src={Cal} alt='gift' />
							</div>
						</div>
					</div>
				</div>
				<Footer />
			</div>
			<div className='fixed bottom-0 z-20 flex items-center justify-between w-full px-6 py-4 space-x-4 shadow-2xl bg-base-100 shadow-base-100'>
				<button
					onClick={()=>setIsHicodeModalOpen(true)}
					className='w-full px-4 py-3 bg-primary text-primary-content rounded-2xl'
				>
					Reedem
				</button>
			</div>
			{isModalOpen && direction == 'scan' && (
				<DishData show={isModalOpen} onClose={() => setIsModalOpen(false)}>
					<div className='pt-4 text-center syne-font-bold'>
						{count == 1 && (
							<div className='text-xl font-semibold text-base-content'>Congratulation</div>
						)}
						<div className='px-12 text-3xl text-accent'>
							{count == 1 ? 'You got 50 Coinzz!!' : 'You have already collected the coinz!'}
						</div>
						<div className='flex items-center justify-center -mt-8'>
							<Image width={400} height={50} src={LoyatyIm} alt='Loyalty' />
						</div>
						<Link href={gotoExplore()}>
							<button type='button' className='inline-block py-3 mb-4 w-[80%] rounded-full bg-primary text-primary-content text-center'>
								Lets go
							</button>
						</Link>
					</div>
				</DishData>
			)}
			{isHicodeModalOpen && (
					<DishData show={isHicodeModalOpen} onClose={() => setIsHicodeModalOpen(false)}>
						<MainLoyalty
						hiCode={HiCode}
							logo={businessDetails?.logo}
							cardColor={loyaltySetting?.cardColor}
							fontColor={loyaltySetting?.fontColor}
							src={findPattern(loyaltySetting?.cardPattern) || beans(loyaltySetting?.fontColor)}
						/>
					</DishData>
				)}
		</>
	)
}

export default memo(LoyaltyCardPage)

async function fetchAllBusinessIds() {
	const response = await axios.get(paths.listAllBusiness())
	return response.data.map((business) => business.id)
}
// // Only grab the entry for this page
export async function getStaticPaths() {
	try {
		// Replace with a function that fetches all business IDs from your database or API
		const businessIds = await fetchAllBusinessIds()
		const paths = businessIds.map((businessId) => ({
			params: { businessId: businessId },
		}))

		return { paths, fallback: 'blocking' }
	} catch (error) {
		// console.error('Error fetching business IDs:', error)
		return { paths: [], fallback: 'blocking' }
	}
}

export async function getStaticProps(context: {
	req: NextRequest
	res: NextResponse
	params: { businessId: string }
}) {
	try {
		const businessId = context?.params?.businessId || ''
		const settings = (await axios(paths.settings(businessId))) || {}
		const businessesData = await axios(paths.businessData(businessId))
		const data = {}

		data['settings'] = JSON.parse(JSON.stringify(settings?.data?.[0])) || {}
		data['businessesData'] = businessesData?.data || {}

		initializeAllBusiness(data)
		return {
			props: {
				data,
			},
			revalidate: 1020,
		}
	} catch (err: any) {
		// console.error('Error fetching data for dish:', err.message, err.response?.data)
		return {
			redirect: {
				destination: `/r/${context?.params?.businessId}/explore`,
			},
		}
	}
}