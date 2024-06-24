import Popup from '@components/atoms/Popup'
import ErrorPopup from '@components/atoms/errorPopup'
import Loader from '@components/atoms/loader'
import BottomButton from '@components/molecules/bottomButton'
import PromptHiCode from '@components/organisms/hicode'
import { useCart } from '@components/store/useCart'
import useIdDetails from '@components/store/useIdDetails'
import { useLogin } from '@components/store/useLogin'
import { useRoutingFlow } from '@components/store/useRoutingFlow'
import { useStatus } from '@components/store/useStatus'
import type { IDish } from '@components/types/businessData'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import axios from '@utils/axios'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { memo, useMemo, useState } from 'react'
import { GoAlert } from 'react-icons/go'
import { HiOutlineBadgeCheck } from 'react-icons/hi'
import { toast } from 'react-toastify'

export type PageState = 'ORDER_MORE' | 'PLACE_ORDER' | 'PAY'
export type statusCode = 400 | 403 | 200 | 401

function FinalCartBtn() {
	const { setTempCart } = useCart()
	const cart = useCart((state) => state.cart)
	const setCart = useCart((s) => s.setCart)
	const [placingOrder, setPlacingOrder] = useState(false)
	const { getPreviousPath } = useRoutingFlow()
	const { dishStatus } = useStatus()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [activeButton, setActiveButton] = useState<PageState>('ORDER_MORE')
	const [statusCode, setStatusCode] = useState<statusCode>(200)
	const { zoneId, tableId, tableName, setTableId, setTableName } = useIdDetails()
	const { isLogin, userDetails, hiCode, setHiCode, setErrorMsg, setRole } = useLogin()
	const router = useRouter()
	const { businessId } = router.query as { businessId: string }

	const localLogin = async () => {
		toast.error('session expired')
		router.push(`${routePaths[PAGE_TYPES.SIGN_UP](`${businessId}`)}`)
	}

	const handlePlaceOrder = async () => {
		if (!isLogin) {
			navigateToSignUp()
			return
		}

		if (isLogin && businessId && zoneId && tableId && tableName) {
			try {
				setPlacingOrder(true)
				const response = await axios.post('/v1/kitchens/:id/user/kots', {
					businessId,
					zoneId,
					tableId,
					tableName,
					customerName: userDetails.name,
					customerPhone: `91${userDetails.phone}`,
					cart,
					hiCode,
				})
				processOrderResponse(response.data)
			} catch (error) {
				handleError(error)
			} finally {
				setPlacingOrder(false)
			}
		} else if (isLogin && !tableId) {
			setIsModalOpen(true)
		}
	}

	const processOrderResponse = (data) => {
		if (data.hiCode) {
			setHiCode(data.hiCode)
			setRole(data.role)
		}
		toast.success('Order placed successfully')
		setIsModalOpen(true)
		setTempCart(cart)
		setCart({})
		router.push(routePaths[PAGE_TYPES.CATEGORY](businessId))
	}

	const handleError = (error) => {
		const { status, data } = error.response
		console.error(status)
		if (status === 401) {
			localLogin()
		}
		if (status === 400 || status === 403) {
			setStatusCode(status)
			setErrorMsg(data.message)
			if (status === 403) {
				setHiCode('')
				setTableId('')
				setTableName('')
				setIsModalOpen(true)
				setStatusCode(error.response.status)
			}
		}
		setIsModalOpen(true)
	}

	const navigateToCategory = () => {
		router.push(routePaths[PAGE_TYPES.CATEGORY](businessId))
	}

	const handlePayment = () => {
		if (isLogin && dishStatus.length === 0) {
			toast.error('Wait for order')
		} else {
			setIsModalOpen(true)
		}
	}

	const navigateToSignUp = () => {
		router.push(routePaths[PAGE_TYPES.SIGN_UP](businessId))
	}
	const openModal = async (action: PageState) => {
		setActiveButton(action)
		switch (action) {
			case 'PLACE_ORDER':
				await handlePlaceOrder()
				break
			case 'ORDER_MORE':
				navigateToCategory()
				break
			case 'PAY':
				handlePayment()
				break
			default:
				navigateToSignUp()
		}
	}

	const closeModal = () => {
		setIsModalOpen(false)
	}
	const getBill = async () => {
		return router.push(`/r/${businessId}/payment`)
	}

	const undeliveredCount = dishStatus.reduce(
		(count, item) =>
			count + item?.filter((dish: IDish) => dish?.dishStatus?.toLowerCase() !== 'delivered').length,
		0,
	)

	const bottomButton = useMemo(() => {
		const isDishStatusEmpty = dishStatus.length === 0
		const isCartEmpty = Object.values(cart).length === 0
		const isCartNotEmpty = Object.values(cart).length !== 0
		const isUserNotLoggedIn = !isLogin
		if (isDishStatusEmpty && isCartEmpty) {
			return (
				<Link href={`${getPreviousPath()}`}>
					<BottomButton>
						<div className='flex flex-row space-x-2 capitalize'>
							<span className='my-auto'>Order More</span>
						</div>
					</BottomButton>
				</Link>
			)
		}
		if (!isDishStatusEmpty && isCartEmpty) {
			return (
				<BottomButton onClick={() => openModal('PAY')}>
					<div className='capitalize'>
						<span className='my-auto'>Pay</span>
					</div>
				</BottomButton>
			)
		}
		if (
			(isDishStatusEmpty && isCartNotEmpty) ||
			(!isDishStatusEmpty && isCartNotEmpty && isUserNotLoggedIn)
		) {
			return (
				<BottomButton placingOrder={placingOrder} onClick={() => openModal('PLACE_ORDER')}>
					<div className='capitalize'>
						<span className='my-auto'>Place Order</span>
					</div>
				</BottomButton>
			)
		}
		if (!isDishStatusEmpty && !isCartEmpty) {
			return (
				<div className='fixed w-[100%] max-w-[28rem] bottom-0 z-20 py-2 rotate-180 shadow-lg bg-base-100 shadow-base-100'>
					<div className='flex justify-between gap-4 rotate-180'>
						{!isDishStatusEmpty && (
							<button
								type='button'
								className={
									'min-h-[3rem] capitalize w-[100%] max-w-[10rem] btn btn-outline btn-primary ml-4 btn-md font-semibold text-[1rem] rounded-full shadow-lg my-auto !py-2 '
								}
								onClick={() => openModal('PAY')}
							>
								Pay
							</button>
						)}
						<button
							type='button'
							aria-busy={placingOrder}
							disabled={placingOrder}
							className={
								'min-h-[3rem] capitalize w-[100%] max-w-[10rem] mr-4 btn btn-primary btn-md font-semibold text-[1rem] rounded-full shadow-lg  my-auto !py-2'
							}
							onClick={() => openModal('PLACE_ORDER')}
						>
							Place Order
						</button>
					</div>
				</div>
			)
		}
	}, [cart, dishStatus.length, isLogin, getPreviousPath, openModal])

	const renderUi = useMemo(() => {
		if (!isLogin || !isModalOpen) return null // Early exit if not logged in or modal is not to be shown

		const basePopupProps = { show: isModalOpen, onClose: closeModal }
		if (activeButton === 'PLACE_ORDER') {
			if (statusCode === 400) {
				return <PromptHiCode isOpen={isModalOpen} onModalClose={closeModal} />
			}
			if (!zoneId || !tableId) {
				return (
					<ErrorPopup
						{...basePopupProps}
						title='Please scan your table QR code!'
						message='Need any assistance from us?'
						buttonText='Scan'
					/>
				)
			}
			if (!hiCode && statusCode === 403) {
				return (
					<ErrorPopup
						{...basePopupProps}
						title='Your last order is settled!'
						message='Please scan the table again to start new.'
						buttonText='Scan'
					/>
				)
			}
			if (statusCode !== 400 && statusCode !== 403) {
				return (
					<Popup {...basePopupProps}>
						<div className='pt-4 pb-8 mx-12 text-base-content bg-base-100 rounded-xl'>
							<div className='flex justify-center text-3xl text-primary'>
								<HiOutlineBadgeCheck />
							</div>
							<div className='flex justify-center mt-4 font-semibold'>Order placed successful!</div>
							<div className='flex justify-center mx-12 mt-4 text-[0.75rem] font-light'>
								Your order is preparing to embark on a magical journey to your table.
							</div>
							<div className='mx-[1rem] flex justify-center mt-6 font-medium'>
								<button
									type='button'
									onClick={closeModal}
									className='px-8 py-1 text-white rounded-full shadow-lg bg-primary shadow-base-100'
								>
									close
								</button>
							</div>
						</div>
					</Popup>
				)
			}
		}

		if (activeButton === 'PAY') {
			const isUndelivered = undeliveredCount > 0
			const mainMessage = isUndelivered ? 'Hope you liked the food!' : 'All dishes are delivered!'
			const subMessage = isUndelivered ? 'Thank you, visit again' : 'Proceed to payment!'

			return (
				<Popup {...basePopupProps}>
					<div className='pt-4 pb-8 mx-12 text-base-content bg-base-100 rounded-xl'>
						<div className='flex justify-center text-3xl text-primary'>
							<GoAlert />
						</div>
						<div className='flex justify-center mt-4 font-semibold'>{mainMessage}</div>
						<div className='text-center mx-12 mt-4 text-[0.75rem] font-light'>{subMessage}</div>
						<div className='flex justify-between mx-[1rem] mt-8 font-medium'>
							<button
								type='button'
								onClick={closeModal}
								className='px-8 py-1 shadow-lg bg-base-100 shadow-base-100'
							>
								close
							</button>
							<button
								type='button'
								onClick={getBill}
								className={
									'px-8 py-1 mr-6 text-white rounded-full shadow-lg bg-primary shadow-base-100 '
								}
							>
								Pay
							</button>
						</div>
					</div>
				</Popup>
			)
		}
		return null
	}, [
		isLogin,
		isModalOpen,
		activeButton,
		statusCode,
		zoneId,
		tableId,
		hiCode,
		undeliveredCount,
		closeModal,
		getBill,
	])

	return (
		<>
			{bottomButton}
			{placingOrder ? <Loader /> : renderUi}
		</>
	)
}

export default memo(FinalCartBtn)
