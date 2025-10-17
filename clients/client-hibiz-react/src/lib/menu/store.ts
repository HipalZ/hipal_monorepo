import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category } from "./types";

interface MenuState {
  categories: Category[];
  isEditing: boolean;
  processingPhase:
    | "idle"
    | "extracting"
    | "review"
    | "creatingCategories"
    | "creatingDishes"
    | "done";
  setProcessingPhase: (
    phase:
      | "idle"
      | "extracting"
      | "review"
      | "creatingCategories"
      | "creatingDishes"
      | "done",
  ) => void;
  setEditing: (val: boolean) => void;
  setCategories: (cats: Category[]) => void;
  updateCategoryName: (catId: string, newName: string) => void;
  updateDishDetails: (
    catId: string,
    subId: string,
    dishId: string,
    updates: Partial<{
      dishName: string;
      price: number;
      dishType: string;
    }>,
  ) => void;
  moveDishToCategory: (
    dishId: string,
    fromCatId: string,
    fromSubId: string,
    toCatId: string,
    toSubId: string,
  ) => void;
  moveDish: (
    dishId: string,
    from: { catId: string; subId: string; index: number },
    to: { catId: string; subId: string; index: number },
  ) => void;
  clear: () => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      categories: [],
      isEditing: false,
      processingPhase: "idle",

      setProcessingPhase: (phase) => set({ processingPhase: phase }),

      setEditing: (val) => set({ isEditing: val }),
      setCategories: (cats) => set({ categories: cats }),

      updateCategoryName: (catId, newName) => {
        const state = get();
        const cats = state.categories.map((c) =>
          c.id === catId ? { ...c, name: newName } : c,
        );
        set({ categories: cats });
      },

      updateDishDetails: (catId, subId, dishId, updates) => {
        const state = get();
        const cats = state.categories.map((c) => {
          if (c.id !== catId) return c;
          return {
            ...c,
            subcategories: c.subcategories.map((s) => {
              if (s.id !== subId) return s;
              return {
                ...s,
                dishes: s.dishes.map((d) =>
                  d.id === dishId ? { ...d, ...updates } : d,
                ),
              };
            }),
          };
        });
        set({ categories: cats });
      },

      moveDishToCategory: (dishId, fromCatId, fromSubId, toCatId, toSubId) => {
        const state = get();
        const cats = state.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) => ({
            ...s,
            dishes: [...s.dishes],
          })),
        }));

        const fromCat = cats.find((c) => c.id === fromCatId);
        const toCat = cats.find((c) => c.id === toCatId);
        if (!fromCat || !toCat) return;

        const fromSub = fromCat.subcategories.find((s) => s.id === fromSubId);
        const toSub = toCat.subcategories.find((s) => s.id === toSubId);
        if (!fromSub || !toSub) return;

        const dishIndex = fromSub.dishes.findIndex((d) => d.id === dishId);
        if (dishIndex === -1) return;

        const [dish] = fromSub.dishes.splice(dishIndex, 1);
        toSub.dishes.push(dish);

        set({ categories: cats });
      },

      clear: () => set({ categories: [], processingPhase: "idle" }),

      // Existing code for moveDish
      moveDish: (dishId, from, to) => {
        const state = get();
        const cats = state.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) => ({
            ...s,
            dishes: [...s.dishes],
          })),
        }));

        const fromCat = cats.find((c) => c.id === from.catId);
        const toCat = cats.find((c) => c.id === to.catId);
        if (!fromCat || !toCat) return;

        const fromSub = fromCat.subcategories.find((s) => s.id === from.subId);
        const toSub = toCat.subcategories.find((s) => s.id === to.subId);
        if (!fromSub || !toSub) return;

        const [moved] = fromSub.dishes.splice(from.index, 1);
        if (!moved || moved.id !== dishId) {
          const idx = fromSub.dishes.findIndex((d) => d.id === dishId);
          if (idx >= 0) {
            const [m] = fromSub.dishes.splice(idx, 1);
            toSub.dishes.splice(to.index, 0, m);
          } else {
            return;
          }
        } else {
          toSub.dishes.splice(to.index, 0, moved);
        }

        set({ categories: cats });
      },
    }),
    { name: "ai-menu-categories" },
  ),
);
