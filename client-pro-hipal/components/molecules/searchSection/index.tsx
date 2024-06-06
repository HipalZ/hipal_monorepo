import HorizontalCard from '@components/atoms/card/horizontalCard'
import { useAllBusiness } from '@components/store/useAllBusiness'
import { useSearch } from '@components/store/useSearch'
import { Transition } from '@headlessui/react'
import { Fragment, memo, useEffect, useMemo, useRef, useState } from 'react'
import { BiDish } from 'react-icons/bi'
import { HiSearch, HiX } from 'react-icons/hi'
import Image from 'next/image'
import { routePaths } from '@components/utils/routes'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getRandomBlurImg } from '@components/utils/images'
import PlaceholderImg from '@components/atoms/placeholder/img'
import CardLG from '@components/atoms/card/cardLG'

// NOTE: A `relative` tag must be added to the parent of this component
function SearchSection({ closeSearchBox }: { closeSearchBox: () => void }) {
	const panel = useRef(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const { searchText, setSearchText } = useSearch()

	const [search, setSearchOpen] = useState(false)

	const router = useRouter()

	const { businessId } = router.query as { businessId: string }

	const togglePopover = (searchText = '') => {
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

		togglePopover(e.target.value)
	}

	const { data } = useAllBusiness()

	const handleClearSearchText = () => {
		setSearchText('')
	}

	let dishData = useMemo(
		() =>
			(data?.dishesData || []).filter((dish) =>
				dish?.name?.toLowerCase()?.includes(searchText?.toLowerCase()),
			),
		[data, searchText],
	)

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

	useEffect(() => {
		const handleMouseDown = (event: MouseEvent) => {
			if (panel && !panel.current?.contains(event.target as Node)) {
				setIsPanelOpen(false)
				closeSearchBox()
			}
		}

		document.addEventListener('mousedown', handleMouseDown)

		return () => {
			document.removeEventListener('mousedown', handleMouseDown)
		}
	}, [closeSearchBox, searchText])

	return (
		<div className='flex flex-row w-full' ref={panel}>
			<div
				className='active:bg-primary-content border-primary bg-base-100 focus-within:border-primary-focus focus-within:shadow focus-within:shadow-primary-focus/25 focus-within:bg-base-100-content max-w-screen flex flex-row w-[110%] min-w-max px-2 py-1.5 !-mx-2 space-x-2 overflow-hidden transition-all border rounded-[1.063rem] z-50 '
				onClick={() => togglePopover(searchText)}
			>
				<input
					type='text'
					placeholder='Search'
					className='w-full px-2 text-sm bg-transparent focus:outline-none'
					value={searchText}
					onChange={handleSearchTextChange}
					onClick={() => setSearchOpen(!search)}
				/>
				{searchText.length > 0 ? (
					<HiX
						className='w-5 h-5 mx-2 my-auto text-sm cursor-pointer text-primary'
						onClick={handleClearSearchText}
					/>
				) : (
					<HiSearch
						className='w-4 h-4 mx-2 my-auto text-sm text-primary'
						onClick={closeSearchBox}
					/>
				)}
			</div>
			{search && (
				<Transition
					as={Fragment}
					show={isPanelOpen}
					enter='transition ease-out duration-200'
					enterFrom='opacity-0 -translate-y-1'
					enterTo='opacity-100 translate-y-0'
					leave='transition ease-in duration-150'
					leaveFrom='opacity-100 translate-y-0'
					leaveTo='opacity-0 -translate-y-1'
				>
					<div
						className='z-50 px-[30px] mx-auto pb-14 '
						style={{
							position: 'absolute',
							top: '2.5rem',
							left: 0,
							width: '100%',
							height: '100vh',
							overflowY: 'auto',
							background: `${data?.settings?.themes.primaryColor}`,
						}}
					>
						{dishData.length > 0 ? (
							filterCategory?.length > 0 ? (
								<div className='mt-1'>
									{/* <DishesTypes hideSubTypes hideMainTypes /> */}
									<div className='flex flex-col mx-2 '>
										{filterCategory?.map((ele, index) => (
											<Link
												href={`${routePaths.category(businessId)}#${ele?._id}`}
												key={index}
												passHref
											>
												<CardLG
													textSize='text-[0.75rem]'
													appendCardClassNames='!rounded-3xl h-[11.5rem] !text-[0.75rem]'
													src={ele?.coverImage}
													text={ele?.name}
													noExplore
												/>
											</Link>
										))}
									</div>
									<div className='relative grid grid-cols-1 !pb-14 mx-2 gap-4'>
										{dishData?.map((ele, index) => (
											<>
												<div key={index} className='relative '>
													<div className='w-[70%] text-[0.875rem] prose mt-4 text-justify'>
														{ele?.name} <br />
													</div>
													<Link
														key={index}
														href={`${routePaths.dish(businessId, ele?._id)}`}
														passHref
														className='border-0'
													>
														<div className='absolute top-0 right-0 text-[0.875rem] '>
															{ele?.images?.length > 0 ? (
																<Image
																	src={ele?.images[0]}
																	alt='dish'
																	height={73}
																	className='!rounded-[0.476rem]'
																	width={73}
																	placeholder='blur'
																	blurDataURL={getRandomBlurImg(110, 110)}
																></Image>
															) : (
																<div>
																	<PlaceholderImg className='absolute top-0 right-0 mr-[1.813rem] mt-10  overflow-hidden' />
																</div>
															)}
														</div>
													</Link>
												</div>
												<hr className='opacity-25 !mt-8 ' />
											</>
										))}
									</div>
								</div>
							) : (
								''
							)
						) : (
							<>
								<div className='flex flex-col py-10 prose'>
									<BiDish className='mx-auto text-2xl fill-current text-base-content' />
									<h3 className='!my-0  text-center'>Nothing Found</h3>
								</div>
							</>
						)}
					</div>
				</Transition>
			)}
		</div>
	)
}

export default memo(SearchSection)
