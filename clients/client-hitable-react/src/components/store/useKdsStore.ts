// src/components/kds/store/useKdsStore.ts
import { create } from "zustand";
import type { KotOrderDoc } from "../types/kds";

export type KdsTab = "OPEN" | "COMPLETED";
type DishSummary = { name: string; total: number; inProgress: number };

type KdsState = {
  // DATA
  byKitchen: Record<string, KotOrderDoc[]>;
  setByKitchen: (kitchenId: string, orders: KotOrderDoc[]) => void;
  counts: Record<string, number>;
  setCount: (kitchenId: string, n: number) => void;

  // UI FILTERS
  searchDish: string;
  setSearchDish: (s: string) => void;
  selectedDishNames: Set<string>;
  toggleDishName: (name: string) => void;
  clearDishSelection: () => void;
  onlyActive: boolean;
  setOnlyActive: (v: boolean) => void;

  // NEW: waiter / table filters
  waiterFilter: Set<string>;
  toggleWaiter: (name: string) => void;
  clearWaiterFilter: () => void;

  tableFilter: Set<string>;
  toggleTable: (name: string) => void;
  clearTableFilter: () => void;

  // Tabs
  activeTab: KdsTab;
  setActiveTab: (t: KdsTab) => void;

  // Helpers
  getDishSummary: (orders: KotOrderDoc[]) => DishSummary[];
};

export const useKdsStore = create<KdsState>((set, get) => ({
  byKitchen: {},
  setByKitchen: (k, v) =>
    set((s) => ({ byKitchen: { ...s.byKitchen, [k]: v } })),
  counts: {},
  setCount: (k, n) => set((s) => ({ counts: { ...s.counts, [k]: n } })),

  searchDish: "",
  setSearchDish: (s) => set({ searchDish: s }),
  selectedDishNames: new Set<string>(),
  toggleDishName: (name) => {
    const curr = new Set(get().selectedDishNames);
    curr.has(name) ? curr.delete(name) : curr.add(name);
    set({ selectedDishNames: curr });
  },
  clearDishSelection: () => set({ selectedDishNames: new Set<string>() }),

  onlyActive: true,
  setOnlyActive: (v) => set({ onlyActive: v }),

  // NEW waiter/table filters
  waiterFilter: new Set<string>(),
  toggleWaiter: (name) => {
    const curr = new Set(get().waiterFilter);
    curr.has(name) ? curr.delete(name) : curr.add(name);
    set({ waiterFilter: curr });
  },
  clearWaiterFilter: () => set({ waiterFilter: new Set<string>() }),

  tableFilter: new Set<string>(),
  toggleTable: (name) => {
    const curr = new Set(get().tableFilter);
    curr.has(name) ? curr.delete(name) : curr.add(name);
    set({ tableFilter: curr });
  },
  clearTableFilter: () => set({ tableFilter: new Set<string>() }),

  activeTab: "OPEN",
  setActiveTab: (t) => set({ activeTab: t }),

  getDishSummary: (orders) => {
    const map = new Map<string, DishSummary>();
    for (const o of orders) {
      for (const item of o.cart) {
        if (item.isDeleted) continue;
        const name = item?.dish?.name ?? "—";
        const entry = map.get(name) ?? { name, total: 0, inProgress: 0 };
        entry.total += 1;
        if (item.itemStatus === "IN_PROGRESS") entry.inProgress += 1;
        map.set(name, entry);
      }
    }
    // only dishes that have something cooking
    return Array.from(map.values())
      .filter((d) => d.inProgress > 0)
      .sort((a, b) => b.inProgress - a.inProgress);
  },
}));
