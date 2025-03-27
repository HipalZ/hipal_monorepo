import { create } from "zustand";

interface IBirthdayState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;

  day: number | null;
  setDay: (day: number) => void;

  month: number | null;
  setMonth: (month: number) => void;

  year: number | null;
  setYear: (year: number) => void;

  isValid: boolean;
  setIsValid: (isValid: boolean) => void;

  errorMessage: string;
  setErrorMessage: (errorMessage: string) => void;

  monthOpen: boolean;
  setMonthOpen: (monthOpen: boolean) => void;

  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
}

export const useBirthday = create<IBirthdayState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),

  day: null,
  setDay: (day) => set({ day }),

  month: null,
  setMonth: (month) => set({ month }),

  year: null,
  setYear: (year) => set({ year }),

  isValid: false,
  setIsValid: (isValid) => set({ isValid }),

  errorMessage: "",
  setErrorMessage: (errorMessage) => set({ errorMessage }),

  monthOpen: false,
  setMonthOpen: (monthOpen) => set({ monthOpen }),

  openModal: false,
  setOpenModal: (openModal) => set({ openModal }),
}));
