import SkeletonLoader from "@components/atoms/loader/skeletonLoader"
import { initializeAllBusiness } from "@components/store/useAllBusiness"
import { useRoutingFlow } from "@components/store/useRoutingFlow"
import type { IBusinessData } from "@components/types/businessData"
import { BUSINESS_ID } from "@components/utils/constants"
import { paths } from "@components/utils/paths"
import axios from "@utils/axios"
import { isEmpty } from "lodash-es"
import dynamic from "next/dynamic"

import { useRouter } from "next/router"
import type { NextRequest, NextResponse } from "next/server"
import { memo, useEffect } from "react"

const TopBackground = dynamic(() => import("@components/molecules/topBackground"), {
	ssr: false,
	loading: () => <SkeletonLoader height={200} />,
})
const CategoryHeader = dynamic(
	() => import("@components/organisms/category/categoryHeader.client"),
	{
		ssr: false,
		loading: () => <SkeletonLoader />,
	},
)
const PageName = dynamic(() => import("@components/molecules/pageName"), {
	ssr: false,
	loading: () => <SkeletonLoader />,
})
const Footer = dynamic(() => import("@components/molecules/footer"), {
	ssr: false,
})
const DishesList = dynamic(() => import("@components/organisms/category/dishesList"), {
	ssr: false,
	loading: () => <SkeletonLoader count={3} height={200} />,
})
const CategoryPageBtn = dynamic(
	() => import("@components/molecules/bottomButton/categoryPageBtn"),
	{
		ssr: false,
		loading: () => <SkeletonLoader height={75} />,
	},
)

export default memo(function Category({ data }: { data: IBusinessData }) {
	const { getPreviousPath } = useRoutingFlow()
	const router = useRouter()
	const { businessId } = router.query as { businessId: string }

	useEffect(() => {
		initializeAllBusiness(data)
	}, [data])

	return (
		<div className="relative flex flex-col w-full pb-14">
			<TopBackground onBackURL={`${getPreviousPath()}`} />

			<CategoryHeader />

			<div>
				<div className="!mt-0 !scroll-smooth ">
					<DishesList />
				</div>

				<PageName />

				<Footer />
			</div>
			{businessId !== BUSINESS_ID.KOI_AND_CO && <CategoryPageBtn />}
		</div>
	)
})

async function fetchAllBusinessIds() {
	const response = await axios.get(paths.listAllBusiness())
	return response.data.map((business) => business._id)
}

export async function getStaticPaths() {
	try {
		const businessIds = await fetchAllBusinessIds()

		const paths = businessIds.map((businessId) => ({
			params: { businessId: businessId },
		}))
		return { paths, fallback: "blocking" }
	} catch (error) {
		console.error("Error fetching business IDs:", error)
		return { paths: [], fallback: "blocking" }
	}
}

export async function getStaticProps(context: {
	req: NextRequest
	res: NextResponse
	params: { businessId: string }
}) {
	const { businessId } = context.params
	try {
		const businessId = context?.params?.businessId || ""
		const settings = (await axios(paths.settings(businessId))) || {}
		// const businessesData = await axios(paths.businessData(businessId))
		const dishesData = (await axios(paths.dishesData(businessId))) || {}
		const _categoryData = (await axios(paths.categoryByBusiness(businessId))) || {}
		const data = {} as IBusinessData

		data["settings"] = settings?.data?.[0] || {}
		// data['businessesData'] = businessesData?.data || {}
		data["dishesData"] = dishesData?.data || {}
		// data['categoryData'] = categoryData || {}
		const sortCategories = () => {
			const hashedCategories = new Map()

			_categoryData?.data.forEach((category) => {
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

			categoryData.forEach((category) => {
				if (!category?.visibility) return

				if (category?.hierarchy === "PARENT") {
					mainType[category?._id] = category
					return
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
					const newDish = dishesData?.data.find((d) => d._id === dishId)

					if (!!newDish) newCategory.dishes = [...newCategory.dishes, newDish]
				}

				if (!isEmpty(newCategory?.dishes)) result = [...result, newCategory]
			})

			return result
		}
		data["categories"] = categories()

		initializeAllBusiness(data)
		return { props: { data }, revalidate: 660 }
	} catch (err) {
		console.log(err)
		return {
			redirect: {
				destination: `/r/${businessId}/explore`,
			},
		}
	}
}
