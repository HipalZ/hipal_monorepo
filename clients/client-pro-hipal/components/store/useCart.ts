import type { IDish, IExtraItem, IPortion } from '@components/types/businessData'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ICartExtra {
	[key: string]: IExtraItem & {
		quantity: number
	}
}
export interface ICartVariant {
	extra?: ICartExtra
	portion?: IPortion
}

export interface ICartDish {
	dishData: IDish
	dishId: string
	variants: ICartVariant[]
}

export interface ICart {
	[key: string]: ICartDish
}

interface IUseCart {
	cartBusinessId: string
	cart: ICart
	tempCart: ICart

	setCartBusinessId: (id: string) => void
	emptyCart: () => void
	setCart: (data: ICart) => void
	setTempCart: (data: ICart) => void

	cartItem: object
	setCartItem: (data: object) => void
	emptyCartItem: () => void
}

export const useCart = create(
	persist<IUseCart>(
		(set) => ({
			cartBusinessId: '',
			cart: {},
			tempCart: {},

			setCartBusinessId: (id: string) => set(() => ({ cartBusinessId: id })),
			emptyCart: () => set({ cart: {} }),
			setCart: (d: ICart) => set(() => ({ cart: d })),
			setTempCart: (d: ICart) => set(() => ({ tempCart: d })),

			cartItem: {},
			setCartItem: (d: object) => set(() => ({ cartItem: d })),
			emptyCartItem: () => set(() => ({ cartItem: {} })),
		}),
		{
			name: 'pro-cart',
		},
	),
)
