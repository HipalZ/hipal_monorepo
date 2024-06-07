import { create } from 'zustand'

interface IUseStory {
	isStoryOn: boolean
	setIsStoryOn: (data: boolean) => void
}

export const useStory = create<IUseStory>((set) => ({
	isStoryOn: false,
	setIsStoryOn: (d: boolean) => set(() => ({ isStoryOn: d })),
}))
