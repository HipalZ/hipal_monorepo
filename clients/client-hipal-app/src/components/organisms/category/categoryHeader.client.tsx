"use client"
import Header from "@/components/molecules/header"
import DishesTypes from "@/components/organisms/category/dishTypes"
import { useRoutingFlow } from "@/components/store/useRoutingFlow"
import { memo, useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"

interface ICategoryProps {
	allCategoriesTypes: any
	categories: any
}
function CategoryHeader(props: ICategoryProps) {
	const { allCategoriesTypes, categories } = props
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
			backURL={`${getPreviousPath()}`}
			title={
				<div className="flex flex-row my-0 space-x-3">
					<h4 className=" my-0 !text-2xl prose font-semibold">Menu</h4>
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
