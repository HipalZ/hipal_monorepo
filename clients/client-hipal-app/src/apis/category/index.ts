import { isEmpty } from "lodash-es";
import { fetchCommonData } from "../commonApis";
import { apiRpc } from "@hi/common";

async function fetchCategoryPageData(customLink: string) {
	// common api has business and settings data
	const {data, bizId} = await fetchCommonData(customLink)
	const dishesDataResponse = await apiRpc.dishes.$get({
		query: {
			businessId: bizId
		}
	})

	const dishesData = await dishesDataResponse.json()
	data["dishesData"] = dishesData?.data || []

	const categoryDataResponse = await apiRpc.categories.$get({
		query: {
			businessId: bizId
		}
	})

	const _categoryData = await categoryDataResponse.json()

	const sortCategories = () => {
		const hashedCategories = new Map()
		_categoryData?.data?.forEach((category) => {
			hashedCategories.set(category?._id, category)
		})

		const categoryOrder = data.settings?.categoryOrder || []

		const sortedCategories = new Map()

		for (const categoryId of categoryOrder) {
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
		categoryData?.forEach((category) => {
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

		categoryData?.forEach((category) => {
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
	const res = await apiRpc.businesses.get.allbusiness.$get({});
	const response = await res.json()
	return response?.data.map((business: { _id: string }) => business._id);
}
