import { createWithEqualityFn } from "zustand/traditional";

interface StoreState {
  step: number;
  phone: string;
  name: string;
  setStep: (step: number) => void;
  setPhone: (phone: string) => void;
  setName: (name: string) => void;
}

const useLoginStore = createWithEqualityFn<StoreState>((set) => ({
  step: 1,
  phone: "",
  name: "",
  setStep: (step: number) => set({ step }),
  setPhone: (phone: string) => set({ phone }),
  setName: (name: string) => set({ name }),
}));

export default useLoginStore;
