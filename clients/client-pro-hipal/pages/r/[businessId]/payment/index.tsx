import { getItemsData, getTimeIn12HrFormat } from '@components/utils/helpers'
import { getRandomBlurImg } from '@components/utils/images'
import confetti from 'canvas-confetti'
import { initializeAllBusiness, useAllBusiness } from '@components/store/useAllBusiness'
import { isEmpty, set } from 'lodash-es'
import { MdCurrencyRupee, MdKeyboardArrowRight, MdOutlineChevronLeft } from 'react-icons/md'
import { memo, useEffect, useState } from 'react'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import { paths } from '@components/utils/paths'
import { toast } from 'react-toastify'
import { useLogin } from '@components/store/useLogin'
import { useRouter } from 'next/router'
import axios from '@utils/axios'
import BottomButton from '@components/molecules/bottomButton'
import BottomPopUp from '@components/molecules/bottomButton/bottomPopup'
import coffeeCupLogo from '@assets/img/coffeeCup_logo.png'
import Image from 'next/image'
import LoadingSpinner from '@components/atoms/loadingSpinner'
import PlaceholderImg from '@components/atoms/placeholder/img'
import type { IBill } from '@components/types/businessData'
import { SlCreditCard } from 'react-icons/sl'
import type { NextRequest, NextResponse } from 'next/server'
import useIdDetails from '@components/store/useIdDetails'
import useLoyaltyData from '@components/store/useLoyaltyData'
import usePayment from '@components/store/usePayment'
import celebration from '@assets/svg/celebration-emoji.png'
import { IoMdCard } from 'react-icons/io'
import { useQuery } from '@tanstack/react-query'
import useBusinessDetails from '@components/store/useBusinessDetails'

type PageStates = 'INVOICE' | 'MODE'

