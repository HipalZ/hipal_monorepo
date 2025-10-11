import { createWithEqualityFn } from "zustand/traditional";

export type PosAndKitchenPages = "POS" | "KITCHEN";

interface KitchenState {
  posAndKitchenPages: PosAndKitchenPages;
  setPosAndKitchenPages: (posAndKitchenPages: PosAndKitchenPages) => void;
}

const usePosAndKitchen = createWithEqualityFn<KitchenState>((set) => ({
  posAndKitchenPages: "POS",
  setPosAndKitchenPages: (posAndKitchenPages: PosAndKitchenPages) =>
    set({ posAndKitchenPages }),
}));

export default usePosAndKitchen;
