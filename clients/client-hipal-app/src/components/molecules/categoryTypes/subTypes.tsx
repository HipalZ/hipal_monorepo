//@ts-nocheck
import PlaceholderImg from "@/components/atoms/placeholder"
import { useActiveClass } from "@/components/store/useActiveClass"
import type { ICategory } from "@/components/types/businessData"
import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/image"
import Link from "next/link"
import { memo, useMemo, useRef } from "react"

interface ISubTypes {
	allCategoriesTypes: {
		sub: any
	},
	categories: ICategory[]
}
function SubTypes(props: ISubTypes) {
	const { allCategoriesTypes, categories } = props
	const subTypeContainerRef = useRef(null)
	const setActiveCategory = useActiveClass((s) => s.setActiveCategory)
	const isActiveCategory = useActiveClass((s) => s.isActiveCategory)
	const setActiveParentCategory = useActiveClass((s) => s.setActiveParentCategory)
	const parentCategory = useMemo(
		() =>
			categories?.filter((ele: any) => ele?._id === isActiveCategory)?.[0]?.parentCategoryId,
		[isActiveCategory, categories],
	)

	const subTypes = useMemo(() => {
		return allCategoriesTypes?.sub?.[parentCategory || ""] || null
	}, [allCategoriesTypes?.sub, parentCategory])

	return (
		<section className="overflow-x-auto">
			{!!subTypes && (
				<div
					ref={subTypeContainerRef}
					className="flex flex-nowrap -webkit-flex snap-proximity snap-x"
				>
					{Object.values(subTypes).map((item: ICategory, index: number) => (
						<div
							id={"subType" + item?._id}
							className="relative px-2 py-4 snap-center"
							key={item.name + index}
						>
							<Link
								href={`#${item?._id}`}
								onClick={() => {
									setActiveCategory(item?._id)
									setActiveParentCategory(item?.parentCategoryId ? item?.parentCategoryId : "")
								}}
							>
								<article
									className={` ${isActiveCategory === item?._id ? "scale-110 bg-primary/10" : ""
										} flex w-full border border-primary rounded-full items-center justify-between px-2 py-1`}
								>
									{!!item.coverImage ? (
										<figure className="w-[1.75rem] max-h-[1.5rem] mr-1 rounded-full overflow-hidden">
											<Image
												src={item.coverImage}
												alt="dish"
												quality={95}
												width={35}
												height={35}
												objectFit="cover"
												blurDataURL={getRandomBlurImg(50, 50)}
											/>
										</figure>
									)
										: (
											<figure className="w-[1.75rem] h-[1.75rem] rounded-full overflow-hidden">
											<PlaceholderImg className="rounded-full" />
											</figure>
										)}
									<h6
										className={` ${isActiveCategory === item?._id ? "text-primary " : ""
											} text-sm w-full whitespace-nowrap text-nowrap`}
									>
										{item?.name}
									</h6>
								</article>


							</Link>
						</div>
					))}
				</div>
			)}
		</section>
	)
}

const MemoSubTypes = memo(SubTypes)
export default MemoSubTypes
