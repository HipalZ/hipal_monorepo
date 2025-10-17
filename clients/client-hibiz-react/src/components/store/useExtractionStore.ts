import { createWithEqualityFn } from "zustand/traditional";
// import { CategoryDraft } from "../../lib/menu/types";
import type {
  CategoryDraft,
  DishDraft,
  ExtractResponse,
} from "../../lib/menu/types";

interface ExtractionState {
  phase:
    | "idle"
    | "extracting"
    | "review"
    | "creatingCategories"
    | "creatingDishes"
    | "done";
  draft: { categoriesDraft: CategoryDraft[]; dishesDraft: DishDraft[] };
  stats: ExtractResponse["review"]["stats"] | null;
  notes: string[];
  setPhase: (p: ExtractionState["phase"]) => void;
  setDraft: (d: {
    categoriesDraft: CategoryDraft[];
    dishesDraft: DishDraft[];
  }) => void;
  setStats: (s: ExtractionState["stats"]) => void;
  setNotes: (n: string[]) => void;
  reset: () => void;
}

export const useExtractionStore = createWithEqualityFn<ExtractionState>(
  (set) => ({
    phase: "idle",
    draft: { categoriesDraft: [], dishesDraft: [] },
    stats: null,
    notes: [],
    setPhase: (p) => set({ phase: p }),
    setDraft: (d) => set({ draft: d }),
    setStats: (s) => set({ stats: s }),
    setNotes: (n) => set({ notes: n }),
    reset: () =>
      set({
        phase: "idle",
        draft: { categoriesDraft: [], dishesDraft: [] },
        stats: null,
        notes: [],
      }),
  }),
);
