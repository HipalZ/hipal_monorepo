import axios from "@/utils/axios";
import { paths } from "@/components/utils/paths";
import { isEmpty } from "lodash-es";
import { IBusinessData } from "@/components/types/businessData";
import { redirect } from 'next/navigation';

async function fetchCategoryPageData(businessId:string) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
	let bizId = businessId;
	if (!objectIdRegex.test(businessId)) {
		const response = await axios.get(`/v1/businesses/n/${businessId}`);
		bizId = response.data.data.businessId; 
	}
	if (!bizId) {
        redirect('/');
    }
    const settings = (await axios(paths.settings(bizId))) || {}
    const dishesData = (await axios(paths.dishesData(bizId))) || {}
    const _categoryData = (await axios(paths.categoryByBusiness(bizId))) || {}
    const data = {} as IBusinessData
		data["settings"] = settings?.data?.[0] || {}
		// data['businessesData'] = businessesData?.data || {}
		data["dishesData"] = dishesData?.data || {}
		// data['categoryData'] = categoryData || {}
		const sortCategories = () => {
			const hashedCategories = new Map()

			_categoryData?.data?.data.forEach((category) => {
				hashedCategories.set(category?._id, category)
			})

			const categoryOrder = data.settings?.categoryOrder || []

			const sortedCategories = new Map()

			for (let categoryId of categoryOrder) {
				if (hashedCategories?.has(categoryId)) {
					sortedCategories.set(categoryId, hashedCategories?.get(categoryId))
				}
			}

			const sortedCats = Array.from(sortedCategories.values())

			if (isEmpty(sortedCats)) return _categoryData?.data

			return sortedCats
		}
		const categoryData = sortCategories()
		const allCategoriesTypes = () => {
			const mainType = {}
			const subTypes = {}

			categoryData?.data.forEach((category) => {
				if (!category?.visibility) return

				if (category?.hierarchy === "PARENT") {
					mainType[category?._id] = category
				} else if (!isEmpty(category?.dishes)) {
					subTypes[category?.parentCategoryId] = {
						...subTypes[category?.parentCategoryId],
						[category._id]: category,
					}
				}
			})

			// Removing empty main categories
			Object.keys(mainType).forEach((key) => {
				if (!subTypes?.[mainType?.[key]?._id] && isEmpty(mainType?.[key]?.dishes))
					delete mainType[key]
			})

			return {
				main: mainType,
				sub: subTypes,
			}
		}

		data["allCategoriesTypes"] = allCategoriesTypes()

		const categories = () => {
			let result = [] as any

			categoryData?.data?.forEach((category) => {
				const newCategory = JSON.parse(JSON.stringify(category))
				newCategory.dishes = []

				for (let dishId of category.dishes) {
					const newDish = dishesData?.data.find((d) => d._id === dishId._id)

					if (!!newDish) newCategory.dishes = [...newCategory.dishes, newDish]
				}

				if (!isEmpty(newCategory?.dishes)) result = [...result, newCategory]
			})

			return result
		}
		data["categories"] = categories()
    return data
}

export const categoryApis = {
    all: fetchCategoryPageData
};

export async function fetchAllBusinessIds() {
    const response = await axios.get(paths.listAllBusiness());
    return response?.data?.data.map((business: { _id: string }) => business._id);
}
