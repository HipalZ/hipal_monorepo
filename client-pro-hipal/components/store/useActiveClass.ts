import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface IUseSettings {
	isActiveCategory: string
	setActiveCategory: (categoryId: string) => void
	isActiveDishType: string
	setActiveDishType: (dishTypeId: string) => void
	isActiveParentCategory: string
	setActiveParentCategory: (category: string) => void
	isActiveParentCategoryName: string
	setActiveParentCategoryName: (category: string) => void
}

export const useActiveClass = create(
	persist<IUseSettings>(
		(set) => ({
			isActiveCategory: '',
			isActiveDishType: '',
			isActiveParentCategory: '',
			isActiveParentCategoryName: '',
			setActiveParentCategoryName: (category) => set(() => ({ isActiveParentCategoryName: category })),
			setActiveParentCategory: (category) => set(() => ({ isActiveParentCategory: category })),
			setActiveCategory: (categoryId) => set(() => ({ isActiveCategory: categoryId })),
			setActiveDishType: (dishTypeId) => set(() => ({ isActiveDishType: dishTypeId })),
		}),
		{
			name: 'activecategory',
		},
	),
)
