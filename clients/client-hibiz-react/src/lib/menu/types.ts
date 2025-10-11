export type DishType =
  | "veg"
  | "nonveg"
  | "vegan"
  | "egg"
  | "alcoholic"
  | "nonalcoholic";

export interface Dish {
  id: string;
  dishName: string;
  price: number;
  dishType: DishType;
}

export interface Subcategory {
  id: string;
  name: string;
  dishes: Dish[];
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}
