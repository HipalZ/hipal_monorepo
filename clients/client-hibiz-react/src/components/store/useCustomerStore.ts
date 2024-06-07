import { create } from "zustand";
import { Customer } from "../types/businessData";
import { persist } from "zustand/middleware";

export const useStore = create(
	persist<{
		selectedCustomer: Customer | null;
		selectCustomer: (customer: Customer) => void;
	}>(
		(set) => ({
			selectedCustomer: null,
			selectCustomer: (customer) => set({ selectedCustomer: customer }),
		}),
		{
			name: "useSelectedCustomer",
		},
	),
);
