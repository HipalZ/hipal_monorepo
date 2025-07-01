// types.ts

export interface Extra {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Portion {
  id: string;
  name: string;
  price: number;
}

export interface Dish {
  _id: string;
  businessId: string;
  posDishId: string;
  __v: number;
  availability: boolean;
  categoryIds: string[];
  createdAt: string;
  description: string;
  dishTypes: string[];
  ignoreDiscount: string;
  ignoreTax: string;
  images: unknown[];
  isDeleted: boolean;
  menuId: string;
  name: string;
  portions: unknown[];
  pos: boolean;
  posTax: string;
  price: number;
  rank: number;
  tags: unknown[];
  updatedAt: string;
  visibility: boolean;
  active: boolean;
  kitchenId: string;
  tax: number;
  gst: number;
}

export interface Item {
  id: string;
  dish: Dish;
  portion: Portion | null;
  extras: Extra[];
  quantity: number;
  isDeleted: boolean;
  _id: string;
}

export interface BillGroup {
  gst: number;
  subTotal: number;
  totalGst: number;
  items: Item[];
}
