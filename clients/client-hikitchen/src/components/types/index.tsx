export interface Extra {
  name: string;
  price: string;
  quantity: number;
}

export interface Portion {
  name: string;
  price: string;
  discount?: string;
  default: boolean;
}

export interface DishDetail {
  dishId: string;
  name: string;
  price: number;
  qty: number;
  comments: string;
  extras: Extra[];
  portions?: Portion;
}

export interface Kot {
  businessId: string;
  kitchenId: string;
  zoneId: string;
  tableId: string;
  staffId: string;
  inventory: boolean;
  isDeleted: boolean;
  startedAt: number;
  priority: boolean;
  cookedAt: number;
  status: string;
  dish: DishDetail;
  customerName: string;
  customerPhone: string;
  dishStatus: string;
  kotTime: string;
  tableName: string;
  dishType: string;
  category: string;
  date: string;
  id: string;
}

export interface Dish {
  category: string;
  kots: Kot[];
  items:Kot[]
}

export interface Data {
  businessId: string;
  kitchenId: string;
  time: string;
  customerName: string;
  customerPhone: string;
  tableName: string;
  kots: Dish[];
  items:Kot[]
  totalKots: number;
  cooked: number;
  uuid: string;
  deletedDishes: number;
  cookingDishes:number;
}

export interface IKitchen {
  businessId: string;
  kitchenName: string;
  description: string;
  staff: string[];
  totalKots: number;
  completedKot: number;
  totalDish: number;
  cookedDish: number;
  id: string;
}

export interface UpdateData {
  allKots: number;
  cookingDishes: number;
}
