import { IDish, IExtraItem, IPortion } from "@components/types/businessData"
import { create } from "zustand"

export interface ICartExtra {
	[key: string]: IExtraItem & {
		quantity: number
	}
}
export interface ICartVariant {
	extra?: ICartExtra | {}
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
	cart: ICart
	emptyCart: () => void
	setCart: (data: ICart) => void

	cartItem: object
	setCartItem: (data: object) => void
	emptyCartItem: () => void
}

export const useCart = create<IUseCart>((set) => ({
	cart: {},
	emptyCart: () => set({ cart: {} }),
	setCart: (d: ICart) => set(() => ({ cart: d })),

	cartItem: {},
	setCartItem: (d: object) => set(() => ({ cartItem: d })),
	emptyCartItem: () => set(() => ({ cartItem: {} })),
}))
