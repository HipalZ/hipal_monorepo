import QuantityPicker from '@components/atoms/buttons/quantityPicker'
import BottomPanel from '@components/molecules/bottomPanel'
import { useBottomPanel } from '@components/store/useBottomPanel'
import { ICart, useCart } from '@components/store/useCart'
import { IDish, IPortion } from '@components/types/businessData'
import { memo, useCallback } from 'react'

function DishQuantityButton({
	dishData,
	isDeleteAble,
}: {
	dishData: IDish
	isDeleteAble?: boolean
}) {
	const { openBottomPanel, closeBottomPanel } = useBottomPanel()

	const cart = useCart((s) => s.cart)
	const setCart = useCart((s) => s.setCart)

	const handleQuantity = useCallback(
		(quantity) =>
			handleDishQuantity(cart, dishData, openBottomPanel, setCart, closeBottomPanel)(quantity),
		[cart, closeBottomPanel, dishData, openBottomPanel, setCart],
	)

	const handleDeleteItem = () => {
		if (cart?.[dishData?.dishId]) {
			const newCart = {}
			Object.values(cart).forEach((dish) => {
				if (dish.dishId !== dishData?.dishId) {
					newCart[dish.dishId] = dish
				}
			})
			setCart(newCart)
		}
		closeBottomPanel(dishData?.dishId)
	}
	if (dishData.businessId === '6548e7493f83cee25155ffc9') return null
	return (
		<>
			{(cart?.[dishData?.id]?.variants?.length || 0) <= 0 && !isDeleteAble ? (
				<button
					className='bg-base-100 btn-sm text-primary active:bg-base-100 border border-primary min-w-[6.044rem] min-h-[2.241rem] !px-6 rounded-full font-medium text-[0.969rem] normal-case'
					onClick={() => handleQuantity((cart?.[dishData?.id]?.variants?.length || 0) + 1)}
				>
					Add
				</button>
			) : (
				<QuantityPicker
					quantity={cart?.[dishData?.id]?.variants?.length || 0}
					setQuantity={handleQuantity}
					minQuantity={0}
					isDeleteAble={isDeleteAble}
					onDeleteItem={() => handleDeleteItem()}
				/>
			)}

			<BottomPanel dishData={dishData} />
		</>
	)
}

export default memo(DishQuantityButton)

export function handleDishQuantity(
	cart: object,
	dishData: IDish,
	openBottomPanel: (panelName: string) => void,
	setCart: (data: ICart) => void,
	closeBottomPanel: (panelName: string) => void,
): (newQuantity: number) => void {
	return (newQuantity: number) => {
		if ((cart?.[dishData?.id]?.variants?.length || 0) < newQuantity) {
			const thisDish = dishData as IDish
			if (thisDish?.portions?.length > 0 || thisDish?.extras?.[0]?.numSelections > 0) {
				openBottomPanel(dishData?.id)
			}
			const portion = (dishData?.portions || []).find((p: IPortion) => {
				// Check if 'default' is true when it's a boolean, or convert it to a boolean if it's a string
				const isDefault = typeof p.default === 'boolean' ? p.default : p.default === 'true'
				return isDefault
			})

			const extra: { [extraId: string]: any } = {}
			;(dishData?.extras?.[0]?.items || []).forEach((e: any) => {
				extra[e?.id] = {
					...e,
					quantity: 0,
				}
			})

			if (cart?.[dishData?.id] === undefined) {
				setCart({
					...cart,
					[dishData?.id]: {
						dishData: dishData,
						dishId: dishData?.id,
						variants: [
							{
								extra: {},
								portion: portion,
							},
						],
					},
				})
			} else {
				const newCart = { ...cart }
				newCart[dishData?.id].variants.push({
					extra: {},
					portion: portion,
				})

				setCart(newCart)
			}
		} else {
			if (cart?.[dishData?.id]) {
				const newCart = { ...cart }
				if (newCart[dishData?.id].variants.length === 0) {
					delete newCart[dishData?.id]
				} else {
					newCart[dishData?.id].variants.pop()
				}

				if (newCart[dishData?.id].variants.length === 0) {
					delete newCart[dishData?.id]
				}

				setCart(newCart)
			}

			closeBottomPanel(dishData?.id)
		}
	}
}
