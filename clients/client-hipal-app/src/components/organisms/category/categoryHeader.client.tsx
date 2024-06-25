"use client"
import Header from "@/components/molecules/header"
import DishesTypes from "@/components/organisms/category/dishTypes"
import { useRoutingFlow } from "@/components/store/useRoutingFlow"
import { divide } from "lodash-es"
import { memo, useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"

interface ICategoryProps {
	allCategoriesTypes: any
	categories: any,
	primaryColor: string
}
function CategoryHeader(props: ICategoryProps) {
	const { allCategoriesTypes, categories, primaryColor } = props
	const [data, setData] = useState({
		roundedHeader: false,
	}) // roundedHeader is false when the header is scrolled to the top
	const { ref: headerRef, entry } = useInView({
		threshold: 1,
	})

	const { getPreviousPath } = useRoutingFlow()

	useEffect(() => {
		changeHeaderStyle()
	}, [entry])

	return (
		<Header
			hideBackBtn={data.roundedHeader}
			categories={categories}
			backURL={`${getPreviousPath()}`}
			primaryColor={primaryColor}
			title={
				<div className="text-xl">
					Menu
				</div>
			}
			showOtherButtons
		>
			<DishesTypes allCategoriesTypes={allCategoriesTypes}
				categories={categories} />
		</Header>
	)

	function changeHeaderStyle() {
		if ((entry?.boundingClientRect.top as number) < 1) {
			setData({ ...data, roundedHeader: false })
		} else if (!data.roundedHeader) setData({ ...data, roundedHeader: true })
	}
}

export default memo(CategoryHeader)
