import { create } from 'zustand'

interface ITracking {
	parentRef: any
	setParentRef: (ref: any) => void
	isVisible: boolean
	setIsVisible: (isVisible: boolean) => void
	id: any
	setId: (id: any) => void
}

// if we remove circle bracket from arrow function then it will become the function now we returning the object coz we added circle bracket
const useTracking = create<ITracking>((set) => ({
	parentRef: null,
	setParentRef: (ref: any) => set({ parentRef: ref }),

	isVisible: false,
	setIsVisible: (isVisible: boolean) => set({ isVisible }),

	id: null,
	setId: (id: any) => set({ id }),
}))

export default useTracking
