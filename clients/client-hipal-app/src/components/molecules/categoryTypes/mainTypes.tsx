import { useActiveClass } from "@/components/store/useActiveClass"
import { _useAllBusiness } from "@/components/store/useAllBusiness"
import { useDishTypes } from "@/components/store/useDishTypes"
import { ICategory } from "@/components/types/businessData"
import { getRandomBlurImg } from "@/components/utils/images"
import { SplideSlide } from "@splidejs/react-splide"
import Image from "next/image"
import { CSSProperties, memo, useEffect, useMemo, useRef } from "react"

interface IMainTypes{
	allCategoriesTypes: {
		main: any
		sub: any
	}
}
function MainTypes(props:IMainTypes) {
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
		padding: "1.25rem 0",
		gap: "0rem",
	}

	return !!mainTypes ? (
		<div className="flex flex-row w-full px-4 mx-auto hide-scrollbar">
			<div ref={mainContainerRef} style={containerStyles} className="space-x-4 whitespace-nowrap">
				{Object.values(mainTypes)
					.filter((item) => item?.visibility)
					.map((item: ICategory, index: number) => {
						const activeSubType =
							Object.keys(allCategoriesTypes?.sub?.[item._id || ""] || {})?.[0] || null
						return (
							<SplideSlideWrapper key={index + (item?.name || "")}>
								<div id={item?._id} className="relative" key={item.name + index}>
									<a
										className={` on_active_bounce
											btn btn-sm rounded-full flex flex-row capitalize !h-[2.4rem]  !min-h-[2.0625rem] !px-2 text-sm min-w-fit  btn-primary font-[550] space-x-2 text-base-100/60   btn-outline focus:!bg-transparent active:!bg-primary-content hover:!bg-transparent focus:!text-primary active:!text-primary hover:!text-primary focus:!shadow-none active:!shadow-none hover:!shadow-none ${
												isActiveParentCategory == item?._id ? "bg-primary/20" : ""
											}
										`}
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
										{!!item.coverImage && (
											<div
												className={` !w-6 !h-6 ${
													isActiveParentCategory === item?._id ? "scale-125" : ""
												}`}
											>
												<Image
													src={item.coverImage}
													layout={"intrinsic"}
													alt="dish"
													quality={75}
													width={25}
													height={25}
													objectFit="cover"
													className="rounded-full "
													blurDataURL={getRandomBlurImg(25, 25)}
												/>
											</div>
										)}

										<span className="font-semibold min-w-max">{item.name}</span>
									</a>
								</div>
							</SplideSlideWrapper>
						)
					})}
			</div>
		</div>
	) : null
}

export default memo(MainTypes)
