import { create } from "zustand"

interface IUseDishTypes {
	activeDishTypes: { activeMainType: string | null; activeSubType: string | null }
	setActiveDishTypes: (d: object) => void
}

export const useDishTypes = create<IUseDishTypes>((set) => ({
	activeDishTypes: {
		activeMainType: null,
		activeSubType: null,
	},
	setActiveDishTypes: (d: object) =>
		set((s) => ({
			...s,
			activeDishTypes: {
				...s.activeDishTypes,
				...d,
			},
		})),
}))
