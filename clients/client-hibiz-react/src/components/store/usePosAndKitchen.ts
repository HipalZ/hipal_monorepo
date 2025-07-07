import { create } from "zustand";

export type PosAndKitchenPages = "POS" | "KITCHEN";

interface KitchenState {
  posAndKitchenPages: PosAndKitchenPages;
  setPosAndKitchenPages: (posAndKitchenPages: PosAndKitchenPages) => void;
}

const usePosAndKitchen = create<KitchenState>((set) => ({
  posAndKitchenPages: "POS",
  setPosAndKitchenPages: (posAndKitchenPages: PosAndKitchenPages) =>
    set({ posAndKitchenPages }),
}));

export default usePosAndKitchen;
