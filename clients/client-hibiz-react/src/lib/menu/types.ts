// Canonical dish types (uppercase)
export type DishType = "VEG" | "NON_VEG" | "EGG" | "VEGAN" | "ALCOHOL" | "NON_ALCOHOL" | "GLUTEN_FREE" | "MIX"

// Portion definition
export interface Portion {
  name: string
  price: number
  default: boolean
  portionTypes: DishType[]
}

// Extract Phase Types (with temp IDs)
export interface CategoryDraft {
  tempId: string
  name: string
}

export interface DishDraft {
  tempId: string
  name: string
  dishTypes: DishType[]
  price: number
  description: string
  portions: Portion[]
  categoryRefs: string[] // temp IDs
  visibility: boolean
  availability: boolean
}

export interface ExtractResponse {
  status: "ok" | "empty" | "error"
  ui: {
    sections: Array<{ key: string; label: string }>
    loaders: {
      extract: { label: string; icon: string }
      createCategories: { label: string; icon: string }
      linkDishes: { label: string; icon: string }
    }
    refreshGuard: {
      title: string
      message: string
      primary: string
      secondary: string
    }
    successModal: {
      title: string
      bodyTemplate: string
      primaryCta: string
      secondaryCta: string
    }
  }
  review: {
    notes: string[]
    stats: {
      categories: number
      dishes: number
      dishesWithPortions: number
      missingPrices: number
    }
  }
  categoriesDraft: CategoryDraft[]
  dishesDraft: DishDraft[]
}

// Finalize Phase Types
export interface FinalizeInput {
  phase: "finalize"
  editedDraft: {
    categoriesDraft: CategoryDraft[]
    dishesDraft: DishDraft[]
  }
  categoryIdMap: Record<string, string> // tempId -> dbId
}

export interface CategoryPayload {
  name: string
  hierarchy: "CHILD"
}

export interface DishPayload {
  name: string
  price: number
  visibility: boolean
  availability: boolean
  dishTypes: DishType[]
  description: string
  categoryIds: string[]
  portions: Portion[]
}

export interface FinalizeResponse {
  status: "ok" | "error"
  payloads: {
    categories: CategoryPayload[]
    dishes: DishPayload[]
  }
  review: {
    notes: string[]
    stats: {
      categories: number
      dishes: number
    }
  }
}
