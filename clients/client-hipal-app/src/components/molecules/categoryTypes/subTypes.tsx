import PlaceholderImg from "@/components/atoms/placeholder"
import { useActiveClass } from "@/components/store/useActiveClass"
import { _useAllBusiness } from "@/components/store/useAllBusiness"
import { useDishTypes } from "@/components/store/useDishTypes"
import { ICategory } from "@/components/types/businessData"
import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/image"
import Link from "next/link"
import { memo, useEffect, useMemo, useRef } from "react"

function SubTypes() {
	const subTypeContainerRef = useRef(null)
	const setActiveCategory = useActiveClass((s) => s.setActiveCategory)
	const isActiveCategory = useActiveClass((s) => s.isActiveCategory)
	const setActiveParentCategory = useActiveClass((s) => s.setActiveParentCategory)
	const data = _useAllBusiness((s) => s.data)
	const allCategoriesTypes = useMemo(() => data?.allCategoriesTypes, [data?.allCategoriesTypes])
	const parentCategory = useMemo(
		() =>
			data?.categories?.filter((ele: any) => ele?._id === isActiveCategory)?.[0]?.parentCategoryId,
		[isActiveCategory, data?.categories],
	)

	const subTypes = useMemo(() => {
		return allCategoriesTypes?.sub?.[parentCategory || ""] || null
	}, [allCategoriesTypes?.sub, parentCategory])

	useEffect(() => {
		if (typeof document === "undefined") return

		const el = document.getElementById(`subType${isActiveCategory}`) as HTMLElement

		if (!el || !subTypeContainerRef.current) return
		const container = subTypeContainerRef.current as HTMLElement

		container.scrollTo({
			left:
				el.getBoundingClientRect().x -
				container.getBoundingClientRect().x +
				container.scrollLeft -
				container.clientWidth / 2 +
				el.getBoundingClientRect().width / 2,
			behavior: "smooth",
		})
	}, [isActiveCategory])

	return (
		<>
			{!!subTypes && (
				<div className="flex flex-row w-full mx-auto">
					<div
						ref={subTypeContainerRef}
						className="flex flex-row max-w-full space-x-0 overflow-x-auto -webkit-flex snap-proximity snap-x"
					>
						{Object.values(subTypes).map((item: ICategory, index: number) => (
							<div
								id={"subType" + item?._id}
								className="relative ml-4 snap-center"
								key={item.name + index}
							>
								<Link
									className="on_active_bounce rounded-full  flex flex-col capitalize !px-2 !py-1 text-sm min-w-fit font-[550] space-y-2 text-base-content"
									href={`#${item?._id}`}
									onClick={() => {
										setActiveCategory(item?._id)
										setActiveParentCategory(item?.parentCategoryId ? item?.parentCategoryId : "")
									}}
								>
									<div
										className={`!w-12 !h-12 rounded-lg overflow-hidden mx-auto ${
											isActiveCategory === item?._id ? "scale-125" : ""
										}`}
									>
										{!!item.coverImage ? (
											<Image
												src={item.coverImage}
												layout={"intrinsic"}
												alt="dish"
												quality={75}
												width={50}
												height={50}
												objectFit="cover"
												placeholder="blur"
												className="my-2 scale-150"
												blurDataURL={getRandomBlurImg(50, 50)}
											/>
										) : (
											<>
												<PlaceholderImg className="w-12 h-12" />
											</>
										)}
									</div>

									<span
										className={`font-semibold text-center px-2 text-[0.725rem] w-[5rem] ${
											isActiveCategory === item?._id ? "text-primary " : ""
										} `}
									>
										{item?.name}
									</span>

									<div
										className={`${
											isActiveCategory === item._id ? "bg-primary" : "bg-transparent"
										}  w-full h-0.5 rounded-full -pb-2 mx-auto`}
									></div>
								</Link>
							</div>
						))}
					</div>
				</div>
			)}
		</>
	)
}
export default memo(SubTypes)
