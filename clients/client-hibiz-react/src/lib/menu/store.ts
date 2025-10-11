import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CategoryDraft, DishDraft, ExtractResponse } from "./types";

interface MenuBuilderState {
  // Extract phase data
  extractResponse: ExtractResponse | null;
  categoriesDraft: CategoryDraft[];
  dishesDraft: DishDraft[];

  // UI state
  currentPhase: "upload" | "extract" | "review" | "finalize" | "success";
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;

  // Actions
  setExtractResponse: (response: ExtractResponse) => void;
  updateCategoryDraft: (
    tempId: string,
    updates: Partial<CategoryDraft>,
  ) => void;
  updateDishDraft: (tempId: string, updates: Partial<DishDraft>) => void;
  setPhase: (phase: MenuBuilderState["currentPhase"]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markUnsavedChanges: (hasChanges: boolean) => void;
  reset: () => void;
}

export const useMenuBuilderStore = create<MenuBuilderState>()(
  persist(
    (set, get) => ({
      extractResponse: null,
      categoriesDraft: [],
      dishesDraft: [],
      currentPhase: "upload",
      isLoading: false,
      error: null,
      hasUnsavedChanges: false,

      setExtractResponse: (response) => {
        set({
          extractResponse: response,
          categoriesDraft: response.categoriesDraft,
          dishesDraft: response.dishesDraft,
          currentPhase: "review",
          hasUnsavedChanges: true,
        });
      },

      updateCategoryDraft: (tempId, updates) => {
        set((state) => ({
          categoriesDraft: state.categoriesDraft.map((cat) =>
            cat.tempId === tempId ? { ...cat, ...updates } : cat,
          ),
          hasUnsavedChanges: true,
        }));
      },

      updateDishDraft: (tempId, updates) => {
        set((state) => ({
          dishesDraft: state.dishesDraft.map((dish) =>
            dish.tempId === tempId ? { ...dish, ...updates } : dish,
          ),
          hasUnsavedChanges: true,
        }));
      },

      setPhase: (phase) => set({ currentPhase: phase }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      markUnsavedChanges: (hasChanges) =>
        set({ hasUnsavedChanges: hasChanges }),

      reset: () =>
        set({
          extractResponse: null,
          categoriesDraft: [],
          dishesDraft: [],
          currentPhase: "upload",
          isLoading: false,
          error: null,
          hasUnsavedChanges: false,
        }),
    }),
    { name: "menu-builder-store" },
  ),
);
