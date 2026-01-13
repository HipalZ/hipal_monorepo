import { createWithEqualityFn } from "zustand/traditional";
import { createJSONStorage, persist } from "zustand/middleware";

export type DashBoardState =
  | "management"
  | "Services"
  | "Coupon_And_Loyalty"
  | "Marketing";

export const useSelectedIcon = createWithEqualityFn(
  persist<{
    selectedIcon: string;
    setSelectedIcon: (text: string) => void;
    selectedSubIcon: string;
    setSelectedSubIcon: (text: string) => void;
    selectedDashboard: DashBoardState;
    setSelectedDashboard: (text: DashBoardState) => void;
  }>(
    (set) => ({
      selectedIcon: "Home",
      setSelectedIcon: (text: string) => set({ selectedIcon: text }),
      selectedSubIcon: "",
      setSelectedSubIcon: (text: string) => set({ selectedSubIcon: text }),

      selectedDashboard: "management",
      setSelectedDashboard: (text: DashBoardState) =>
        set({ selectedDashboard: text }),
    }),
    {
      name: "useSelectedIcon",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