export default memo(function Payment({ data }: any) {
	const { data: _data } = useAllBusiness()
	const { businessDetails } = useBusinessDetails()
	const { isLogin } = useLogin()
	const { loyaltySetting } = useLoyaltyData()
	const router = useRouter()
	const { businessId } = router.query as { businessId: string }
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { userDetails, hiCode, setHiCode } = useLogin()
	const { setRazorPayPaymentId, razorPayOrderId, setRazorPayOrderId, setRazorPaySignature } =
		usePayment()
	const [currentPage, setCurrentPage] = useState<PageStates>('INVOICE')
	const [claimedAmount, setClaimedCoinz] = useState<number | null>(null)
	const [userCoinz, setUserCoinz] = useState(0)
	const [isLoading, setIsLoading] = useState(false)
	const [finalBill, setFinalBill] = useState<IBill[] | []>([])
	const { zoneId, tableId, tableName } = useIdDetails()

	useEffect(() => {
		initializeAllBusiness(data)
		if (finalBill && finalBill[finalBill.length - 1]?.claimedAmount >= 0) {
			setClaimedCoinz(finalBill[finalBill.length - 1]?.claimedAmount)
		}
	}, [data])

	// Inside your component
	const getBill = async () => {
		let finalBill: IBill[] = []
		let url: string
		url = `v1/kitchens/:id/temp-bill?tableId=${tableId}&hasServiceCharge=${businessDetails?.serviceCharge}&serviceChargePercentage=${businessDetails?.serviceChargePercentage}&gstPercentage=${businessDetails?.gstPercentage}&userSide=true`
		const res = await axios.get(url)
		finalBill = res.data
		if (finalBill.length === 0) {
			toast('Your Payment is settled by waiter')
			return router.push(`/r/${businessId}/category`)
		}
		setFinalBill(finalBill)
		return finalBill
	}

	const {
		isLoading: isLoadingBill,
		error,
		data: finalBillz,
		refetch,
	} = useQuery({
		queryKey: ['getBill', tableId, zoneId],
		queryFn: getBill,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		enabled: !!zoneId && !!tableId,
	})

	const applyClaimedCoinz = async () => {
		try {
			const config = {
				method: 'put',
				url: '/v1/kitchens/:id/applyCoins',
				data: {
					claimedAmount: claimedAmount,
					tableId: tableId,
				},
			}
			const response = await axios(config)
			console.log(response)
			if (response.status === 200) {
				toast.success('Coins applied successfully')
				refetch()
			}
		} catch (err) {
			console.log(err)
		}
	}

	const handleCoins = async () => {
		await applyClaimedCoinz()
		// if has claim coinz then celebrate
		setIsModalOpen(false)
		if (claimedAmount !== null && claimedAmount > 0) {
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 },
			})
		}
	}

	const handleUserCoinz = async () => {
		try {
			const config = {
				method: 'GET',
				url: `/v1/users/:businessId/getUserReward?userPhone=${userDetails.phone}&loyaltyId=${loyaltySetting.loyaltyId}`,
			}
			const response = await axios(config)
			setUserCoinz(response.data.rewards)
		} catch (err) {
			console.log(err)
		}
	}

	const openModal = async () => {
		await handleUserCoinz()
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
	}

	const handleApplyCoinz = (event: Event, userCoinz: number) => {
		if (finalBill.length === 0) {
			return
		}
		const canClaimCoinz = Math.round(
			finalBill[finalBill.length - 1]?.subTotal * (loyaltySetting?.setClaimAmount / 100) || 0,
		)
		const coinsToSet = userCoinz && canClaimCoinz < userCoinz ? canClaimCoinz : userCoinz
		const userEnteredValue = Number((event.target as HTMLInputElement).value)

		if (userEnteredValue > coinsToSet) {
			setClaimedCoinz(coinsToSet)
		} else {
			setClaimedCoinz(userEnteredValue)
		}
	}

	const handleCurrentPage = () => {
		if (currentPage === 'INVOICE') {
			setCurrentPage('MODE')
		} else {
			setCurrentPage('INVOICE')
		}
	}

	const creatingRazorPayOptions = async (total: number, orderId: string) => {
		if (!orderId) {
			return
		}
		const script = document.createElement('script')
		script.src = 'https://checkout.razorpay.com/v1/checkout.js'
		script.async = true
		document.body.appendChild(script)
		const date = new Date()
		const day = String(date.getDate()).padStart(2, '0')
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const year = date.getFullYear()
		const dayAndDate = `${day}-${month}-${year}`
		const time = new Date().toLocaleTimeString('it-IT')
		script.onload = () => {
			const options = {
				key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
				amount: total,
				currency: 'INR',
				name: 'PALTRIBE',
				description: 'Test Transaction',
				image: 'https://example.com/your_logo',
				order_id: orderId,
				handler: (response) => {
					sendPaymentResponse(response)
					setRazorPaySignature(response.razorpay_signature)
					setRazorPayOrderId(response.razorpay_order_id)
					setRazorPayPaymentId(response.razorpay_payment_id)
				},
				prefill: {
					name: userDetails.name,
					email: userDetails.email,
					contact: userDetails.phone,
				},
				modal: {
					subscription_card_change: true,
					remember_customer: true,
					ondismiss: () => {
						setRazorPaySignature('')
						setRazorPayOrderId('')
						setRazorPayPaymentId('')
						toast.error('Payment failed')
						setCurrentPage('INVOICE')
					},
				},
				notes: {
					address: 'Paltribe solutions',
					businessId: businessId,
					tableId: tableId,
					zoneId: zoneId,
					tableName: tableName,
					total: total,
					subTotal: finalBill[finalBill.length - 1]?.subTotal,
					cgst: finalBill[finalBill.length - 1]?.CGST,
					discount: finalBill[finalBill.length - 1]?.discount,
					claimedAmount: finalBill[finalBill.length - 1]?.claimedAmount,
					tips: finalBill[finalBill.length - 1]?.tips,
					serviceCharge: finalBill[finalBill.length - 1]?.serviceCharge,
					dayAndDate: dayAndDate,
					indianTime: time.slice(0, 5),
					hiCode: hiCode || '',
				},
				theme: {
					color: '#3399cc',
				},
			}
			const rzp1 = new (window as any).Razorpay(options)
			rzp1.open()
			rzp1.on(
				'payment.failed',
				(response) => {
					setRazorPayOrderId(response.error.metadata.order_id)
				},
				(error) => {
					console.error(error)
				},
			)
		}
	}

	// verification signature and user reward api
	const sendPaymentResponse = async (response: any) => {
		setIsLoading(true)
		try {
			const res = await axios.post('/v1/kitchens/validPayment', {
				response,
			})
			if (res.data.status) {
				await handleUserReward()
				setRazorPaySignature('')
				setRazorPayOrderId('')
				setRazorPayPaymentId('')
				toast.success('Payment successful')
				setHiCode('')
				localStorage.removeItem('idDetails')
				router.push(
					`/r/${businessId}/review?total=${
						finalBill[finalBill.length - 1]?.Total
					}&claim=${claimedAmount || 0}`,
				)
			} else {
				toast.error('Payment failed')
			}
		} catch (error) {
			console.log(error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleUserReward = async () => {
		try {
			const isClaimed = finalBill[finalBill.length - 1]?.claimedAmount > 0 ? 'true' : 'false'
			const rewardAmount =
				(finalBill[finalBill.length - 1]?.subTotal -
					(finalBill[finalBill.length - 1]?.discount || 0) -
					(finalBill[finalBill.length - 1]?.claimedAmount || 0)) *
				(loyaltySetting.setReward / 100)
			const response = await axios.post(
				`v1/users/Reward?claim=${isClaimed}&settle=true&userSide=true`,
				{
					loyaltyId: loyaltySetting.loyaltyId,
					userPhone: userDetails?.phone,
					userName: userDetails?.name,
					claimedAmount: finalBill[finalBill.length - 1]?.claimedAmount,
					rewards: rewardAmount,
					items: getItemsData(finalBill),
					total: finalBill[finalBill.length - 1]?.Total,
					subTotal: finalBill[finalBill.length - 1]?.subTotal,
					cgst: finalBill[finalBill.length - 1]?.CGST,
					sgst: finalBill[finalBill.length - 1]?.SGST,
					tableName: finalBill[0]?.tableName,
				},
			)
			if (response.status === 200) {
				toast.success('Reward claimed successfully')
			}
		} catch (err) {
			console.log(err)
		}
	}

	const handleCreateOrder = async (total: number) => {
		setIsLoading(true)
		if (razorPayOrderId?.length) {
			await creatingRazorPayOptions(total, razorPayOrderId)
		} else {
			try {
				const config = {
					method: 'POST',
					url: '/v1/kitchens/createOrder',
					data: {
						businessId: businessId,
						tableName: tableName,
						zoneId: zoneId,
						tableId: tableId,
						total: total,
						currency: 'INR',
						name: userDetails.name,
						phone: userDetails.phone,
					},
				}
				const { data } = await axios(config)
				setRazorPayOrderId(data)
				await creatingRazorPayOptions(total, data)
			} catch (err) {
				console.log('err', err)
				alert('Something is wrong!! please try after sometime')
				setRazorPayPaymentId('')
				setRazorPaySignature('')
			}
		}
		setIsLoading(false)
	}

	// bills page
	if (isLoadingBill) return 'Loading...'
	if (error) return `An error has occurred: ${error.message}`
	const renderInvoice = () => {
		return (
			<div className='flex flex-col pb-20 space-y-2 text-4xl transition-all shadow-none rounded-t-3xl'>
				<div className='relative mx-4 text-[1.25rem] text-base-content'>
					<br />
					<div className='text-base font-semibold flex justify-between mx-4 mb-4 capitalize font-[500] text-base-content leading-[1.25rem]'>
						<h1>Bill summary</h1>
						<h1>₹ {finalBill[finalBill.length - 1]?.Total}</h1>
					</div>
					<hr className='bg-primary mx-[1rem] h-0.5' />
					<div className='flex justify-between mx-4 mt-4 capitalize font-[500] font-semibold text-base-content text-[1rem] leading-[1.25rem]'>
						<h1>Sub-Total</h1>
						<h1>₹ {finalBill[finalBill.length - 1]?.subTotal}</h1>
					</div>
					{finalBill[finalBill.length - 1] && (
						<div className='py-4 space-y-4 rounded-2xl'>
							{finalBill[finalBill.length - 1]?.discount > 0 && (
								<div className='flex justify-between font-[500] mx-4 mt-1 text-sm capitalize text-base-content'>
									<h1 className='text-[1rem]'>Discount</h1>
									<div>
										₹{' '}
										{finalBill[finalBill.length - 1]?.discount
											? finalBill[finalBill.length - 1]?.discount
											: '0'}
									</div>
								</div>
							)}
							{finalBill[finalBill.length - 1]?.claimedAmount > 0 && (
								<div className='flex justify-between mx-4 mt-1 text-sm capitalize text-base-content'>
									<h1 className='text-[1rem]'>Hi-Coinz</h1>
									<div className='flex'>
										<span className='text-base'>
											₹ {finalBill[finalBill.length - 1]?.claimedAmount || 0}
										</span>
									</div>
								</div>
							)}

							{Number(finalBill[finalBill.length - 1]?.serviceCharge) > 0 && (
								<div className='flex justify-between mx-4 mt-1 text-sm capitalize text-base-content'>
									<h1 className='text-[1rem]'>Service Charges</h1>
									<span className='text-base'>
										₹ {finalBill[finalBill.length - 1]?.serviceCharge}
									</span>
								</div>
							)}
							{finalBill[finalBill.length - 1]?.CGST > 0 && (
								<div className='flex justify-between mx-4 mt-1 text-sm capitalize text-base-content'>
									<div>
										<h1 className='text-[1rem]'>Taxes 5% CGST + SGST</h1>
									</div>
									<span className='text-base'>
										₹{' '}
										{finalBill[finalBill.length - 1]?.SGST + finalBill[finalBill.length - 1]?.CGST}
									</span>
								</div>
							)}
							{Number(finalBill[finalBill.length - 1]?.tips) > 0 && (
								<div className='flex justify-between mx-4 mt-1 text-sm capitalize text-base-content'>
									<h1 className='text-[1rem]'>Tips</h1>
									<span className='text-base'>₹ {finalBill[finalBill.length - 1]?.tips}</span>
								</div>
							)}
						</div>
					)}
				</div>
				<div className='grid grid-cols-1 p-1 mx-[1rem] my-4 rounded-2xl overflow-auto max-h-[20rem] min-h-[5rem]'>
					<h1 className='ml-4 text-base font-semibold'>Dishes ordered</h1>
					<hr className='bg-primary h-0.5 mx-4 my-4' />
					{finalBill.slice(0, finalBill.length - 1).map((bill, index) => (
						<div
							key={bill?._id}
							className={`flex justify-between mx-4 capitalize font-[500] text-base-content text-base ${
								index !== finalBill.length - 3 ? 'pb-4' : ''
							}`}
						>
							<div className='w-[60%] font-[500]'>
								{bill?.dish?.name}
								<div className='capitalize font-normal text-base-content/40 text-[0.875rem] mt-1 leading-[1rem]'>
									{bill?.dish?.portions?.name}
								</div>
								<div className='capitalize font-normal text-base-content/40 text-[0.875rem] mt-1 leading-[1rem]'>
									{bill?.dish?.extras?.map((extra, index) => (
										<span key={index.toString()}>{extra?.name}, </span>
									))}
								</div>
							</div>
							<div className=''>₹ {bill?.dish?.price}</div>
						</div>
					))}
				</div>
				<BottomButton>
					<div
						onKeyUp={handleCurrentPage}
						onClick={handleCurrentPage}
						className='flex flex-row capitalize space-x-36'
					>
						<div className='flex-col'>
							<div>₹ {finalBill[finalBill.length - 1]?.Total}</div>
						</div>
						<div className='flex flex-row'>
							<span className='my-auto'>Proceed To Pay</span>
						</div>
					</div>
				</BottomButton>
			</div>
		)
	}

	// pay with online or offline
	type Mode = '' | 'ONLINE' | 'OFFLINE'

	const handleMode = async (mode: Mode) => {
		setIsLoading(true)
		if (mode === 'ONLINE') {
			if (!businessDetails?.isPaymentIntegrated) {
				return
			}
			const total = finalBill[finalBill.length - 1].Total
			await handleCreateOrder(total)
		} else if (mode === 'OFFLINE') {
			await handleWaiterCallClick()
			toast.success('Waiter will be there soon')
			router.push(`${routePaths[PAGE_TYPES.FINAL_CART](businessId)}`)
		}
		setIsLoading(false)
	}

	const handleWaiterCallClick = async () => {
		// where is try catch
		if (isLogin && businessId && zoneId && tableId) {
			const config = {
				method: 'POST',
				url: '/v1/kitchens/User/WaiterCalling',
				data: {
					businessId: businessId,
					tableName: tableName,
					zoneId: zoneId,
					tableId: tableId,
				},
			}
			await axios(config)
			setIsModalOpen(false)
		} else {
			toast.error('You can call the waiter again after 5 minutes')
		}
	}

	const renderModes = () => {
		return (
			<section className='mx-[1.5rem] mb-[1.5rem]'>
				<h1 className='text-base font-semibold text-base-content'>Payment Modes</h1>
				<br />
				<article
					onClick={() => handleMode('ONLINE')}
					onKeyDown={() => handleMode('ONLINE')}
					className={`${businessDetails?.isPaymentIntegrated ? '' : 'opacity-50 pointer-events-none'} flex items-center justify-start p-6 space-x-6 border-2 hover:border-primary rounded-2xl`}
				>
					<span className='p-2 rounded-full bg-base-200'>
						<SlCreditCard size={20} />
					</span>
					<h1>
						<span className='text-base font-semibold'>Pay Online</span>
						<br />
						<span>UPI | Debit card | Credit Card</span>
					</h1>
				</article>
				{!businessDetails?.isPaymentIntegrated ? (
					<h6 className='mx-4 mt-2'>Payment Integration Coming soon....</h6>
				) : null}
				<br />
				<article
					onClick={() => handleMode('OFFLINE')}
					onKeyDown={() => handleMode('OFFLINE')}
					className='flex items-center justify-start p-6 space-x-6 border-2 hover:border-primary rounded-2xl'
				>
					<span className='bg-base-200 rounded-full p-1.5'>
						<MdCurrencyRupee size={20} />
					</span>
					<h1>
						<span className='text-base font-semibold'>Pay Offline</span>
						<br />
						<span>Cash</span>
					</h1>
				</article>
			</section>
		)
	}

	// coins popup
	const renderPopUpContent = () => {
		return (
			<BottomPopUp show={isModalOpen} onClose={closeModal}>
				<div className='h-[15rem] p-6'>
					<h1 className='text-xl font-semibold'>
						Available Coins : {claimedAmount ? userCoinz - claimedAmount : userCoinz}
					</h1>
					<h6 className='my-1 text-sm opacity-50'>Enter No. of coins</h6>
					<br />
					<input
						value={claimedAmount ?? finalBill[finalBill.length - 1]?.claimedAmount ?? ''}
						onChange={(e) => handleApplyCoinz(e, userCoinz)}
						type='number'
						placeholder='Enter amount'
						className='border border-[#000] pl-4 min-h-[3rem] mx-auto font-semibold text-[1rem] rounded-[1rem] min-w-389 min-w-[95%] my-auto !py-2 '
					/>
				</div>
				<BottomButton onClick={handleCoins}>Next</BottomButton>
			</BottomPopUp>
		)
	}

	// handle using switch cases
	const renderContent = () => {
		switch (currentPage) {
			case 'INVOICE':
				return renderInvoice()
			case 'MODE':
				return renderModes()
			default:
				return renderInvoice()
		}
	}

	// handle back button
	const handleBack = () => {
		if (currentPage === 'MODE') {
			return setCurrentPage('INVOICE')
		}
		router.push(`${routePaths[PAGE_TYPES.FINAL_CART](businessId)}`)
	}

	const handleBasicTotal = () => {
		return (
			finalBill[finalBill.length - 1]?.Total +
			Number(finalBill[finalBill.length - 1]?.discount || 0) +
			Number(finalBill[finalBill.length - 1]?.claimedAmount || 0)
		)
	}

	// const handleSavedAmount = () => {
	// 	return (
	// 		Number(finalBill[finalBill.length - 1]?.discount || 0) +
	// 		Number(finalBill[finalBill.length - 1]?.claimedAmount || 0)
	// 	)
	// }

	const navigateTermsAgreement = () => {
		router.push('/terms&Conditions')
	}

	return (
		<div className='relative'>
			{isLoading ? (
				<>
					<div className='absolute inset-0 h-screen bg-black bg-opacity-50 backdrop-blur-md' />
					<LoadingSpinner />
				</>
			) : null}
			<section className='sticky top-0 z-20 w-full px-4 pt-4 pb-2 bg-base-100'>
				<article>
					<span className='float-start'>
						<button
							onClick={handleBack}
							onKeyDown={handleBack}
							type='button'
							className='flex flex-row w-10 h-10 mr-auto rounded-full bg-black/40 on_active_bounce'
						>
							<div className='flex flex-row m-auto'>
								<MdOutlineChevronLeft className='text-3xl text-white ' />
							</div>
						</button>
					</span>
				</article>
				<center className='absolute mt-2 ml-8 text-xl font-semibold left-1/3'>You Pay</center>
				<br />
				<br />
				<article className='relative flex flex-col items-center justify-center mx-4 mt-10 space-y-2 text-xl rounded-3xl bg-primary text-base-100'>
					<div
						style={{
							position: 'absolute',
							left: '50%',
							top: '0',
							transform: 'translate(-50%, -50%)',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							aspectRatio: '1',
						}}
					>
						{!isEmpty(data?.businessesData?.logo) ? (
							<Image
								src={`${
									businessId.toLowerCase() === '63c0f3e4ee03bd948ba6522a'.toLowerCase()
										? coffeeCupLogo.src
										: data?.businessesData?.logo
								}`}
								height={100}
								width={100}
								quality={95}
								objectFit='cover'
								alt='logo-business'
								className='object-center w-1/2 border rounded-lg shadow-sm aspect-square'
								placeholder='blur'
								blurDataURL={getRandomBlurImg(100, 100)}
							/>
						) : (
							<PlaceholderImg />
						)}
					</div>
					<br />
					<br />
					<h4 className='text-4xl'>₹ {finalBill[finalBill?.length - 1]?.Total}</h4>
					{finalBill[finalBill?.length - 1]?.discount > 0 ||
						(finalBill[finalBill?.length - 1]?.claimedAmount > 0 && (
							<h4 className='line-through'>₹ {handleBasicTotal()}</h4>
						))}
					<br />
				</article>
				<div className='my-4'>
					{finalBill[finalBill?.length - 1]?.discount > 0 ||
						(finalBill[finalBill?.length - 1]?.claimedAmount > 0 && (
							<h6 className='flex px-4 py-1 m-auto text-sm rounded-lg w-fit bg-base-100 text-base-content'>
								<span className='text-[2rem]'>
									<Image src={celebration} alt='celebration' height={25} width={25} />
								</span>{' '}
								&nbsp;&nbsp;Special discount for Special members !!!
							</h6>
						))}
				</div>
				{currentPage === 'INVOICE' && (
					<article
						onClick={openModal}
						onKeyDown={openModal}
						className='flex justify-between items-center border border-primary h-[90px] mx-4 rounded-3xl p-6'
					>
						<div className='flex items-center'>
							<IoMdCard size={30} className='-rotate-45 ' />
							&nbsp; &nbsp;
							<div>
								<h6>Use Coinz</h6>
								<h6>{finalBill[finalBill.length - 1]?.claimedAmount || 0} coinz applied</h6>
							</div>
						</div>
						<div className='flex items-center space-x-4'>
							<h6>
								{finalBill[finalBill.length - 1]?.claimedAmount > 0 && userCoinz > 0
									? userCoinz - finalBill[finalBill.length - 1]?.claimedAmount
									: ''}
							</h6>
							<MdKeyboardArrowRight size={30} />
						</div>
					</article>
				)}
			</section>
			{renderContent()}
			{renderPopUpContent()}
			<footer
				onKeyDown={navigateTermsAgreement}
				onClick={navigateTermsAgreement}
				className='bg-primary w-full text-base-content h-[3.5rem] flex justify-center items-center fixed bottom-0 left-1/2 transform -translate-x-1/2 '
			>
				<span className='text-base-100'>Terms & agreement</span>
			</footer>
		</div>
	)
})

async function fetchAllBusinessIds() {
	const response = await axios.get(paths.listAllBusiness())
	return response.data.map((business) => business._id)
}
// Only grab the entry for this page
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

		set(
			data,
			'settings.explore.openFrom',
			getTimeIn12HrFormat(data?.['settings']?.explore?.openFrom),
		)
		set(
			data,
			'settings.explore.openTill',
			getTimeIn12HrFormat(data?.['settings']?.explore?.openTill),
		)

		initializeAllBusiness(data)
		console.log(data)
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
