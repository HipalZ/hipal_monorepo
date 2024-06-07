import { ICart, ICartDish, ICartExtra, ICartVariant } from '@components/store/useCart'
import { IBusinessData } from '@components/types/businessData'
import isEmpty from 'lodash-es/isEmpty'

export const getPrice = (price: number | string) => {
	if (!price || price === 0) {
		// return 'FREE'
		return ''
	}

	return `₹${price}`
}

export const getTimeIn12HrFormat = (time: string) => {
	if (!time || !time.includes(':')) return ''

	const [hours, minutes] = time.split(':')
	const hour = parseInt(hours, 10)

	const amPm = hour >= 12 ? 'PM' : 'AM'
	const hour12 = hour % 12 || 12

	return `${hour12}:${minutes} ${amPm}`
}

export const getPriceOfExtra = (extra: ICartExtra) => {
	let arrExtra = Object?.values(extra)
	let extraPrice = 0
	for (let i = 0; i < arrExtra.length; i++) {
		let obj = arrExtra[i]
		extraPrice = parseInt(`${obj?.price || 0}`) * parseInt(`${obj?.quantity}`)
	}

	return extraPrice
}

export function getDishPriceByVarient(variant: ICartVariant, cartDish: ICartDish) {
	const dishPrice = cartDish?.dishData?.price
	const { extra } = variant
	let price = 0
	price += parseInt(`${variant?.portion?.price || dishPrice}`)

	if (!isEmpty(extra)) price += getPriceOfExtra(extra)

	return price
}

export const getDishPrice = (cartDish: ICartDish) => {
	let dishPrice = 0
	cartDish.variants.map((variant) => (dishPrice += getDishPriceByVarient(variant, cartDish)))
	return dishPrice
}

export const getGrandTotalPrice = (cart: ICart) => {
	let grandTotal = 0
	const cartItems = Object.values(cart)
	for (const cartDish of cartItems) {
		grandTotal += getDishPrice(cartDish)
	}
	return grandTotal
}

export function getGrandTotal(cart: any, data: IBusinessData) {
	let total = 0

	if (isEmpty(cart)) return total

	Object.keys(cart).forEach((dishId) => {
		let dishPriceByVariants = 0
		const cartDish = cart[dishId]

		if (
			cartDish?.variants?.length > 0 &&
			Object.keys(cartDish?.variants?.[0]?.extra || {})?.length > 0 &&
			cartDish?.variants?.[0]?.portion
		) {
			cart?.[dishId]?.variants?.forEach((variant) => {
				const { portion, extra } = variant
				if (isEmpty(portion) && isEmpty(extra)) {
					dishPriceByVariants += 1
				} else {
					dishPriceByVariants += portion?.price || 0

					Object.keys(extra).forEach((key) => {
						const { price, quantity } = extra[key]
						dishPriceByVariants += price * quantity
					})
				}
			})
		} else {
			dishPriceByVariants = cartDish?.variants?.length || 1
		}

		total += dishPriceByVariants * (data?.dishesData?.find((d) => d._id === dishId)?.price || 1)
	})
	return total
}
type DishDetails = {
	name?: string
	qty?: number | undefined
	quantity?: number | undefined
	price?: number
	portions?: {
		price?: string
	}
	extras?: {
		name?: string
		price?: string
		qty?: number
	}[]
}

export const getItemsData = (billData) => {
	const items: DishDetails[] = []
	if (billData) {
		const newBill = billData.slice(0, billData.length - 2)
		for (let i = 0; i < newBill.length; i++) {
			const newobj: DishDetails = {}

			const dish = newBill[i].dish
			if (dish) {
				newobj.name = dish.name
				newobj.qty = dish.qty
				newobj.price = dish.price
				newobj.portions = dish.portions
				newobj.extras = dish.extras
				items.push(newobj)
			}
		}

		for (const item of items) {
			let price = 0

			if (item?.portions?.price) {
				price = Number(item.portions.price) * (item?.qty || 0)
			} else {
				price = item?.price || 0
			}

			let extrasPrice = 0
			if (item?.extras?.length) {
				for (const extra of item.extras!) {
					extrasPrice += (Number(extra.price || '0') || 0) * (extra.qty || 0)
				}
			}

			item.price = price + extrasPrice
		}
	}
	return items
}

export const cartToKots = (
	cart,
	businessId,
	tableId,
	zoneId,
	tableName,
	customerName,
	customerPhone,
) => {
	const kotArray = []
	for (const dish of Object.values(cart)) {
		for (const variant of dish?.variants) {
			const extras = variant?.extra ? Object.values(variant.extra) : []
			const portions = variant?.portion ? variant?.portion : {}

			const kotObject = {
				businessId: businessId,
				kitchenId: dish?.dishData?.kitchenId,
				zoneId: zoneId,
				tableId: tableId,
				staffId: '5',
				dish: {
					dishId: dish?.dishId,
					name: dish?.dishData?.name,
					price: dish?.dishData?.price,
					qty: 1,
					comments: 'spicy',
					extras,
					portions,
				},
				dishType: dish?.dishData?.dishType,
				category: dish?.parentCategoryName || dish?.dishData?.categories?.[0]?.name,
				customerName: customerName,
				customerPhone: customerPhone,
				instructions: variant?.instruction,
				dishStatus: 'cooking',
				tableName: tableName,
				avgTime: dish?.dishData?.avgTime,
				taxes: dish?.dishData?.taxes,
			}

			kotArray.push(kotObject)
		}
	}

	return kotArray
}
