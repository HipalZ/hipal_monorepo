import { SetState, create } from 'zustand'

interface IStatus {
	dishStatus: Array<any>
	setDishStatus: (d: Array<any>) => void
}

export const useStatus = create<IStatus>((set: SetState<IStatus>) => ({
	dishStatus: [],
	setDishStatus: (d: Array<any>) => set(() => ({ dishStatus: d })),
}))
