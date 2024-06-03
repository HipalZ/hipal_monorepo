import DishCookingSVG from '@assets/svg/dishCookingSVG'
import DishReadySVG from '@assets/svg/dishReadySVG'
import DishQuantityButton from '@components/organisms/dishDescription/dishQuantityButton'
import { useAllBusiness } from '@components/store/useAllBusiness'
import { ICartDish, ICartExtra, useCart } from '@components/store/useCart'
import { IDish } from '@components/types/businessData'
import { getPrice } from '@components/utils/helpers'
import { getRandomBlurImg } from '@components/utils/images'
import { routePaths } from '@components/utils/routes'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { memo, useEffect, useMemo, useState } from 'react'
import PlaceholderImg from '../placeholder/img'

function CartCard({ cartDish, showStatus }: { cartDish: ICartDish; showStatus?: boolean }) {
	const { data } = useAllBusiness()
	const router = useRouter()
	const cart = useCart((s) => s.cart)
	const { businessId } = router.query as { businessId: string }
	const [showAll, setShowAll] = useState(false)
	// displaying the name and quantity
	const [datas, setDatas] = useState<any>([])
	const dishData = useMemo(() => {
		if (!cartDish) return null

		return { ...(data?.dishesData || []).find((d) => d.id === cartDish.dishId), ...cartDish }
	}, [data, cartDish]) as IDish | any

	const selectedPortion = useMemo(() => {
		return (
			(cartDish?.variants?.length > 0 &&
				cartDish?.variants.map((variant, index) => variant?.portion?.name).join(', ')) ||
			''
		)
	}, [cartDish])

	useEffect(() => {
		const tempDataObj = {}

		cartDish?.variants.forEach((variant) => {
			Object.values(variant?.extra || {}).forEach((extra: any) => {
				if (extra?.name) {
					if (tempDataObj[extra.name]) {
						tempDataObj[extra.name] += extra?.quantity || 0
					} else {
						tempDataObj[extra.name] = extra?.quantity || 0
					}
				}
				if (variant?.portion?.name) {
					if (tempDataObj[variant?.portion?.name]) {
						tempDataObj[variant?.portion?.name] += 1
					} else {
						tempDataObj[variant?.portion?.name] = 1
					}
				}
			})
		})
		const newDataArray = Object.entries(tempDataObj).map(([name, quantity]) => ({ name, quantity }))
		setDatas(newDataArray)
	}, [cartDish])

	function determineTotalPrice(dishData, variants) {
		let total = 0

		if (variants && variants.length > 0) {
			variants.forEach((variant) => {
				// If there's a portion selected, add its price.
				if (variant.portion && variant.portion.price) {
					total += parseFloat(variant.portion.price)
				}
				// If there's no portion, add the dish price.
				else {
					total += dishData.price || 0
				}

				// Add the prices of the extras if any.
				if (variant.extra) {
					Object.values(variant.extra).map((extra: any) => {
						if (extra && extra.price) {
							total += parseFloat(extra.price)
						}
					})
				}
			})
		} else {
			// If there are no variants at all, just take the dish price.
			total = dishData.price || 0
		}

		return total
	}

	useEffect(() => {}, [cart])

	if (!dishData) return null

	return (
		<>
			<div className='flex flex-col'>
				{/* List of horizontal cards */}
				<div className='flex flex-row px-2 py-2 prose '>
					{/* Left Side */}
					<div className='flex-col flex-shrink-0 hidden my-auto '>
						{/* Dish Image */}
						<Link
							href={`${routePaths.dish(businessId, dishData?.id || '')}`}
							passHref
							className='flex pt-2 my-auto border-0'
						>
							{(dishData?.images || '')?.length > 0 ? (
								<Image
									src={dishData?.images?.[0] || ''}
									layout={'intrinsic'}
									alt='cartDish'
									width={80}
									quality={95}
									height={80}
									objectFit='cover'
									className='my-auto overflow-hidden rounded-md '
									placeholder='blur'
									blurDataURL={getRandomBlurImg(80, 50)}
								/>
							) : (
								<PlaceholderImg className='w-20 h-20 overflow-hidden rounded-md ' />
							)}
						</Link>
					</div>

					{/* Right side */}

					<div className='flex flex-row w-full mb-auto space-y-2'>
						<div className='flex flex-col w-3/5 mt-2'>
							{/* Title */}
							<h3 className='flex my-0 text-base not-italic font-medium tracking-wider text-base-content'>
								{dishData?.name || ''}
							</h3>
							<p className='mt-3 text-sm text-base-content/40'>
								{datas.slice(0, showAll ? datas.length : 2).map((variant, index) => {
									return (
										<div key={index}>
											<span className='mr-1'>{variant?.quantity}x</span>
											<span>{variant?.name}</span>
											<br />
										</div>
									)
								})}
								{datas.length > 2 && (
									<button className='text-xs underline' onClick={() => setShowAll((prev) => !prev)}>
										{showAll ? 'Show Less' : 'Show More'}
									</button>
								)}
							</p>

							{/* Small description */}
							{/* <span className='text-base-content/80 line-clamp-2 text-2xs '>Portion - 200 ml</span> */}

							{/* Edit Button */}
							{/* <button className='flex flex-row py-0 my-0 space-x-2 bounce text-primary'>
								<TbPencil className='text-sm' />
								<span className='text-xs'>Edit</span>
							</button> */}
						</div>

						<div className='flex flex-col w-2/5'>
							<div className='flex my-auto ml-auto -mt-1 shrink-0'>
								{!showStatus ? (
									<div className='flex flex-col space-y-2'>
										{/* Quantity */}
										<DishQuantityButton dishData={dishData} isDeleteAble />

										{/* Price */}
										<span className='text-base-content/80 !mb-auto text-xs ml-auto mr-3'>
											{cart?.[dishData?.id]?.variants?.length > 0 && (
												<span> {cart?.[dishData?.id]?.variants?.length}x </span>
											)}
											{determineTotalPrice(dishData, cart?.[dishData?.id]?.variants)}
										</span>
										{/* <span className='text-base-content/80 !mb-auto text-xs ml-auto mr-3'>
											{getPrice(getDishPrice(cartDish) || 0)}
										</span> */}
									</div>
								) : (
									<div className='mx-auto'>
										{/* Status */}
										{dishData?.status && dishData?.status === 'ready' ? (
											<DishReadySVG />
										) : (
											<DishCookingSVG />
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* {cartDish?.variants?.length > 0 &&
					(Object.keys(cartDish?.variants?.[0]?.extra || {})?.length > 0 ||
						cartDish?.variants?.[0]?.portion) && <MoreDetails />} */}
			</div>
		</>
	)
}

export default memo(CartCard)
