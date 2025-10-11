import { createWithEqualityFn } from "zustand/traditional";
import useBusinessData from "./useBusinessData";

export enum OrderMode {
  WITH_ORDER = "with_order",
  WITHOUT_ORDER = "without_order",
}

export enum VerificationType {
  USER = "user",
  CAPTAIN = "captain",
}

interface State {
  selectedPos: string;
  setSelectedPos: (selectedPos: string) => void;

  posId: string;
  setPosId: (posId: string) => void;

  petPoojaId: string;
  setPetPoojaId: (petPoojaId: string) => void;

  restaurantName: string;
  setRestaurantName: (restaurantName: string) => void;

  orderMode: OrderMode;
  setOrderMode: (orderMode: OrderMode) => void;

  verificationType: VerificationType;
  setVerificationType: (verificationType: VerificationType) => void;
}

const useTempStore = createWithEqualityFn<State>((set) => {
  const businessName = useBusinessData.getState().businessData?.name || "";
  return {
    selectedPos: "",
    setSelectedPos: (selectedPos: string) => set({ selectedPos }),

    posId: "",
    setPosId: (posId: string) => set({ posId }),

    petPoojaId: "",
    setPetPoojaId: (petPoojaId: string) => set({ petPoojaId }),

    restaurantName: businessName,
    setRestaurantName: (restaurantName: string) => set({ restaurantName }),

    orderMode: OrderMode.WITH_ORDER,
    setOrderMode: (orderMode: OrderMode) => set({ orderMode }),

    verificationType: VerificationType.USER,
    setVerificationType: (verificationType: VerificationType) =>
      set({ verificationType }),
  };
});

export default useTempStore;
