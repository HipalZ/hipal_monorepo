import { useRouter } from 'next/router'
import { memo, useEffect, useState } from 'react'
import { FiChevronLeft, FiX } from 'react-icons/fi'
import { HiLightBulb, HiSearch } from 'react-icons/hi'
import { useInView } from 'react-intersection-observer'
import SearchPanel from '../searchPanel'
import CallWaiter from '@components/atoms/callTheWaiter'
import QuickFilter from '@components/atoms/quickFilter'
import Link from 'next/link'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'

function Header({
	hideBackBtn: _hideBackBtn,
	onBack,
	backURL,
	title,
	tag,
	showOtherButtons,
	otherButtons,
	noCustomTag,
	children,
}: {
	hideBackBtn?: boolean
	onBack?: () => void
	backURL?: string
	title?: string | JSX.Element | (({ isRounded }: { isRounded: boolean }) => JSX.Element)
	tag?: string
	showOtherButtons?: boolean
	otherButtons?: JSX.Element
	noCustomTag?: boolean
	children?: JSX.Element
}) {
	const router = useRouter()
	const [state, setState] = useState({
		showSearchBox: title ? false : true,
	})
	const [skipReview, setSkipReview] = useState(false)
	const { businessId } = router.query as { businessId: string }
	const [data, setData] = useState({
		roundedHeader: false,
	}) // roundedHeader is false when the header is scrolled to the top
	const {
		ref: headerRef,
		inView,
		entry,
	} = useInView({
		threshold: 1,
	})

	const closeSearchBox = () => {
		if (!title) {
			return
		}
		setState({ ...state, showSearchBox: false })
	}

	const openSearchBox = () => {
		if (!title) {
			return
		}
		setState({ ...state, showSearchBox: true })
	}

	const _onBack = () => {
		if (typeof onBack !== 'undefined') {
			onBack()
		} else {
			if (backURL) {
				router.push(backURL)
			} else {
				router.back()
			}
		}
	}

	const CustomTag = tag ? (`${tag}` as React.ElementType) : ('h4' as React.ElementType)

	useEffect(() => {
		backURL && router.prefetch(`${backURL}`)
		changeHeaderStyle()
	}, [])

	useEffect(() => {
		changeHeaderStyle()
	}, [entry])
	useEffect(() => {
		const pathArr = router.pathname.split('/')
		const review = pathArr[pathArr.length - 1]
		if (review === 'review') {
			setSkipReview(true)
		}
	}, [routePaths[PAGE_TYPES.REVIEW]])
	return (
		<>
			<div
				ref={headerRef}
				className={`bg-base-100 transition-all  sticky -top-1 z-50 flex flex-col -mt-12 space-y-2 text-4xl  ${
					data.roundedHeader ? ' rounded-t-3xl  pt-6 shadow-none' : ' rounded-none pt-6 shadow-lg'
				} ${!children && !data.roundedHeader ? ' pb-6 ' : 'pb-0'}
				`}
			>
				{/* `relative` tag is required for search box */}
				<div className='relative flex flex-row w-full px-6 mx-auto space-x-2 '>
					{/* Back Button */}
					<div className={`flex flex-row w-full space-x-2 ${skipReview ? 'justify-between' : ''}`}>
						{!(
							data.roundedHeader &&
							((!state.showSearchBox && title) || !(!state.showSearchBox && title))
						) && (
							<button
								className={
									'swap swap-rotate my-auto btn btn-ghost !h-8 !min-h-8 aspect-square !px-0 py-0 rounded-full '
								}
								onClick={() => {
									if (title) {
										state.showSearchBox ? closeSearchBox() : _onBack()
									} else {
										_onBack()
									}
								}}
							>
								{title ? (
									<>
										<input
											type='checkbox'
											className='hidden'
											defaultChecked={!state.showSearchBox}
										/>

										<FiChevronLeft className='text-2xl swap-on text-primary' />

										<FiX className='text-2xl swap-off text-primary' />
									</>
								) : !data.roundedHeader ? (
									<>
										<FiChevronLeft className='text-2xl text-primary' />
									</>
								) : (
									<></>
								)}
							</button>
						)}

						{!state.showSearchBox && title ? (
							<div className={`${noCustomTag && 'mx-auto'} flex flex-row my-auto prose capitalize`}>
								{noCustomTag ? (
									<>{title}</>
								) : (
									<CustomTag>
										{typeof title === 'function'
											? title({
													isRounded: data.roundedHeader,
												})
											: title}
									</CustomTag>
								)}
							</div>
						) : (
							<>
								{/* <div className='border-primary bg-base-100 focus-within:border-primary-focus focus-within:shadow focus-within:shadow-primary-focus/25 max-w-screen flex flex-row w-full min-w-full px-2 py-1 !-mr-2 space-x-2 overflow-hidden transition-all border rounded-full'>
								<HiSearch className='mx-2 my-auto text-sm text-primary' onClick={closeSearchBox} />
								<input type='text' placeholder='Search' className='text-sm focus:outline-none' />
							</div> */}

								<SearchPanel closeSearchBox={closeSearchBox} />
							</>
						)}

						{skipReview && (
							<Link
								href={`${routePaths[PAGE_TYPES.EXPLORER](`${businessId}`)}`}
								className='flex justify-self-end'
							>
								<div className='text-center text-primary text-[0.875rem]'>Skip the review</div>
							</Link>
						)}
					</div>

					{!state.showSearchBox && otherButtons && otherButtons}

					{showOtherButtons && (
						<div className='flex flex-row ml-auto '>
							{!state.showSearchBox && (
								<div className='flex pl-2 ml-auto'>
									<div className='mt-1 mr-2'>
										<QuickFilter />
									</div>
									<button
										className='btn btn-ghost bg-base-100 !h-8 !min-h-8 aspect-square !px-1 my-auto  rounded-full'
										onClick={openSearchBox}
									>
										<HiSearch className='text-lg text-primary' />
									</button>
								</div>
							)}

							{/* Filter */}
							<div className='hidden ml-2 '>
								<button className='btn btn-ghost bg-primary !h-8 !min-h-8 aspect-square !px-1 my-auto  rounded-full'>
									<HiLightBulb className='text-lg text-primary-content' />
								</button>
							</div>
						</div>
					)}
				</div>
				{children && <div>{children}</div>}
			</div>
		</>
	)

	function changeHeaderStyle() {
		if ((entry?.boundingClientRect.top as number) < 1) {
			setData({ ...data, roundedHeader: false })
		} else {
			setData({ ...data, roundedHeader: true })
		}
	}
}

export default memo(Header)
