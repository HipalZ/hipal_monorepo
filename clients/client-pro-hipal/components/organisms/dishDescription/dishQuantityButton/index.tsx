import QuantityPicker from '@components/atoms/buttons/quantityPicker'
import BottomPanel from '@components/molecules/bottomPanel'
import { useActiveClass } from '@components/store/useActiveClass'
import { useBottomPanel } from '@components/store/useBottomPanel'
import { useCart } from '@components/store/useCart'
import type { IDish } from '@components/types/businessData'
import { memo, useCallback } from 'react'

function DishQuantityButton({ dishData, isDeleteAble }: { dishData: any; isDeleteAble?: boolean }) {
	const { openBottomPanel, closeBottomPanel } = useBottomPanel()
	const cart: any = useCart((s) => s.cart)
	const setCart: any = useCart((s) => s.setCart)
	const isActiveParentCategory = useActiveClass((s) => s.isActiveParentCategory)
	const isActiveParentCategoryName = useActiveClass((s) => s.isActiveParentCategoryName)

	const handleQuantity = useCallback(
		(quantity) => {
			handleDishQuantity(
				cart,
				isActiveParentCategory,
				isActiveParentCategoryName,
				dishData,
				openBottomPanel,
				setCart,
				closeBottomPanel,
			)(quantity)
		},
		[
			cart,
			dishData,
			openBottomPanel,
			setCart,
			closeBottomPanel,
			isActiveParentCategory,
			isActiveParentCategoryName,
		], // Included closeBottomPanel in the dependencies
	)

	const handleDeleteItem = () => {
		// If dish is in the cart, update the variant

		if (cart?.[dishData?.dishId]) {
			const newCart = {}

			// remove dish object
			Object.values(cart).forEach((dish: any) => {
				if (dish?.dishId !== dishData?.dishId) {
					newCart[dish?.dishId as string] = dish
				}
			})

			setCart(newCart)
		}

		closeBottomPanel(dishData?.dishId)
	}

	return (
		<>
			{(cart?.[dishData?._id]?.variants?.length || 0) <= 0 && !isDeleteAble ? (
				<button
					type='button'
					className='bg-base-100 btn-sm text-primary active:bg-base-100 border border-primary min-w-[6.044rem] min-h-[2.241rem] !px-6 rounded-full font-medium text-[0.969rem] normal-case'
					onClick={() => {
						handleQuantity((cart?.[dishData?._id]?.variants?.length || 0) + 1)
					}}
				>
					Add
				</button>
			) : (
				<QuantityPicker
					quantity={cart?.[dishData?._id]?.variants?.length || 0}
					setQuantity={handleQuantity}
					minQuantity={0}
					isDeleteAble={isDeleteAble as boolean}
					onDeleteItem={() => handleDeleteItem()}
				/>
			)}
			<BottomPanel
				dishData={dishData}
				isActiveParentCategory={isActiveParentCategory}
				isActiveParentCategoryName={isActiveParentCategoryName}
			/>
		</>
	)
}

export default memo(DishQuantityButton)

export function handleDishQuantity(
	cart: { [dishId: string]: any },
	isActiveParentCategory: string,
	isActiveParentCategoryName: string,
	dishData: IDish,
	openBottomPanel: (panelName: string) => void,
	setCart: (data: { [dishId: string]: any }) => void,
	closeBottomPanel: (panelName: string) => void,
): (newQuantity: number) => void {
	return (newQuantity: number) => {
		const addedDishId = crypto.randomUUID()
		// Adding the dish to the cart
		if ((cart?.[dishData?._id]?.variants?.length || 0) < newQuantity) {
			const thisDish = dishData as IDish
			if (thisDish?.portions?.length > 0 || (thisDish?.extras?.[0]?.numSelections || 0) > 0) {
				openBottomPanel(dishData?._id)
			}

			const portion = (dishData?.portions || []).find((p) => p?.default === true)
			const extra: { [extraId: string]: any } = {}
			;(dishData?.extras?.[0]?.items || []).forEach((e: any) => {
				extra[e?._id] = {
					...e,
					quantity: 0,
				}
			})
			if (cart?.[dishData?._id] === undefined) {
				setCart({
					...cart,
					[dishData?._id]: {
						dishData: dishData,
						dishId: dishData?._id,
						parentCategoryId: isActiveParentCategory,
						parentCategoryName: isActiveParentCategoryName,
						variants: [
							{
								_id: addedDishId,
								extra: {},
								portion: portion,
							},
						],
					},
				})
			} else {
				const newCart = { ...cart }
				newCart[dishData?._id].variants.push({
					_id: addedDishId,
					extra: {},
					portion: portion,
				})

				setCart(newCart)
			}
		} else {
			if (cart?.[dishData?._id]) {
				const newCart = { ...cart }
				if (newCart[dishData?._id].variants.length === 0) {
					delete newCart[dishData?._id]
				} else {
					newCart[dishData?._id].variants.pop()
				}

				if (newCart[dishData?._id].variants.length === 0) {
					delete newCart[dishData?._id]
				}

				setCart(newCart)
			}

			closeBottomPanel(dishData?._id)
		}
	}
}
