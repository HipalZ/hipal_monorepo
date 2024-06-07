import { create } from 'zustand'

interface IUseSearch {
	searchText: string
	setSearchText: (d: string) => void
}

export const useSearch = create<IUseSearch>((set) => ({
	searchText: '',
	setSearchText: (d: string) => set(() => ({ searchText: d })),
}))
