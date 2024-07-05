import { persist } from 'zustand/middleware';
import { create } from 'zustand';

interface IDishWithParent {
    _id: string;
    id: string;
    name: string;
    parentCategoryName: string;
}

interface IUseSearch {
    searchText: string;
    setSearchText: (d: string) => void;
    isFocused: boolean;
    setIsFocused: (d: boolean) => void;
    searchHistory: IDishWithParent[];
    showHistory: boolean;
    setShowHistory: (d: boolean) => void;
    setSearchHistory: (newDish: IDishWithParent) => void;
}

export const useSearch = create(persist<IUseSearch>(
    (set) => ({
        searchText: '',
        setSearchText: (d: string) => set({ searchText: d }),
        isFocused: false,
        setIsFocused: (isFocused) => set({ isFocused }),
        showHistory: false,
        setShowHistory: (showHistory) => set({ showHistory }),
        searchHistory: [],
        setSearchHistory: (newDish: IDishWithParent) => {
            set((state) => {
                if (Object.keys(newDish)?.length === 0) return { searchHistory: [] }
                if (!state.searchHistory.some(dish => dish._id === newDish._id)) {
                    const updatedHistory = [newDish, ...state.searchHistory];
                    if (updatedHistory.length > 15) {
                        updatedHistory.shift();
                    }
                    return { searchHistory: updatedHistory };
                }
                return state;
            });
        },
    }),
    {
        name: 'search-store',
        getStorage: () => localStorage,
    }
),
);