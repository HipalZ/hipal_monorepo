// @ts-nocheck
import { useActiveClass } from "@/components/store/useActiveClass"
import { useDishTypes } from "@/components/store/useDishTypes"
import type { ICategory } from "@/components/types/businessData"
import { SplideSlide } from "@splidejs/react-splide"
import { type CSSProperties, memo, useEffect, useMemo, useRef } from "react"

interface IMainTypes {
	allCategoriesTypes: {
		main: ICategory[]
		sub: ICategory[]
	}
}
function MainTypes(props: IMainTypes) {
	const { allCategoriesTypes } = props
	const activeDishTypes = useDishTypes((s) => s.activeDishTypes)
	const setActiveDishTypes = useDishTypes((s) => s.setActiveDishTypes)
	const setActiveCategory = useActiveClass((s) => s.setActiveCategory)
	const isActiveParentCategory = useActiveClass((s) => s.isActiveParentCategory)
	const setActiveParentCategory = useActiveClass((s) => s.setActiveParentCategory)
	const setActiveParentCategoryName = useActiveClass((s) => s.setActiveParentCategoryName)
	const mainTypes = useMemo(() => allCategoriesTypes?.main, [allCategoriesTypes?.main])

	const mainContainerRef = useRef<HTMLDivElement | null>(null)
	useEffect(() => {
		if (typeof document === "undefined" || !isActiveParentCategory) return

		const el = document.getElementById(isActiveParentCategory) as HTMLElement
		const container = mainContainerRef.current

		if (!el || !container) return

		const elRect = el.getBoundingClientRect()
		const containerRect = container.getBoundingClientRect()

		if (elRect.left < containerRect.left || elRect.right > containerRect.right) {
			const scrollLeft =
				elRect.left -
				containerRect.left +
				container.scrollLeft -
				(containerRect.width - elRect.width) / 2
			container.scroll({
				left: scrollLeft,
				behavior: "smooth",
			})
		}
	}, [isActiveParentCategory])

	const SplideSlideWrapper = ({ children }: { children?: React.ReactNode }) => {
		return <SplideSlide>{children}</SplideSlide>
	}
	const containerStyles: CSSProperties = { 
		display: "flex",
		flexDirection: "row",
		overflowX: "auto",
		padding:"0.5rem 0",
		gap: "0rem",
	}

	return !!mainTypes ? (
		<div className="flex w-full px-4 mx-auto hide-scrollbar bg-base-200 no-scrollbar">
			<div ref={mainContainerRef} style={containerStyles} className="whitespace-nowrap no-scrollbar">
				{Object.values(mainTypes)
					.filter((item) => item?.visibility)
					.map((item: ICategory, index: number) => {
						const activeSubType =
							Object.keys(allCategoriesTypes?.sub?.[item._id || ""] || {})?.[0] || ''
						return (
							<section className="flex items-center" key={index + (item?.name || "")}>
								<SplideSlideWrapper>
									<div id={item?._id} className="relative">
										<a
											className={`on_active_bounce text-sm flex capitalize space-x-2  ${isActiveParentCategory === item?._id ? "border-b border-primary text-primary" : "opacity-70"
												}`}
											href={`#${activeSubType || item?._id}`}
											onClick={() => {
												setActiveDishTypes({
													...activeDishTypes,
													activeMainType: item?._id,
													activeSubType: activeSubType,
												})
												setActiveCategory(activeSubType || "")
												setActiveParentCategory(item?._id)
												setActiveParentCategoryName(item?.name || "")
											}}
										>
											<span className="font-semibold min-w-max">{item.name}</span>
										</a>
									</div>
								</SplideSlideWrapper>
								{index < Object.values(mainTypes).filter((item) => item?.visibility).length - 1 && (
									<div className="text-2xl !font-thin divider opacity-70">|</div> 
								)}
							</section>
						)
					})}
			</div>

		</div>
	) : null
}

const MainTypesMemo = memo(MainTypes)
export default MainTypesMemo
