import { create } from "zustand";

export interface Variant {
  id: string;
  name: string;
  ExtraType: string;
  description: string;
  price: number;
  maxQuantity: number;
  availability: boolean;
  visibility: boolean;
}

interface FormState {
  addOnName: string;
  addOnType: string;
  noOfOptions: number;
  selections: number;
  maxQuantity: number;
  compulsoryQuantity: number;
  variantName: string;
  variantType: string;
  variantPrice: number;
  variantMaxQuantity: number;
  variantAvailability: boolean;
  variantVisibility: boolean;
  variantDescription: string;
  variants: Variant[];
  currentVariant: Variant | null;
}

type FormActions = {
  setAddOnName: (name: string) => void;
  setAddOnType: (type: string) => void;
  setNoOfOptions: (options: number) => void;
  setSelections: (selections: number) => void;
  setMaxQuantity: (quantity: number) => void;
  setCompulsoryQuantity: (quantity: number) => void;
  setVariantName: (name: string) => void;
  setVariantType: (type: string) => void;
  setVariantPrice: (price: number) => void;
  setVariantMaxQuantity: (quantity: number) => void;
  setVariantAvailability: (availability: boolean) => void;
  setVariantVisibility: (visibility: boolean) => void;
  setVariantDescription: (description: string) => void;
  addVariant: (variant: Variant) => void;
  editVariant: (id: string, updatedVariant: Variant) => void;
  deleteVariant: (id: string) => void;
  setCurrentVariant: (variant: Variant | null) => void;
  setVariants: (variants: Variant[]) => void;
};

const useAddOnStore = create<FormState & FormActions>((set) => ({
  addOnName: "",
  addOnType: "",
  noOfOptions: 0,
  selections: 0,
  maxQuantity: 0,
  compulsoryQuantity: 0,
  variantName: '',
  variantType: '',
  variantPrice: 0,
  variantMaxQuantity: 0,
  variantAvailability: true,
  variantVisibility: true,
  variantDescription: '',
  variants: [],
  currentVariant: null,

  setAddOnName: (name:string) => set({ addOnName: name }),
  setAddOnType: (type:string) => set({ addOnType: type }),
  setNoOfOptions: (options:number) => set({ noOfOptions: options }),
  setSelections: (selections:number) => set({ selections: selections }),
  setMaxQuantity: (quantity:number) => set({ maxQuantity: quantity }),
  setCompulsoryQuantity: (quantity:number) => set({ compulsoryQuantity: quantity }),
  setVariantName: (name) => set({ variantName: name }),
  setVariantType: (type) => set({ variantType: type }),
  setVariantPrice: (price) => set({ variantPrice: price }),
  setVariantMaxQuantity: (quantity) => set({ variantMaxQuantity: quantity }),
  setVariantAvailability: (availability) => set({ variantAvailability: availability }),
  setVariantVisibility: (visibility) => set({ variantVisibility: visibility }),
  setVariantDescription: (description) => set({ variantDescription: description }),
  setCurrentVariant: (variant) => set({ currentVariant: variant }),
  setVariants: (variants: Variant[]) => set({ variants }),
  addVariant: (variant) =>
  set((state) => ({ variants: [...state.variants, variant] })),

editVariant: (id, updatedVariant) =>
  set((state) => ({
    variants: state.variants.map((v) => (v.id === id ? updatedVariant : v)),
  })),

deleteVariant: (id) =>
  set((state) => ({
    variants: state.variants.filter((v) => v.id !== id),
  })),
}));

export default useAddOnStore;
