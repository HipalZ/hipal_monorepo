import HorizontalCard from "@components/atoms/card/horizontalCard"
import { useAllBusiness } from "@components/store/useAllBusiness"
import { useSearch } from "@components/store/useSearch"
import { Transition } from "@headlessui/react"
import { Fragment, memo, useEffect, useMemo, useRef, useState } from "react"
import { BiDish } from "react-icons/bi"
import { HiSearch, HiX } from "react-icons/hi"
import Image from "next/image"
import { routePaths } from "@components/utils/routes"
import { useRouter } from "next/router"
import Link from "next/link"
import { getRandomBlurImg } from "@components/utils/images"
import PlaceholderImg from "@components/atoms/placeholder"
import { useActiveClass } from "@components/store/useActiveClass"

export interface ICat {
	id: string
	name: string
}

// NOTE: A `relative` tag must be added to the parent of this component
function SearchPanel({ closeSearchBox }: { closeSearchBox: () => void }) {
	const panel = useRef(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const { searchText, setSearchText } = useSearch()
	const setActiveCategory = useActiveClass((s) => s.setActiveCategory)
	const [search, setSearchOpen] = useState(false)

	const router = useRouter()

	const { businessId } = router.query as { businessId: string }

	const togglePopover = (searchText = "") => {
		if (searchText.length > 0) {
			if (!isPanelOpen) {
				setIsPanelOpen(true)
			}
		} else {
			setIsPanelOpen(false)
		}
	}

	const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value)
		setSearchOpen(true)
		togglePopover(e.target.value)
	}

	const { data } = useAllBusiness()

	const handleClearSearchText = () => {
		setSearchText("")
	}

	const dishData = useMemo(() => {
		if (!data?.dishesData) {
			return []
		}

		return data.dishesData.filter((dish) => {
			// Exclude dishes without categories
			const hasCategory = dish.categories && dish.categories.length > 0
			if (!hasCategory) {
				return false
			}

			const matchesSearchText = dish.name.toLowerCase().includes(searchText.toLowerCase())
			const categoryMatchesSearchText = dish.categories.some((category) =>
				category.name.toLowerCase().includes(searchText.toLowerCase()),
			)

			return matchesSearchText || categoryMatchesSearchText
		})
	}, [searchText, data])

	const filterCategory = useMemo(
		() =>
			data?.categories?.filter((obj, index) => {
				if (obj?.name?.toLowerCase()?.includes(searchText?.toLowerCase())) {
					return obj
				}
			}),
		[data, searchText],
	)

	const present = filterCategory?.[0]

	const redirectToDish = (dishId: string, category: ICat) => {
		console.log(dishId, category)
		setActiveCategory(category?.[0]?._id)
		setSearchOpen(!search)
		router.push(routePaths[PAGE_TYPES.DISH_ID](businessId, dishId))
	}

	return (
		<div className="flex flex-row w-full" ref={panel}>
			<div
				className="active:bg-primary-content border-primary bg-base-100 focus-within:border-primary-focus focus-within:shadow focus-within:shadow-primary-focus/25 focus-within:bg-base-100-content max-w-screen flex flex-row w-[110%] min-w-max px-2 py-1.5 !-mx-2 space-x-2 overflow-hidden transition-all border rounded-lg z-50 "
				onClick={() => togglePopover(searchText)}
			>
				<input
					autoFocus
					type="text"
					placeholder="Search"
					className="w-full px-2 text-sm bg-transparent focus:outline-none"
					value={searchText}
					onChange={handleSearchTextChange}
				/>
				{searchText.length > 0 ? (
					<HiX
						className="w-5 h-5 mx-2 my-auto text-sm cursor-pointer text-primary"
						onClick={handleClearSearchText}
					/>
				) : (
					<HiSearch
						className="w-4 h-4 mx-2 my-auto text-sm text-primary"
						onClick={closeSearchBox}
					/>
				)}
			</div>
			{search && (
				<Transition
					as={Fragment}
					show={isPanelOpen}
					enter="transition ease-out duration-200"
					enterFrom="opacity-0 -translate-y-1"
					enterTo="opacity-100 translate-y-0"
					leave="transition ease-in duration-150"
					leaveFrom="opacity-100 translate-y-0"
					leaveTo="opacity-0 -translate-y-1"
				>
					<div
						className="z-50 pb-14"
						style={{
							position: "absolute",
							top: "2.5rem",
							left: 0,
							width: "100%",
							height: "100vh",
							overflowY: "auto",
							background: `${data?.settings?.themes.primaryColor}`,
						}}
					>
						{dishData.length > 0 ? (
							present ? (
								<div className="">
									<Link href={`${routePaths.category(businessId)}#${present?._id}`} passHref>
										<div onClick={() => setSearchOpen(!search)} className="mt-14 ">
											<p className="text-[1.125rem] -mb-4 mt-[0.625rem] mx-6">{present.name}</p>
											<p className="text-[0.813rem] -mb-2 flex flex-inline  mx-6">Category</p>
										</div>
										<div className="absolute top-0 right-0 mr-[1.813rem] mt-10  overflow-hidden ">
											{!!present?.coverImage ? (
												<Image
													src={present?.coverImage}
													alt="dish"
													width={125}
													height={122}
													onClick={() => setSearchOpen(!search)}
													placeholder="blur"
													blurDataURL={getRandomBlurImg(110, 110)}
													className="on_active_bounce rounded-xl "
												></Image>
											) : (
												<div>
													<PlaceholderImg className="absolute top-0 right-0 mr-[1.813rem] mt-10  overflow-hidden" />
												</div>
											)}
										</div>
									</Link>

									<hr className="mt-[5rem] opacity-25" />
									<div className="">
										{dishData?.map((dish, index) => (
											<div key={dish._id}>
												<HorizontalCard
													key={`${dish.name}${index}`}
													dishData={dish}
													noDescription
													redirection={redirectToDish}
												/>
												<hr className="-mt-1 opacity-25" />
											</div>
										))}
									</div>
								</div>
							) : (
								dishData?.map((dish, index) => (
									<div key={dish._id}>
										<HorizontalCard
											key={`${dish.name}${index}`}
											dishData={dish}
											noDescription
											redirection={redirectToDish}
										/>
										<hr className="-my-[0.8rem]  opacity-25  " />
									</div>
								))
							)
						) : (
							<>
								<div className="flex flex-col py-10 prose">
									<BiDish className="mx-auto text-2xl fill-current text-base-content" />
									<h3 className="!my-0  text-center">Nothing Found</h3>
								</div>
							</>
						)}
					</div>
				</Transition>
			)}
		</div>
	)
}

export default memo(SearchPanel)
