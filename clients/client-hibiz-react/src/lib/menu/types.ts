export type DishType = 'veg' | 'nonveg' | 'egg' | 'vegan';

export interface Dish {
  id: string;
  dishName: string;
  price: number;
  dishType: DishType;
  description?: string;
  portions?: {
    name: string;
    price: number;
    default: boolean;
  }[];
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

export type CanonicalDishType = 'VEG' | 'NON_VEG' | 'EGG' | 'VEGAN' | 'ALCOHOL' | 'NON_ALCOHOL' | 'GLUTEN_FREE' | 'MIX';

export interface PortionType {
  name: string;
  price: number;
  default: boolean;
  portionTypes: CanonicalDishType[];
}

export interface CategoryDraft {
  tempId: string;
  name: string;
}

export interface DishDraft {
  tempId: string;
  name: string;
  dishTypes: CanonicalDishType[];
  price: number | null;
  description: string;
  portions: PortionType[];
  categoryRefs: string[];
  visibility: boolean;
  availability: boolean;
}

export interface ExtractResponse {
  status: 'ok' | 'empty' | 'error';
  ui: any;
  review: {
    notes: string[];
    stats: {
      categories: number;
      dishes: number;
      dishesWithPortions: number;
      missingPrices: number;
    };
  };
  categoriesDraft: CategoryDraft[];
  dishesDraft: DishDraft[];
}

export interface FinalizeResponse {
  status: 'ok' | 'error';
  payloads: {
    categories: { name: string; hierarchy: 'CHILD' }[];
    dishes: {
      name: string;
      price: number | null;
      visibility: boolean;
      availability: boolean;
      dishTypes: CanonicalDishType[];
      description: string;
      categoryIds: string[];
      portions: PortionType[];
    }[];
  };
  review: { notes: string[]; stats: { categories: number; dishes: number } };
}

export type CategoryType = { _id: string; name: string };
