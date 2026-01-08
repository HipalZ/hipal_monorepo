import { create } from "zustand";

export type MenuTab = "DISHES" | "CATEGORIES" | "ADDONS" | "KITCHEN" | "ZONES";

interface MenuUIState {
  // Sidebar state
  selectedSidebarItem: "ALL" | string; // "ALL" or menuId
  isSidebarOpen: boolean;

  // Menu switcher state
  selectedMenuId: "ALL" | string;
  setSelectedMenuId: (menuId: "ALL" | string) => void;

  // Active tab
  activeTab: MenuTab;

  // Quick menu panel state
  showQuickMenu: boolean;
  setShowQuickMenu: (show: boolean) => void;

  // Sync metadata
  lastPulledAt: number | null;
  lastPushedAt: number | null;
  isDirty: boolean;
  draftOpsCount: number;

  // Merge mode state
  mergeMode: boolean;
  mergedMenuIds: string[];

  // Actions
  setSelectedSidebarItem: (item: "ALL" | string) => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: MenuTab) => void;
  setLastPulledAt: (timestamp: number) => void;
  setLastPushedAt: (timestamp: number) => void;
  setDraftOpsCount: (count: number) => void;
  setMergeMode: (enabled: boolean) => void;
  setMergedMenuIds: (ids: string[]) => void;
}

export const useMenuUIStore = create<MenuUIState>((set) => ({
  selectedSidebarItem: "ALL",
  isSidebarOpen: false,
  selectedMenuId: "ALL",
  activeTab: "DISHES",
  showQuickMenu: false,
  lastPulledAt: null,
  lastPushedAt: null,
  isDirty: false,
  draftOpsCount: 0,
  mergeMode: false,
  mergedMenuIds: [],

  setSelectedSidebarItem: (item) => set({ selectedSidebarItem: item }),
  setSelectedMenuId: (menuId) =>
    set({ selectedMenuId: menuId, selectedSidebarItem: menuId }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowQuickMenu: (show) => set({ showQuickMenu: show }),
  setLastPulledAt: (timestamp) => set({ lastPulledAt: timestamp }),
  setLastPushedAt: (timestamp) => set({ lastPushedAt: timestamp }),
  setDraftOpsCount: (count) =>
    set({
      draftOpsCount: count,
      isDirty: count > 0,
    }),
  setMergeMode: (enabled) => set({ mergeMode: enabled }),
  setMergedMenuIds: (ids) => set({ mergedMenuIds: ids }),
}));
