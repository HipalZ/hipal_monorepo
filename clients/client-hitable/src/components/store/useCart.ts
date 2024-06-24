import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IDish, IExtraItem, IPortion } from '../types/hiTableData';

export interface ICartExtra {
  [key: string]: IExtraItem & {
    quantity: number;
  };
}

export interface ICartVariant {
  id: string;
  extra?: ICartExtra | {};
  portion?: IPortion;
  quantity?: number;
}

export interface ICartDish {
  dishData?: IDish;
  dishId?: string;
  parentCategoryName: string;
  variants: any;
}

export interface ICart {
  [tableId: string]: {
    [key: string]: ICartDish;
  };
}

export interface IUseCart {
  cartBusinessId: string;
  cart: ICart;

  setCartBusinessId: (id: string) => void;
  emptyCart: () => void;
  setCart: (tableId: string, dishKey: string, data: ICartDish) => void;
  deleteItem: (tableId: string, dishKey: string) => void;
  clearCartForTable: (tableId: string) => void;
  cartItem: object;
  setCartItem: (data: object) => void;
  emptyCartItem: () => void;
}

export const useCart = create(
  persist<IUseCart>(
    (set) => ({
      cartBusinessId: '',
      cart: {},
      setCartBusinessId: (id: string) => set({ cartBusinessId: id }),
      emptyCart: () => set({ cart: {} }),
      setCart: (tableId: string, dishKey: string, data: ICartDish) =>
        set((state) => ({
          ...state,
          cart: {
            ...state.cart,
            [tableId]: {
              ...state.cart[tableId],
              [dishKey]: data,
            },
          },
        })),
      deleteItem: (tableId: string, dishKey: string) =>
        set((state) => {
          const newTableCart = { ...state.cart[tableId] };
          delete newTableCart[dishKey];

          return {
            ...state,
            cart: {
              ...state.cart,
              [tableId]: newTableCart,
            },
          };
        }),
      clearCartForTable: (tableId: string) =>
        set((state) => ({
          ...state,
          cart: {
            ...state.cart,
            [tableId]: {},
          },
        })),
      cartItem: {},
      setCartItem: (data: object) => set({ cartItem: data }),
      emptyCartItem: () => set({ cartItem: {} }),
    }),
    {
      name: 'hitable-cart',
    },
  ),
);
