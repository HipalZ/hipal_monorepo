import CartCard from '@components/atoms/card/cartCard'
import { useAllBusiness } from '@components/store/useAllBusiness'
import { useCart } from '@components/store/useCart'
import { useLogin } from '@components/store/useLogin'
import { getGrandTotal, getPrice } from '@components/utils/helpers'
import { memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'

export default memo(function CartDetails() {
	const { data: _data } = useAllBusiness()
	const cart = useCart((state) => state.cart)
	const deferredCart = useDeferredValue(cart)
	const userDetails = useLogin((state) => state.userDetails)
	const sortedDishes = useCallback(() => {
		const newCart = { ...deferredCart }
		return newCart
	}, [deferredCart])

	const _getGrandTotal = useMemo(() => getGrandTotal(cart, _data), [_data, cart])

	return (
		<>
			<div className='z-10 flex flex-col w-full pb-4 space-y-4 text-4xl shadow-xl bg-base-100 rounded-t-3xl'>
				<div className='border-base-content/20 px-6 border-b !my-0 ' />
				{_getGrandTotal > 0 ? (
					<>
						<div className='space-y-2'>
							<div className='flex justify-between mx-6'>
								<h6 className='not-italic capitalize font-normal text-base leading-[140%] text-primary my-auto'>
									{`${
										userDetails?.name?.split(' ')?.[0] === undefined
											? 'Your'
											: userDetails?.name?.split(' ')?.[0]
									}'s` || 'Your'}{' '}
									Order
								</h6>
							</div>

							<div className='flex flex-col px-2 mx-4 overflow-hidden border divide-y-2 shadow-sm border-base-200 bg-base-200/30 rounded-2xl shadow-base-200 divide-base-300/50'>
								{Object.keys(sortedDishes()).map((dishId, index) => (
									<CartCard key={index} cartDish={cart?.[dishId]} />
								))}
							</div>
						</div>

						{/* Final Bill Total Price */}
						<div className='hidden mx-6 my-2 prose border-t-2'>
							<div className='flex flex-row font-semibold '>
								<h5 className='my-2 '> Grand Total</h5>

								<div className='flex flex-row my-2 ml-auto space-x-2 '>
									<small className='text-2xs mt-0.5 line-through font-medium'>
										{getPrice(_getGrandTotal * 1.2)}
									</small>

									<h5 className='text-sm '>{getPrice(_getGrandTotal)}</h5>
								</div>
							</div>
						</div>
					</>
				) : (
					<>
						<div className='prose'>
							<h3 className='text-center'>Add Dishes to Order</h3>
						</div>
					</>
				)}
			</div>
		</>
	)
})
