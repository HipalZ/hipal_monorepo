import { create } from 'zustand';

interface StoreState {
    step: number;
    phone: string;
    name: string;
    setStep: (step: number) => void;
    setPhone: (phone: string) => void;
    setName: (name: string) => void;
}

const useLoginStore = create<StoreState>((set) => ({
    step: 1,
    phone: '',
    name: '',
    setStep: (step: number) => set({ step }),
    setPhone: (phone: string) => set({ phone }),
    setName: (name: string) => set({ name }),
}));

export default useLoginStore;
